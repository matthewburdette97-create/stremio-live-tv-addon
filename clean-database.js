const fs = require('fs');

const STREAMS_DB = 'streams-database.json';
const RESULTS_FILE = 'stream-validation-results.json';
const BACKUP_FILE = 'streams-database.backup.json';

function cleanDatabase() {
  try {
    console.log('[Cleaning database based on validation results...]\n');

    if (!fs.existsSync(RESULTS_FILE)) {
      console.error('[ERROR] Validation results file not found. Run validate-streams.js first.');
      process.exit(1);
    }

    // Backup original
    const originalDb = fs.readFileSync(STREAMS_DB, 'utf8');
    fs.writeFileSync(BACKUP_FILE, originalDb);
    console.log(`[Backup saved to: ${BACKUP_FILE}]`);

    const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    const db = JSON.parse(originalDb);

    const cleanedDb = {};
    const stats = {
      countries: 0,
      originalStreams: 0,
      keptStreams: 0,
      removedStreams: 0,
      byCountry: {},
    };

    // Build cleaned database with only working streams
    Object.entries(db).forEach(([country, streams]) => {
      const countryResults = results[country];

      if (!countryResults || countryResults.working.length === 0) {
        // Remove country if no working streams
        stats.removedStreams += streams.length;
        return;
      }

      stats.countries++;
      cleanedDb[country] = countryResults.working;

      stats.originalStreams += streams.length;
      stats.keptStreams += countryResults.working.length;
      stats.removedStreams += countryResults.failed.length;

      stats.byCountry[country] = {
        original: streams.length,
        kept: countryResults.working.length,
        removed: countryResults.failed.length,
        percent: Math.round((countryResults.working.length / streams.length) * 100),
      };
    });

    // Save cleaned database
    fs.writeFileSync(STREAMS_DB, JSON.stringify(cleanedDb, null, 2));

    // Report
    console.log(`\n[Database Cleaned]`);
    console.log(`   Countries: ${stats.countries}`);
    console.log(`   Original streams: ${stats.originalStreams}`);
    console.log(`   Kept streams: ${stats.keptStreams} (${Math.round((stats.keptStreams / stats.originalStreams) * 100)}%)`);
    console.log(`   Removed: ${stats.removedStreams}`);

    // Show changes by country
    const sortedCountries = Object.entries(stats.byCountry)
      .sort(([, a], [, b]) => b.removed - a.removed)
      .slice(0, 15);

    if (sortedCountries.length > 0) {
      console.log(`\n[Most Streams Removed (by country)]`);
      sortedCountries.forEach(([country, data]) => {
        console.log(
          `   ${country.padEnd(20)} Kept: ${data.kept}/${data.original} (${data.percent}%) | Removed: ${data.removed}`
        );
      });
    }

    console.log(
      `\n[Cleaned database saved. Backup available at: ${BACKUP_FILE}]`
    );
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanDatabase();

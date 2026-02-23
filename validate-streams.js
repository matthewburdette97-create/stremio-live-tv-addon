const fs = require('fs');
const https = require('https');
const http = require('http');

const STREAMS_DB = 'streams-database.json';
const RESULTS_FILE = 'stream-validation-results.json';
const PARALLEL_CHECKS = 8; // Check 8 streams simultaneously  
const TIMEOUT = 7000; // 7 second timeout per stream
const MAX_STREAMS_PER_COUNTRY = null; // null = check all, or set number to test subset

// Test if a stream URL is accessible
function testStream(url) {
  return new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http;
      const options = {
        method: 'HEAD',
        timeout: TIMEOUT,
      };

      const req = protocol.request(url, options, (res) => {
        req.destroy();
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ status: 'working', code: res.statusCode });
        } else {
          resolve({ status: 'failed', code: res.statusCode });
        }
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 'timeout' });
      });

      req.on('error', () => {
        req.destroy();
        resolve({ status: 'error' });
      });

      req.end();
    } catch (e) {
      resolve({ status: 'error' });
    }
  });
}

async function validateStreams() {
  try {
    console.log('[Starting stream validation...]\n');

    const db = JSON.parse(fs.readFileSync(STREAMS_DB, 'utf8'));
    const results = {};
    const stats = {
      totalStreams: 0,
      tested: 0,
      working: 0,
      failed: 0,
      errors: 0,
      byCountry: {},
    };

    // Flatten all streams with metadata
    const streamQueue = [];
    Object.entries(db).forEach(([country, streams]) => {
      const limit = MAX_STREAMS_PER_COUNTRY || streams.length;
      streams.slice(0, limit).forEach((stream, idx) => {
        streamQueue.push({
          country,
          index: idx,
          title: stream.title,
          url: stream.url,
          logo: stream.logo || null,
        });
        stats.totalStreams++;
      });
    });

    console.log(`[Testing ${stats.totalStreams} streams...]`);
    console.log(`[Running ${PARALLEL_CHECKS} parallel checks]\n`);

    // Process in batches
    for (let i = 0; i < streamQueue.length; i += PARALLEL_CHECKS) {
      const batch = streamQueue.slice(i, i + PARALLEL_CHECKS);
      const batchResults = await Promise.all(
        batch.map((stream) => testStream(stream.url))
      );

      // Process results
      batch.forEach((stream, idx) => {
        const result = batchResults[idx];
        stats.tested++;

        if (!results[stream.country]) {
          results[stream.country] = { working: [], failed: [] };
          stats.byCountry[stream.country] = {
            total: 0,
            working: 0,
            failed: 0,
          };
        }

        stats.byCountry[stream.country].total++;

        if (result.status === 'working') {
          stats.working++;
          stats.byCountry[stream.country].working++;
          results[stream.country].working.push({
            title: stream.title,
            url: stream.url,
            logo: stream.logo,
          });
        } else {
          stats.failed++;
          stats.byCountry[stream.country].failed++;
          results[stream.country].failed.push({
            title: stream.title,
            url: stream.url,
            status: result.status,
          });
        }

        // Progress indicator
        if (stats.tested % 50 === 0) {
          const percent = Math.round((stats.tested / stats.totalStreams) * 100);
          const working = Math.round((stats.working / stats.tested) * 100);
          console.log(
            `[Progress: ${percent}% | Working: ${working}% (${stats.working}/${stats.tested})]`
          );
        }
      });
    }

    console.log('\n');

    // Save validation results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

    // Show results by country
    console.log('[Results by Country (Top 20)]');
    const countries = Object.entries(stats.byCountry)
      .sort(([, a], [, b]) => b.working - a.working)
      .slice(0, 20);

    countries.forEach(([country, data]) => {
      const percent = Math.round((data.working / data.total) * 100);
      const bar = '█'.repeat(Math.round(percent / 5)) + '░'.repeat(20 - Math.round(percent / 5));
      console.log(
        `  ${country.padEnd(20)} ${bar} ${data.working}/${data.total} (${percent}%)`
      );
    });

    // Summary
    const workingPercent = Math.round((stats.working / stats.tested) * 100);
    console.log(`\n[Overall Statistics]`);
    console.log(`   Total streams tested: ${stats.tested}`);
    console.log(`   Working: ${stats.working} (${workingPercent}%)`);
    console.log(`   Failed: ${stats.failed}`);
    console.log(`\n[Detailed results saved to: ${RESULTS_FILE}]`);

    // Show worst performers
    const worstCountries = Object.entries(stats.byCountry)
      .filter(([, data]) => data.total > 5) // Only countries with 5+ streams
      .sort(([, a], [, b]) => (a.working / a.total) - (b.working / b.total))
      .slice(0, 10);

    if (worstCountries.length > 0) {
      console.log(`\n[Worst Performing Countries (5+ streams)]`);
      worstCountries.forEach(([country, data]) => {
        const percent = Math.round((data.working / data.total) * 100);
        console.log(`   ${country}: ${percent}% working (${data.working}/${data.total})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

validateStreams();

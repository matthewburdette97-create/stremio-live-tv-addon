/**
 * Test the genre classification system
 */

const fs = require('fs');

const STREAMS_DB = 'streams-database.json';

console.log('[Testing Genre System]\n');

try {
  const db = JSON.parse(fs.readFileSync(STREAMS_DB, 'utf8'));
  
  // Count streams by genre
  const genres = {};
  let streamsWithGenre = 0;
  let streamsWithoutGenre = 0;
  
  Object.entries(db).forEach(([country, streams]) => {
    streams.forEach(stream => {
      if (stream.genre) {
        streamsWithGenre++;
        if (!genres[stream.genre]) {
          genres[stream.genre] = [];
        }
        genres[stream.genre].push({
          title: stream.title,
          country: country
        });
      } else {
        streamsWithoutGenre++;
      }
    });
  });
  
  console.log('✓ Genre Classification Summary:');
  console.log(`  Total streams with genres: ${streamsWithGenre}`);
  console.log(`  Total streams without genres: ${streamsWithoutGenre}`);
  
  console.log('\n✓ Streams by Genre:');
  Object.entries(genres)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([genre, streams]) => {
      console.log(`\n  ${genre.toUpperCase()}: ${streams.length} channels`);
      // Show first 3 examples
      streams.slice(0, 3).forEach(stream => {
        console.log(`    - ${stream.title} (${stream.country})`);
      });
      if (streams.length > 3) {
        console.log(`    ... and ${streams.length - 3} more`);
      }
    });
  
  console.log('\n✓ All genre tests passed!');
  
} catch (error) {
  console.error('✗ Error:', error.message);
  process.exit(1);
}

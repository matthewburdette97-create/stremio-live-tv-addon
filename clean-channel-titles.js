const fs = require('fs');

const STREAMS_DB = 'streams-database.json';

const db = JSON.parse(fs.readFileSync(STREAMS_DB, 'utf8'));
let cleanedCount = 0;

const patterns = [
  /^Live TV[\s\-:]*/i,
  /^Live\s+/i,
  /^\[Live\]\s*/i,
  /\s+\(Live\)$/i,
  /\s+\[Live\]$/i,
];

for (const country in db) {
  const streams = db[country];
  for (const stream of streams) {
    const original = stream.title;
    let cleaned = stream.title.trim();

    for (const pattern of patterns) {
      cleaned = cleaned.replace(pattern, '').trim();
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    if (cleaned !== original && cleaned.length > 0) {
      stream.title = cleaned;
      cleanedCount++;
    }
  }
}

fs.writeFileSync(STREAMS_DB, JSON.stringify(db, null, 2));

console.log('[Channel Titles Cleaned]');
console.log(`   Total titles cleaned: ${cleanedCount}`);
console.log(`\n[Complete] Database saved with cleaner channel names.`);

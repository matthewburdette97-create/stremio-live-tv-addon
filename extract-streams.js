/**
 * Simple Famelack Stream Extractor
 * 
 * Since Famelack uses JavaScript rendering, this tool helps you:
 * 1. Manually inspect Famelack streams using browser DevTools
 * 2. Save discovered stream URLs to the database
 * 3. Export stream database from browser network inspector
 * 
 * Usage: node extract-streams.js [command] [country] [stream-url]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATABASE_PATH = path.join(__dirname, 'streams-database.json');

// Load existing database
function loadDatabase() {
  try {
    if (fs.existsSync(DATABASE_PATH)) {
      return JSON.parse(fs.readFileSync(DATABASE_PATH, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading database:', error.message);
  }
  return {};
}

// Save database
function saveDatabase(db) {
  fs.writeFileSync(DATABASE_PATH, JSON.stringify(db, null, 2));
  console.log('✓ Database saved');
}

// Add a stream to a country
function addStream(country, title, url) {
  const db = loadDatabase();
  
  if (!db[country]) {
    db[country] = [];
  }
  
  // Check if URL already exists
  if (db[country].find(s => s.url === url)) {
    console.log(`⚠ Stream already exists for ${country}`);
    return;
  }
  
  db[country].push({ title, url });
  saveDatabase(db);
  console.log(`✓ Added "${title}" to ${country}`);
  console.log(`  Total streams for ${country}: ${db[country].length}`);
}

// List streams for a country
function listStreams(country) {
  const db = loadDatabase();
  
  if (!db[country]) {
    console.log(`No streams found for ${country}`);
    return;
  }
  
  console.log(`\n${country} - ${db[country].length} streams:\n`);
  db[country].forEach((stream, i) => {
    console.log(`${i + 1}. ${stream.title}`);
    console.log(`   ${stream.url}\n`);
  });
}

// List all countries
function listCountries() {
  const db = loadDatabase();
  const countries = Object.keys(db).sort();
  
  console.log(`\nCountries in database: ${countries.length}\n`);
  countries.forEach(country => {
    console.log(`${country}: ${db[country].length} streams`);
  });
}

// Interactive mode to add streams
function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\n=== Famelack Stream Database Tool ===\n');
  console.log('To get started:\n');
  console.log('1. Visit https://famelack.com/[country-name]');
  console.log('2. Open DevTools (F12) > Network tab');
  console.log('3. Watch for .m3u8 or streaming URLs');
  console.log('4. Use the commands below to add streams\n');
  console.log('Commands:');
  console.log('  add-stream <country> "<title>" <url>');
  console.log('  list <country>');
  console.log('  countries');
  console.log('  export');
  console.log('  exit\n');
  
  const prompt = () => {
    rl.question('> ', (input) => {
      if (input === 'exit') {
        rl.close();
        return;
      }
      
      const [cmd, ...args] = input.split(' ');
      
      if (cmd === 'add-stream' && args.length >= 3) {
        const country = args[0];
        // Parse title (enclosed in quotes) and URL
        const fullStr = args.slice(1).join(' ');
        const match = fullStr.match(/"([^"]+)"\s+(.+)/);
        if (match) {
          addStream(country, match[1], match[2]);
        }
      } else if (cmd === 'list') {
        listStreams(args[0] || '');
      } else if (cmd === 'countries') {
        listCountries();
      } else if (cmd === 'export') {
        const db = loadDatabase();
        console.log('\n' + JSON.stringify(db, null, 2) + '\n');
      } else if (cmd) {
        console.log('Unknown command. Type "commands" for help.');
      }
      
      prompt();
    });
  };
  
  prompt();
}

// Main
const args = process.argv.slice(2);

if (args.length === 0) {
  interactiveMode();
} else if (args[0] === 'add-stream' && args.length >= 4) {
  const country = args[1];
  const title = args[2];
  const url = args[3];
  addStream(country, title, url);
} else if (args[0] === 'list') {
  listStreams(args[1]);
} else if (args[0] === 'countries') {
  listCountries();
} else if (args[0] === 'export') {
  const db = loadDatabase();
  console.log(JSON.stringify(db, null, 2));
} else {
  console.log('Error: Invalid arguments');
  console.log('Usage: node extract-streams.js [command] [args...]');
  console.log('Run without arguments for interactive mode');
}

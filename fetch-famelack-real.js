/**
 * Fetch Real Streams from Famelack's Official GitHub Repository
 * 
 * This script downloads Famelack's official channel data and converts it
 * to our streams database format using actual working stream URLs.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Country codes to fetch
const COUNTRIES = ['in', 'gb', 'us', 'au', 'ca', 'br', 'mx', 'fr', 'de', 'es', 'it', 'jp', 'ru'];

const COUNTRY_NAMES = {
  'in': 'India',
  'gb': 'UK',
  'us': 'USA',
  'au': 'Australia',
  'ca': 'Canada',
  'br': 'Brazil',
  'mx': 'Mexico',
  'fr': 'France',
  'de': 'Germany',
  'es': 'Spain',
  'it': 'Italy',
  'jp': 'Japan',
  'ru': 'Russia'
};

const OUTPUT_FILE = path.join(__dirname, 'streams-database.json');

function fetchCountryChannels(countryCode) {
  return new Promise((resolve) => {
    console.log(`Fetching ${COUNTRY_NAMES[countryCode]} (${countryCode})...`);
    
    const url = `https://raw.githubusercontent.com/famelack/famelack-channels/main/channels/compressed/countries/${countryCode}.json`;
    
    const curl = spawn('curl', ['-s', url]);
    const gunzip = spawn('gunzip');
    
    let output = '';

    // Pipe curl to gunzip
    curl.stdout.pipe(gunzip.stdin);
    
    gunzip.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    gunzip.on('close', () => {
      try {
        const channels = JSON.parse(output);
        
        // Extract streams that have IPTV URLs
        const streams = [];
        channels.forEach(channel => {
          if (channel.iptv_urls && channel.iptv_urls.length > 0) {
            streams.push({
              title: channel.name,
              url: channel.iptv_urls[0]
            });
          }
        });
        
        console.log(`  ✓ Found ${streams.length} streams`);
        resolve({ country: COUNTRY_NAMES[countryCode], streams });
      } catch (error) {
        console.error(`  Error parsing ${countryCode}:`, error.message);
        resolve({ country: COUNTRY_NAMES[countryCode], streams: [] });
      }
    });
    
    curl.on('error', (error) => {
      console.error(`  Error fetching ${countryCode}:`, error.message);
      resolve({ country: COUNTRY_NAMES[countryCode], streams: [] });
    });
  });
}

async function main() {
  console.log('Fetching real streams from Famelack GitHub...\n');
  
  const allStreams = {};
  
  for (const countryCode of COUNTRIES) {
    const { country, streams } = await fetchCountryChannels(countryCode);
    if (streams.length > 0) {
      allStreams[country] = streams;
    }
  }
  
  // Save to file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allStreams, null, 2));
  
  let totalStreams = 0;
  Object.values(allStreams).forEach(streams => {
    totalStreams += streams.length;
  });
  
  console.log(`\n✓ Database saved to ${OUTPUT_FILE}`);
  console.log(`✓ Total countries: ${Object.keys(allStreams).length}`);
  console.log(`✓ Total streams: ${totalStreams}`);
  console.log('\nRestart the add-on to load the new streams:');
  console.log('  npm start');
}

main().catch(console.error);

const fs = require('fs');
const path = require('path');
const https = require('https');

// List of m3u8 files by country in the ChinaIPTV repo
const countryFiles = [
  { country: 'China', file: 'cnTV_AutoUpdate.m3u8' },
  { country: 'USA', file: 'USA.m3u8' },
  { country: 'UK', file: 'UK.m3u8' },
  { country: 'Russia', file: 'Russia.m3u8' },
  { country: 'Japan', file: 'Japan.m3u8' },
  { country: 'South Korea', file: 'southKorea.m3u8' },
  { country: 'Singapore', file: 'Singapore.m3u8' },
  { country: 'Taiwan', file: 'TaiWan.m3u8' },
  { country: 'Hong Kong', file: 'HongKong.m3u8' },
  { country: 'Macao', file: 'Macao.m3u8' },
  { country: 'North Korea', file: 'NorthKorea.m3u8' }
];

const BASE_URL = 'https://raw.githubusercontent.com/hujingguang/ChinaIPTV/main/';

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function parseM3U(content, countryName) {
  const lines = content.split('\n');
  const streams = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // M3U format: #EXTINF:-1,Channel Name
    // next line: URL
    if (line.startsWith('#EXTINF')) {
      const nameMatch = line.match(/,(.+)$/);
      const title = nameMatch ? nameMatch[1].trim() : `Channel ${streams.length + 1}`;
      
      const url = (lines[i + 1] || '').trim();
      if (url && url.startsWith('http')) {
        streams.push({ title, url });
        i++; // Skip the URL line
      }
    }
  }
  
  return streams;
}

async function scrapeAndMerge() {
  const dbPath = path.join(__dirname, 'streams-database.json');
  let currentDb = {};
  
  try {
    currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    console.log('Creating new database...');
  }

  const newData = { ...currentDb };
  let addedCount = 0;

  for (const { country, file } of countryFiles) {
    try {
      console.log(`Fetching ${country}...`);
      const url = BASE_URL + file;
      const content = await fetchFile(url);
      const streams = parseM3U(content, country);
      
      if (streams.length > 0) {
        newData[country] = streams;
        addedCount += streams.length;
        console.log(`✓ ${country}: ${streams.length} channels`);
      }
    } catch (error) {
      console.log(`✗ ${country}: ${error.message}`);
    }
  }

  // Save updated database
  fs.writeFileSync(dbPath, JSON.stringify(newData, null, 2));
  
  console.log(`\n✓ Complete!`);
  console.log(`Total countries: ${Object.keys(newData).length}`);
  console.log(`Total channels added: ${addedCount}`);
}

scrapeAndMerge().catch(console.error);

const fs = require('fs');
const https = require('https');

const API_BASE = 'https://iptv-org.github.io/api';

// Fetch JSON from URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching ${url}...`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Convert ISO country code to country name
const countryNames = {
  'US': 'USA',
  'GB': 'UK',
  'CN': 'China',
  'RU': 'Russia',
  'IN': 'India',
  'JP': 'Japan',
  'BR': 'Brazil',
  'FR': 'France',
  'DE': 'Germany',
  'IT': 'Italy',
  'ES': 'Spain',
  'CA': 'Canada',
  'AU': 'Australia',
  'MX': 'Mexico',
  'KR': 'South Korea',
  'TR': 'Turkey',
  'KH': 'Cambodia',
  'VN': 'Vietnam',
  'TH': 'Thailand',
  'PH': 'Philippines',
  'ID': 'Indonesia',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'HK': 'Hong Kong',
  'TW': 'Taiwan',
  'MO': 'Macao',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'GR': 'Greece',
  'PT': 'Portugal',
  'NZ': 'New Zealand',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'SA': 'Saudi Arabia',
  'AE': 'United Arab Emirates',
  'IL': 'Israel',
  'IR': 'Iran',
  'KP': 'North Korea',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'LK': 'Sri Lanka',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'UY': 'Uruguay',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'EC': 'Ecuador',
  'VE': 'Venezuela',
  'UZ': 'Uzbekistan',
  'KZ': 'Kazakhstan',
  'TJ': 'Tajikistan',
  'TM': 'Turkmenistan',
  'KG': 'Kyrgyzstan',
  'AF': 'Afghanistan',
  'AL': 'Albania',
  'AD': 'Andorra',
  'AZ': 'Azerbaijan',
  'BY': 'Belarus',
  'BA': 'Bosnia and Herzegovina',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'CY': 'Cyprus',
  'EE': 'Estonia',
  'GE': 'Georgia',
  'IS': 'Iceland',
  'IE': 'Ireland',
  'XK': 'Kosovo',
  'LV': 'Latvia',
  'LI': 'Liechtenstein',
  'LT': 'Lithuania',
  'LU': 'Luxembourg',
  'MK': 'Macedonia',
  'MT': 'Malta',
  'MD': 'Moldova',
  'MC': 'Monaco',
  'ME': 'Montenegro',
  'RO': 'Romania',
  'SM': 'San Marino',
  'RS': 'Serbia',
  'SK': 'Slovakia',
  'SI': 'Slovenia',
  'UA': 'Ukraine',
};

async function scrapeIPTVOrg() {
  try {
    console.log('[Starting iptv-org scraping...]\n');

    // Fetch all data
    const [streams, channels, logos, countries] = await Promise.all([
      fetchJSON(`${API_BASE}/streams.json`),
      fetchJSON(`${API_BASE}/channels.json`),
      fetchJSON(`${API_BASE}/logos.json`),
      fetchJSON(`${API_BASE}/countries.json`),
    ]);

    console.log(`\n[Fetched ${streams.length} streams]`);
    console.log(`[Fetched ${channels.length} channels]`);
    console.log(`[Fetched ${logos.length} logos]`);

    // Create lookup maps
    const channelMap = {};
    channels.forEach(ch => {
      channelMap[ch.id] = ch;
    });

    const logoMap = {};
    logos.forEach(logo => {
      if (!logoMap[logo.channel]) logoMap[logo.channel] = [];
      logoMap[logo.channel].push(logo);
    });

    // Group streams by country
    const streamsByCountry = {};

    streams.forEach(stream => {
      if (!stream.url || !stream.title) return;

      const channel = channelMap[stream.channel];
      if (!channel || !channel.country) return;

      const countryName = countryNames[channel.country] || channel.country;
      if (!streamsByCountry[countryName]) {
        streamsByCountry[countryName] = [];
      }

      // Get logo for this channel
      let logo = null;
      if (logoMap[stream.channel]) {
        const primaryLogo = logoMap[stream.channel].find(l => l.tags && l.tags.includes('horizontal'));
        logo = (primaryLogo || logoMap[stream.channel][0]).url;
      }

      const streamObj = {
        title: stream.title,
        url: stream.url,
      };
      if (logo) streamObj.logo = logo;
      if (stream.quality) streamObj.quality = stream.quality;

      streamsByCountry[countryName].push(streamObj);
    });

    // Load existing database
    let existingDB = {};
    if (fs.existsSync('streams-database.json')) {
      existingDB = JSON.parse(fs.readFileSync('streams-database.json', 'utf8'));
    }

    // Merge new streams with existing (new ones take priority)
    const mergedDB = { ...existingDB };
    let totalAdded = 0;
    
    Object.entries(streamsByCountry).forEach(([country, newStreams]) => {
      // Deduplicate by URL within country
      const existingUrls = new Set((mergedDB[country] || []).map(s => s.url));
      const uniqueNew = newStreams.filter(s => !existingUrls.has(s.url));
      
      if (mergedDB[country]) {
        mergedDB[country] = [...uniqueNew, ...mergedDB[country]]; // New first
      } else {
        mergedDB[country] = newStreams;
      }
      
      console.log(`[${country}: ${uniqueNew.length} new streams (${mergedDB[country].length} total)]`);
      totalAdded += uniqueNew.length;
    });

    // Save merged database
    fs.writeFileSync('streams-database.json', JSON.stringify(mergedDB, null, 2));

    const totalCountries = Object.keys(mergedDB).length;
    const totalStreams = Object.values(mergedDB).reduce((sum, arr) => sum + arr.length, 0);
    const withLogos = Object.values(mergedDB)
      .flat()
      .filter(s => s.logo)
      .length;

    console.log(`\n[Database Updated]`);
    console.log(`   Total countries: ${totalCountries}`);
    console.log(`   Total streams: ${totalStreams}`);
    console.log(`   With logos: ${withLogos}`);
    console.log(`   New streams added: ${totalAdded}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

scrapeIPTVOrg();

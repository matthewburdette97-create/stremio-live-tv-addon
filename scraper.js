/**
 * Famelack Stream Scraper - Enhanced Version
 * 
 * This script scrapes actual working stream URLs from Famelack.com
 * by visiting direct channel pages and extracting video sources
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Target channels with their Famelack URLs
const CHANNELS = [
  { name: 'Bharat24', country: 'India', url: 'https://famelack.com/in/e6g1e4Iv5eLah5' },
  { name: 'BBC News', country: 'UK', url: 'https://famelack.com/uk' },
];

const OUTPUT_FILE = path.join(__dirname, 'streams-database.json');

async function scrapeChannel(browser, channel) {
  console.log(`Scraping ${channel.name} from ${channel.country}...`);
  
  try {
    const page = await browser.newPage();
    
    // Intercept and log network requests
    await page.on('response', response => {
      const url = response.url();
      // Look for m3u8, mp4, or stream URLs
      if (url.includes('.m3u8') || url.includes('.mp4') || url.includes('stream')) {
        console.log(`  Found potential stream: ${url.substring(0, 100)}`);
      }
    });
    
    await page.goto(channel.url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for video player to load
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
    
    // Try to find video sources in the page
    const sources = await page.evaluate(() => {
      const results = [];
      
      // Look for video tags
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        const sources = video.querySelectorAll('source');
        sources.forEach(source => {
          if (source.src) results.push({ type: 'video source', url: source.src });
        });
      });
      
      // Look for HLS streams in script tags
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        const content = script.textContent || script.innerHTML;
        
        // Find m3u8 URLs
        const m3u8Matches = content.match(/(https?:\/\/[^"'\s<>]{20,}\.m3u8[^"'\s<>]*)/gi) || [];
        m3u8Matches.forEach(url => results.push({ type: 'm3u8', url }));
        
        // Find mp4 URLs
        const mp4Matches = content.match(/(https?:\/\/[^"'\s<>]{20,}\.mp4[^"'\s<>]*)/gi) || [];
        mp4Matches.forEach(url => results.push({ type: 'mp4', url }));
      });
      
      return results;
    });
    
    await page.close();
    
    if (sources.length > 0) {
      console.log(`  ✓ Found ${sources.length} potential streams`);
      return sources;
    } else {
      console.log(`  No direct streams found (may be embedded/blob)`);
      return [];
    }
  } catch (error) {
    console.error(`  Error scraping ${channel.name}:`, error.message);
    return [];
  }
}

async function main() {
  console.log('Starting enhanced Famelack stream scraper...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const allStreams = {};
    
    for (const channel of CHANNELS) {
      const sources = await scrapeChannel(browser, channel);
      
      if (sources.length > 0) {
        if (!allStreams[channel.country]) {
          allStreams[channel.country] = [];
        }
        
        // Add the first found source to our database
        allStreams[channel.country].push({
          title: channel.name,
          url: sources[0].url
        });
      }
    }
    
    // Save to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allStreams, null, 2));
    
    const totalCountries = Object.keys(allStreams).length;
    console.log(`\n✓ Streams saved to ${OUTPUT_FILE}`);
    console.log(`✓ Total countries with streams: ${totalCountries}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();
        m3u8Matches.forEach(url => {
          if (!streamArray.find(s => s.url === url)) {
            streamArray.push({
              title: `Stream ${streamArray.length + 1}`,
              url: url
            });
          }
        });
        
        // Find play URLs and streaming endpoints
        const playMatches = content.match(/(https?:\/\/[^"'\s<>]{40,})/gi) || [];
        playMatches.forEach(url => {
          if ((url.includes('play') || url.includes('stream') || url.includes('video')) && 
              !streamArray.find(s => s.url === url)) {
            streamArray.push({
              title: `Stream ${streamArray.length + 1}`,
              url: url
            });
          }
        });
      });
      
      // Also check iframe src attributes
      document.querySelectorAll('iframe').forEach(iframe => {
        const src = iframe.src;
        if (src && !streamArray.find(s => s.url === src)) {
          streamArray.push({
            title: `Player ${streamArray.length + 1}`,
            url: src
          });
        }
      });
      
      // Look for video sources
      document.querySelectorAll('video source').forEach(source => {
        const src = source.src;
        if (src && !streamArray.find(s => s.url === src)) {
          streamArray.push({
            title: `Video ${streamArray.length + 1}`,
            url: src
          });
        }
      });
      
      // Check data attributes
      document.querySelectorAll('[data-src], [data-video], [data-stream]').forEach(elem => {
        const src = elem.getAttribute('data-src') || 
                   elem.getAttribute('data-video') || 
                   elem.getAttribute('data-stream');
        if (src && !streamArray.find(s => s.url === src)) {
          streamArray.push({
            title: `Stream ${streamArray.length + 1}`,
            url: src
          });
        }
      });
      
      return streamArray;
    });
    
    await page.close();
    
    if (streams.length > 0) {
      console.log(`  Found ${streams.length} streams`);
      return { country, streams };
    } else {
      console.log(`  No streams found for ${country}`);
      return { country, streams: [] };
    }
  } catch (error) {
    console.error(`  Error scraping ${country}:`, error.message);
    return { country, streams: [] };
  }
}

async function main() {
  console.log('Starting Famelack stream scraper...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Scrape each country
    const results = {};
    for (const country of COUNTRIES) {
      const { country: countryName, streams } = await scrapeCountry(browser, country);
      if (streams.length > 0) {
        results[countryName.charAt(0).toUpperCase() + countryName.slice(1)] = streams;
      }
    }
    
    // Save results to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n✓ Streams saved to ${OUTPUT_FILE}`);
    console.log(`✓ Total countries with streams: ${Object.keys(results).length}`);
    
  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the scraper
main().catch(console.error);

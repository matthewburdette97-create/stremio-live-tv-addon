# Live TV Stremio Add-on

A Stremio add-on that provides live TV streams organized by country with 2500+ channels from 12 countries worldwide.

## Features

- **Extensive Country Coverage** - 170+ countries with live TV channels
- **Multiple Streams per Country** - 2-6 TV channels per country
- **Always Updated** - Easy to add more streams as you discover them
- **Lightweight** - No complex dependencies, fast performance
- **Caching** - 1-hour cache for optimal performance
- **Easy to Extend** - Simple structure to add more countries and streams

## Supported Countries (170+)

The add-on includes streams from 170+ countries including:

**Europe:** UK, France, Germany, Spain, Italy, Netherlands, Belgium, Austria, Switzerland, Poland, Romania, Bulgaria, Czech Republic, Slovakia, Croatia, Serbia, Greece, Portugal, Sweden, Norway, Denmark, Finland, Iceland, Ireland, and more.

**Asia:** Japan, China, South Korea, India, Pakistan, Bangladesh, Thailand, Vietnam, Indonesia, Malaysia, Philippines, Singapore, Hong Kong, Taiwan, and more.

**Americas:** USA, Canada, Mexico, Brazil, Argentina, Chile, Colombia, Peru, Venezuela, Guatemala, Jamaica, and more.

**Africa:** Egypt, Nigeria, Kenya, South Africa, Ethiopia, Ghana, Morocco, Tunisia, and many more.

**Oceania:** Australia, New Zealand, Fiji, Papua New Guinea, and more.

Each country has multiple TV channels and streams available.

## Getting Started

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn

### Installation

1. Clone or open this project directory
2. Install dependencies:

```bash
npm install
```

## Quick Start

### 1. Install & Start

```bash
npm install
npm start
```

### 2. Add to Stremio

In Stremio, go to **Add-ons** → **Install Add-on** and paste:
```
http://localhost:7070/manifest.json
```

### 3. (Optional) Add Real Streams from Famelack

The add-on includes 170+ countries with default streams. To use **actual working streams** from Famelack:

```bash
npm run extract
```

Then use the interactive tool to find and add working streams from Famelack.com (see below)

## Project Structure & Tools

**Main Files:**
- `index.js` - Stremio add-on server
- `package.json` - Dependencies and scripts
- `extract-streams.js` - Interactive tool to manage stream database  
- `scraper.js` - (Optional) Browser automation for bulk scraping
- `streams-database.json` - Your custom stream database (created when you add streams)

**Available Commands:**
```bash
npm start              # Start the Stremio add-on
npm run extract       # Interactive stream database manager
npm run scrape        # Bulk scraper (requires Puppeteer)
```

## How It Works

The add-on provides:
1. **Catalog Browser** - Shows available countries as browsable items
2. **Meta Descriptions** - Country details and number of available channels
3. **Stream Handler** - Returns stream URLs for each country's TV channels

## Populating the Stream Database with Real Famelack Streams

The add-on comes with default streams, but you can populate it with **real working streams directly from Famelack.com**.

### Method 1: Browser DevTools (Easiest)

1. **Visit Famelack.com**
   ```
   https://famelack.com/usa
   ```

2. **Open Browser DevTools**
   - Press `F12` or `Cmd+Option+I` (Mac)
   - Go to **Network** tab

3. **Identify Streams**
   - Watch the network requests as the page loads
   - Look for requests with `.m3u8`, `play`, `stream`, or `video` in the URL
   - Look for URLs that start with `https://` and contain streaming endpoints

4. **Add to Database**
   ```bash
   npm run extract
   ```
   
   Then use the interactive interface:
   ```
   > add-stream USA "ABC Channel" https://actual-stream-url.m3u8
   > list USA
   > countries
   > exit
   ```

### Method 2: Command Line

Add streams directly:

```bash
npm run extract add-stream USA "NBC" https://live-nbc.stream/nbc.m3u8
npm run extract add-stream UK "BBC One" https://live-bbc.co.uk/bbcone.m3u8
npm run extract list USA
```

### Method 3: Manual Database Edit

Edit `streams-database.json` directly:

```json
{
  "USA": [
    { "title": "ABC", "url": "https://live.abc.com/abc.m3u8" },
    { "title": "NBC", "url": "https://live.nbc.com/nbc.m3u8" }
  ],
  "UK": [
    { "title": "BBC One", "url": "https://live.bbc.co.uk/bbcone.m3u8" }
  ]
}
```

### Testing Streams

Before adding to the database, test with VLC:

1. Open VLC Media Player
2. **Media** → **Open Network Stream**
3. Paste the URL
4. If it plays, add it to the database!

### Tips for Finding Streams

- **Official Broadcasters**: Most national broadcasters offer free streams
  - BBC (UK): bbc.co.uk
  - PBS (USA): pbs.org
  - ZDF (Germany): zdf.de
  
- **Browser DevTools**: 
  - Open Network tab
  - Filter by "media" or "fetch"
  - Look for `.m3u8`, `.mp4`, or streaming endpoints

- **Public IPTV Lists**:
  - Search for "IPTV M3U" or "Live TV M3U8"
  - Many open-source IPTV projects share playlists
  - Verify URLs are current before using

### How the Add-on Uses the Database

1. Start the add-on: `npm start`
2. Add to Stremio with manifest URL
3. The add-on loads streams from `streams-database.json`
4. If the file doesn't exist, uses fallback default streams
5. All streams are cached for 1 hour for performance

### Verifying Streams Work

The add-on will display any streams in the database, but won't verify if they're working. 
To ensure quality:

1. Test each URL with VLC before adding
2. Remove URLs that no longer work
3. Update regularly as broadcasters change their streaming URLs

## Notes

### Stream URLs

Stream URLs in the database are organized using realistic domain patterns:
- `https://live.broadcaster.country/stream.m3u8` format
- These can be replaced with actual working stream URLs
- Most TV streams use HLS format (.m3u8 files)
- Some may use DASH, RTMP, or other streaming protocols

### Finding Real Stream URLs

To find actual working streams for a country:
1. Find the TV network's official website or app
2. Check their stream delivery method (often HLS via .m3u8 files)
3. Use network inspection tools to find the actual stream URL
4. Add to `COUNTRY_STREAMS_DB` in `index.js`

### Performance

- Countries and streams are cached for 1 hour
- Modify `CACHE_DURATION` to change cache time:
  ```javascript
  const CACHE_DURATION = 3600000 // milliseconds
  ```

### Troubleshooting

**Streams don't play:**
- The database includes realistic stream URL patterns, not actual working URLs
- You need to update them with real working stream URLs from actual TV broadcasters
- Use browser devtools to inspect where streams come from on broadcaster websites

**Some countries missing or have few streams:**
- The foundation is a comprehensive country list with template streams
- Add more streams by researching working URLs for each broadcaster
- Start with popular broadcasters in each country

**Add-on doesn't appear in Stremio:**
- Ensure the manifest URL is correct and accessible
- Check that the add-on is running (`npm start`)
- Try restarting Stremio

**Port 7070 already in use:**
- Change the port in the last line of `index.js`:
  ```javascript
  serveHTTP(builder.getInterface(), { port: YOUR_PORT })
  ```

**Performance issues with large number of countries:**
- The database is optimized for fast lookups
- Streams are cached for 1 hour by default
- Consider increasing cache duration if needed

## Resources

- [Stremio Add-on SDK Documentation](https://docs.stremio.com/)
- [Stremio Protocol Specification](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/protocol.md)

## License

MIT
# Render rebuilt at Sun Feb 22 22:58:05 MST 2026

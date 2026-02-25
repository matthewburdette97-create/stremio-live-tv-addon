const fs = require('fs');
const https = require('https');
const http = require('http');

/**
 * Stream Versioning System
 * Maintains multiple URLs per stream with priority levels and fallback support
 */

class StreamVersionManager {
  constructor(dbPath = 'streams-database-versioned.json') {
    this.dbPath = dbPath;
    this.db = this.loadDatabase();
  }

  loadDatabase() {
    try {
      if (fs.existsSync(this.dbPath)) {
        return JSON.parse(fs.readFileSync(this.dbPath, 'utf8'));
      }
    } catch (error) {
      console.warn(`Could not load versioned database: ${error.message}`);
    }
    return {};
  }

  saveDatabase() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.db, null, 2));
  }

  /**
   * Add a new version/mirror for a stream
   */
  addStreamVersion(country, streamTitle, url, priority = 2) {
    if (!this.db[country]) {
      this.db[country] = [];
    }

    let stream = this.db[country].find(s => s.title === streamTitle);
    
    if (!stream) {
      stream = {
        title: streamTitle,
        urls: [],
        genre: 'general',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        stats: {
          totalChecks: 0,
          successCount: 0,
          failureCount: 0,
          uptime: 100
        }
      };
      this.db[country].push(stream);
    }

    // Check if URL already exists
    const existingUrl = stream.urls.find(u => u.url === url);
    if (existingUrl) {
      console.log(`URL already exists for ${streamTitle}`);
      return;
    }

    // Add new version
    stream.urls.push({
      url,
      priority,
      active: true,
      lastChecked: null,
      status: 'untested',
      responseTime: null,
      failCount: 0,
      successCount: 0,
      addedAt: new Date().toISOString()
    });

    // Sort by priority
    stream.urls.sort((a, b) => a.priority - b.priority);
    stream.lastUpdated = new Date().toISOString();
    
    this.saveDatabase();
    console.log(`Added version for ${streamTitle} with priority ${priority}`);
  }

  /**
   * Get the best available URL for a stream
   */
  getBestUrl(country, streamTitle) {
    const stream = this.db[country]?.find(s => s.title === streamTitle);
    if (!stream || !stream.urls.length) {
      return null;
    }

    // Return first active, working URL
    const working = stream.urls.find(u => u.active && u.status === 'working');
    if (working) return working.url;

    // Otherwise return highest priority active URL
    const active = stream.urls.find(u => u.active);
    return active?.url || null;
  }

  /**
   * Test a specific URL version
   */
  async testStreamUrl(url) {
    return new Promise((resolve) => {
      try {
        const protocol = url.startsWith('https') ? https : http;
        const startTime = Date.now();

        const timeoutHandle = setTimeout(() => {
          req.destroy();
          resolve({ status: 'timeout', responseTime: null });
        }, 8000);

        const options = { method: 'HEAD', timeout: 8000 };

        const req = protocol.request(url, options, (res) => {
          clearTimeout(timeoutHandle);
          const responseTime = Date.now() - startTime;
          req.destroy();
          
          if (res.statusCode >= 200 && res.statusCode < 400) {
            resolve({ status: 'working', code: res.statusCode, responseTime });
          } else if (res.statusCode >= 500) {
            resolve({ status: 'server_error', code: res.statusCode, responseTime });
          } else {
            resolve({ status: 'failed', code: res.statusCode, responseTime });
          }
        });

        req.on('error', () => {
          clearTimeout(timeoutHandle);
          resolve({ status: 'error', responseTime: null });
        });

        req.end();
      } catch (e) {
        resolve({ status: 'error', responseTime: null });
      }
    });
  }

  /**
   * Validate all versions of a specific stream
   */
  async validateStream(country, streamTitle) {
    const stream = this.db[country]?.find(s => s.title === streamTitle);
    if (!stream) {
      console.log(`Stream not found: ${streamTitle} in ${country}`);
      return;
    }

    console.log(`\nTesting versions for ${streamTitle}:`);
    
    let workingCount = 0;
    let totalTests = 0;

    for (const urlVersion of stream.urls) {
      const result = await this.testStreamUrl(urlVersion.url);
      totalTests++;

      urlVersion.lastChecked = new Date().toISOString();
      urlVersion.status = result.status;
      urlVersion.responseTime = result.responseTime;

      if (result.status === 'working') {
        urlVersion.successCount++;
        workingCount++;
        console.log(`  ✓ Priority ${urlVersion.priority}: ${result.status} (${result.responseTime}ms)`);
      } else {
        urlVersion.failCount++;
        console.log(`  ✗ Priority ${urlVersion.priority}: ${result.status}`);
      }

      stream.stats.totalChecks++;
      if (result.status === 'working') {
        stream.stats.successCount++;
      } else {
        stream.stats.failureCount++;
      }
    }

    stream.stats.uptime = Math.round((stream.stats.successCount / stream.stats.totalChecks) * 100);
    stream.lastUpdated = new Date().toISOString();

    console.log(`  Summary: ${workingCount}/${totalTests} versions working (${stream.stats.uptime}% uptime)`);
    
    this.saveDatabase();
  }

  /**
   * Validate all streams in a country
   */
  async validateCountry(country) {
    if (!this.db[country]) {
      console.log(`Country not found: ${country}`);
      return;
    }

    console.log(`\n========== Validating ${country} Streams ==========\n`);
    
    for (const stream of this.db[country]) {
      await this.validateStream(country, stream.title);
    }

    this.printCountrySummary(country);
  }

  /**
   * Validate all streams globally
   */
  async validateAll() {
    console.log('\n========== Global Stream Validation ==========\n');
    
    for (const country of Object.keys(this.db)) {
      await this.validateCountry(country);
    }

    this.printGlobalSummary();
  }

  /**
   * Print summary for a country
   */
  printCountrySummary(country) {
    const streams = this.db[country];
    
    console.log(`\n[${country} Summary]`);
    console.log(`  Total Streams: ${streams.length}`);
    
    const healthy = streams.filter(s => s.stats.uptime >= 80).length;
    const degraded = streams.filter(s => s.stats.uptime >= 50 && s.stats.uptime < 80).length;
    const critical = streams.filter(s => s.stats.uptime < 50).length;

    console.log(`  Healthy (80%+): ${healthy}`);
    console.log(`  Degraded (50-79%): ${degraded}`);
    console.log(`  Critical (<50%): ${critical}`);
  }

  /**
   * Print global summary
   */
  printGlobalSummary() {
    console.log(`\n========== GLOBAL SUMMARY ==========\n`);
    
    let totalStreams = 0;
    let totalVersions = 0;
    let workingVersions = 0;

    for (const country in this.db) {
      const streams = this.db[country];
      totalStreams += streams.length;
      
      for (const stream of streams) {
        totalVersions += stream.urls.length;
        workingVersions += stream.urls.filter(u => u.status === 'working').length;
      }
    }

    const coverage = totalVersions > 0 ? Math.round((workingVersions / totalVersions) * 100) : 0;
    
    console.log(`Total Countries: ${Object.keys(this.db).length}`);
    console.log(`Total Streams: ${totalStreams}`);
    console.log(`Total Versions: ${totalVersions}`);
    console.log(`Working Versions: ${workingVersions}`);
    console.log(`Coverage: ${coverage}%`);
  }

  /**
   * Export as simple format (for manifest)
   */
  exportSimplified() {
    const simple = {};
    
    for (const country in this.db) {
      simple[country] = this.db[country].map(stream => ({
        title: stream.title,
        url: this.getBestUrl(country, stream.title),
        genre: stream.genre
      })).filter(s => s.url); // Remove streams with no working URL
    }

    return simple;
  }

  /**
   * Get detailed report for a stream
   */
  getStreamReport(country, streamTitle) {
    const stream = this.db[country]?.find(s => s.title === streamTitle);
    if (!stream) return null;

    return {
      title: stream.title,
      country,
      uptime: `${stream.stats.uptime}%`,
      successCount: stream.stats.successCount,
      failureCount: stream.stats.failureCount,
      totalChecks: stream.stats.totalChecks,
      versions: stream.urls.map(u => ({
        url: u.url.substring(0, 50) + '...',
        priority: u.priority,
        status: u.status,
        responseTime: u.responseTime,
        lastChecked: u.lastChecked,
        successRate: u.successCount + u.failCount > 0 
          ? Math.round((u.successCount / (u.successCount + u.failCount)) * 100) + '%'
          : 'untested'
      })),
      lastUpdated: stream.lastUpdated
    };
  }
}

// CLI Usage
if (require.main === module) {
  const manager = new StreamVersionManager();

  const command = process.argv[2];
  const country = process.argv[3];
  const streamTitle = process.argv[4];
  const url = process.argv[5];
  const priority = parseInt(process.argv[6]) || 2;

  switch (command) {
    case 'add':
      if (!country || !streamTitle || !url) {
        console.log('Usage: add <country> <stream-title> <url> [priority]');
        process.exit(1);
      }
      manager.addStreamVersion(country, streamTitle, url, priority);
      break;

    case 'test':
      if (!country) {
        manager.validateAll().then(() => process.exit(0));
      } else if (streamTitle) {
        manager.validateStream(country, streamTitle).then(() => process.exit(0));
      } else {
        manager.validateCountry(country).then(() => process.exit(0));
      }
      break;

    case 'report':
      if (!country || !streamTitle) {
        console.log('Usage: report <country> <stream-title>');
        process.exit(1);
      }
      const report = manager.getStreamReport(country, streamTitle);
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'export':
      const simplified = manager.exportSimplified();
      console.log(JSON.stringify(simplified, null, 2));
      break;

    default:
      console.log(`
Stream Versioning System

Usage:
  node stream-versioning.js add <country> <title> <url> [priority]
  node stream-versioning.js test [country] [stream-title]
  node stream-versioning.js report <country> <stream-title>
  node stream-versioning.js export

Examples:
  node stream-versioning.js add Japan "J SPORTS 1" "https://nl.utako.moe/js1/..." 1
  node stream-versioning.js test Japan "J SPORTS 1"
  node stream-versioning.js test Japan
  node stream-versioning.js test
  node stream-versioning.js report Japan "J SPORTS 1"
  node stream-versioning.js export > streams-database.json
      `);
  }
}

module.exports = StreamVersionManager;

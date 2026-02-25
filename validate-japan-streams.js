const fs = require('fs');
const https = require('https');
const http = require('http');

const STREAMS_DB = 'streams-database.json';
const RESULTS_FILE = 'japan-streams-validation.json';
const PARALLEL_CHECKS = 5;
const TIMEOUT = 8000; // 8 seconds for international streams

// Test if a stream URL is accessible and measure response time
function testStream(url) {
  return new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http;
      const startTime = Date.now();

      const timeoutHandle = setTimeout(() => {
        req.destroy();
        resolve({ status: 'timeout', responseTime: null });
      }, TIMEOUT);

      const options = {
        method: 'HEAD',
        timeout: TIMEOUT,
      };

      const req = protocol.request(url, options, (res) => {
        clearTimeout(timeoutHandle);
        const responseTime = Date.now() - startTime;
        req.destroy();
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ 
            status: 'working', 
            code: res.statusCode,
            responseTime,
            headers: {
              contentType: res.headers['content-type'],
              contentLength: res.headers['content-length']
            }
          });
        } else if (res.statusCode >= 400 && res.statusCode < 500) {
          resolve({ status: 'client_error', code: res.statusCode, responseTime });
        } else {
          resolve({ status: 'server_error', code: res.statusCode, responseTime });
        }
      });

      req.on('error', (err) => {
        clearTimeout(timeoutHandle);
        resolve({ 
          status: 'error', 
          error: err.message,
          responseTime: Date.now() - startTime
        });
      });

      req.end();
    } catch (e) {
      resolve({ status: 'error', error: e.message });
    }
  });
}

async function validateJapanStreams() {
  try {
    console.log('[Japanese TV Streams Quality Test]\n');

    const db = JSON.parse(fs.readFileSync(STREAMS_DB, 'utf8'));
    
    if (!db['Japan']) {
      console.error('Error: Japan streams not found in database');
      process.exit(1);
    }

    const japanStreams = db['Japan'];
    console.log(`[Found ${japanStreams.length} Japanese streams]\n`);

    const results = {
      totalStreams: japanStreams.length,
      tested: 0,
      working: 0,
      clientErrors: 0,
      serverErrors: 0,
      timeout: 0,
      errors: 0,
      streams: [],
      summary: {}
    };

    const stats = {
      responseTimes: [],
      byGenre: {},
      byStatus: {},
    };

    console.log('[Starting validation...]\n');

    // Process in batches
    for (let i = 0; i < japanStreams.length; i += PARALLEL_CHECKS) {
      const batch = japanStreams.slice(i, i + PARALLEL_CHECKS);
      const batchResults = await Promise.all(
        batch.map((stream) => testStream(stream.url))
      );

      batch.forEach((stream, idx) => {
        const result = batchResults[idx];
        results.tested++;

        // Track by genre
        if (!stats.byGenre[stream.genre]) {
          stats.byGenre[stream.genre] = { total: 0, working: 0 };
        }
        stats.byGenre[stream.genre].total++;

        // Track by status
        if (!stats.byStatus[result.status]) {
          stats.byStatus[result.status] = 0;
        }
        stats.byStatus[result.status]++;

        // Count results
        if (result.status === 'working') {
          results.working++;
          stats.byGenre[stream.genre].working++;
          if (result.responseTime) {
            stats.responseTimes.push(result.responseTime);
          }
        } else if (result.status === 'client_error') {
          results.clientErrors++;
        } else if (result.status === 'server_error') {
          results.serverErrors++;
        } else if (result.status === 'timeout') {
          results.timeout++;
        } else {
          results.errors++;
        }

        // Store stream result
        results.streams.push({
          title: stream.title,
          genre: stream.genre,
          url: stream.url.substring(0, 80) + '...', // Truncate URL for readability
          status: result.status,
          responseTime: result.responseTime || null,
          code: result.code || null
        });

        // Progress indicator
        if (results.tested % 10 === 0) {
          const percent = Math.round((results.tested / results.totalStreams) * 100);
          console.log(
            `[Progress: ${percent}% (${results.tested}/${results.totalStreams})] Working: ${results.working}`
          );
        }
      });
    }

    // Calculate statistics
    const workingPercent = Math.round((results.working / results.tested) * 100);
    const avgResponseTime = stats.responseTimes.length > 0 
      ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
      : null;
    const maxResponseTime = stats.responseTimes.length > 0
      ? Math.max(...stats.responseTimes)
      : null;
    const minResponseTime = stats.responseTimes.length > 0
      ? Math.min(...stats.responseTimes)
      : null;

    results.summary = {
      workingPercent,
      avgResponseTime,
      maxResponseTime,
      minResponseTime,
      byGenre: stats.byGenre,
      byStatus: stats.byStatus
    };

    // Save detailed results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

    // Display results
    console.log('\n========== JAPANESE TV STREAMS QUALITY REPORT ==========\n');
    
    console.log('[Overall Statistics]');
    console.log(`  Total Streams: ${results.totalStreams}`);
    console.log(`  Working: ${results.working} (${workingPercent}%)`);
    console.log(`  Client Errors (4xx): ${results.clientErrors}`);
    console.log(`  Server Errors (5xx): ${results.serverErrors}`);
    console.log(`  Timeouts: ${results.timeout}`);
    console.log(`  Other Errors: ${results.errors}`);

    console.log('\n[Response Time Metrics]');
    if (avgResponseTime) {
      console.log(`  Average: ${avgResponseTime}ms`);
      console.log(`  Min: ${minResponseTime}ms`);
      console.log(`  Max: ${maxResponseTime}ms`);
    } else {
      console.log('  N/A (no successful responses)');
    }

    console.log('\n[Results by Genre]');
    Object.entries(stats.byGenre)
      .sort(([, a], [, b]) => b.working - a.working)
      .forEach(([genre, data]) => {
        const percent = Math.round((data.working / data.total) * 100);
        const bar = '█'.repeat(Math.round(percent / 5)) + '░'.repeat(20 - Math.round(percent / 5));
        console.log(`  ${genre.padEnd(12)} ${bar} ${data.working}/${data.total} (${percent}%)`);
      });

    console.log('\n[Working Streams by Title]');
    const workingStreams = results.streams.filter(s => s.status === 'working');
    workingStreams.forEach(stream => {
      const time = stream.responseTime ? `${stream.responseTime}ms` : 'N/A';
      console.log(`  ✓ ${stream.title.padEnd(30)} [${stream.genre.padEnd(10)}] ${time}`);
    });

    console.log('\n[Failed/Unreachable Streams]');
    const failedStreams = results.streams.filter(s => s.status !== 'working');
    failedStreams.forEach(stream => {
      const code = stream.code ? ` (${stream.code})` : '';
      console.log(`  ✗ ${stream.title.padEnd(30)} [${stream.status}${code}]`);
    });

    console.log(`\n[Detailed results saved to: ${RESULTS_FILE}]\n`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

validateJapanStreams();

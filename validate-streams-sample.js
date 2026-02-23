const fs = require('fs');
const https = require('https');
const http = require('http');

const STREAMS_DB = 'streams-database.json';
const PARALLEL_CHECKS = 5; // Reduced for stability
const TIMEOUT = 5000;
const MAX_STREAMS_TOTAL = 50; // Reduced sample size

function testStream(url) {
  return new Promise((resolve) => {
    try {
      const protocol = url.startsWith('https') ? https : http;

      const timeoutHandle = setTimeout(() => {
        req.destroy();
        resolve({ status: 'timeout' });
      }, TIMEOUT);

      const options = {
        method: 'HEAD',
        timeout: TIMEOUT,
      };

      const req = protocol.request(url, options, (res) => {
        clearTimeout(timeoutHandle);
        req.destroy();
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ status: 'working', code: res.statusCode });
        } else {
          resolve({ status: 'failed', code: res.statusCode });
        }
      });

      req.on('error', () => {
        clearTimeout(timeoutHandle);
        resolve({ status: 'error' });
      });

      req.end();
    } catch (e) {
      resolve({ status: 'error' });
    }
  });
}

async function validateSample() {
  try {
    console.log('[Quick stream validation test...]\n');

    const db = JSON.parse(fs.readFileSync(STREAMS_DB, 'utf8'));
    const stats = { working: 0, failed: 0, timeout: 0, error: 0 };
    const streamQueue = [];

    // Collect sample
    Object.values(db).forEach((streams) => {
      if (streamQueue.length < MAX_STREAMS_TOTAL) {
        const take = Math.min(
          streams.length,
          MAX_STREAMS_TOTAL - streamQueue.length
        );
        streams.slice(0, take).forEach((stream) => {
          streamQueue.push(stream);
        });
      }
    });

    console.log(`Testing ${streamQueue.length} streams (${PARALLEL_CHECKS} parallel)...\n`);

    // Process in batches
    for (let i = 0; i < streamQueue.length; i += PARALLEL_CHECKS) {
      const batch = streamQueue.slice(i, i + PARALLEL_CHECKS);
      const batchResults = await Promise.all(batch.map((s) => testStream(s.url)));

      batchResults.forEach((result, idx) => {
        const stream = batch[idx];
        if (result.status === 'working') {
          stats.working++;
          console.log(`  [OK] ${stream.title.substring(0, 40).padEnd(40)} [${result.code}]`);
        } else if (result.status === 'timeout') {
          stats.timeout++;
          console.log(`  [TIMEOUT] ${stream.title.substring(0, 40).padEnd(40)}`);
        } else if (result.status === 'failed') {
          stats.failed++;
          console.log(`  [FAIL] ${stream.title.substring(0, 40).padEnd(40)}`);
        } else {
          stats.error++;
          console.log(`  [ERROR] ${stream.title.substring(0, 40).padEnd(40)}`);
        }
      });
    }

    console.log(`\n[Sample Results (${streamQueue.length} tested)]`);
    console.log(`   Working: ${stats.working} (${Math.round((stats.working / streamQueue.length) * 100)}%)`);
    console.log(`   Failed: ${stats.failed}`);
    console.log(`   Timeout: ${stats.timeout}`);
    console.log(`   Error: ${stats.error}`);
    
    console.log(`\n[Tips]`);
    console.log(`   - Run \`node validate-streams.js\` to test all 12,428 streams`);
    console.log(`   - This takes ~5-10 minutes (adjust PARALLEL_CHECKS for speed)`);
    console.log(`   - Then run \`node clean-database.js\` to remove broken streams`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

validateSample();

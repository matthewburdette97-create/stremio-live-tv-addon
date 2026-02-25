const http = require('http');
const https = require('https');

const TIMEOUT = 10000; // 10 second timeout
const PARALLEL_CHECKS = 5; // Reduce parallelism to be gentler

// The CCTV5 streams to test
const streams = [
  { name: 'CCTV5 1', url: 'http://58.205.220.58:8088/tlivectfree-cdn.ysp.cctv.cn/ysp/2000205103.m3u8' },
  { name: 'CCTV5 2', url: 'http://183.63.15.42:9901/tsfile/live/0005_1.m3u8' },
  { name: 'CCTV5 3', url: 'http://219.140.56.34:3333/tsfile/live/1005_1.m3u8' },
  { name: 'CCTV5 4', url: 'http://39.134.61.219/PLTV/88888888/224/3221226900/index.m3u8' },
  { name: 'CCTV5 5', url: 'http://221.213.43.82:8888/newlive/live/hls/6/live.m3u8' },
  { name: 'CCTV5 6', url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226395/index.m3u8' },
  { name: 'CCTV5 7', url: 'http://120.196.232.124:8088/rrs03.hw.gmcc.net/PLTV/651/224/3221226731/1.m3u8' },
  { name: 'CCTV5 8', url: 'http://123.6.9.146/live/jz-cctv-5/live.m3u8' },
  { name: 'CCTV5 9', url: 'http://111.20.40.164/PLTV/88888893/224/3221226395/index.m3u8' },
  { name: 'CCTV5 10', url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888888/224/3221226395/1.m3u8' },
  { name: 'CCTV5 11', url: 'http://220.178.228.153:1935/live/cctv5/playlist.m3u8' },
  { name: 'CCTV5 12', url: 'http://39.134.24.161/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221226395/index.m3u8' },
  { name: 'CCTV5 13', url: 'http://58.205.220.58/tlivecloud-ipv6.ysp.cctv.cn/001/2000205103.m3u8' },
  { name: 'CCTV5 14', url: 'http://39.134.61.219/PLTV/88888888/224/3221226944/index.m3u8' },
  { name: 'CCTV5 15', url: 'http://223.95.111.98:5555/newlive/live/hls/5/live.m3u8' },
  { name: 'CCTV5 16', url: 'http://111.20.40.166/PLTV/88888893/224/3221226395/index.m3u8' },
  { name: 'CCTV5 17', url: 'http://125.210.152.19:9120/live/hzgq-cctv5gq-h264.m3u8' },
  { name: 'CCTV5+ 1', url: 'http://39.134.61.219/PLTV/88888888/224/3221226912/index.m3u8' },
  { name: 'CCTV5+ 2', url: 'http://58.205.220.58/tlivecloud-ipv6.ysp.cctv.cn/001/2000204503.m3u8' },
  { name: 'CCTV5+ 3', url: 'http://39.134.61.219/PLTV/88888888/224/3221227092/index.m3u8' },
  { name: 'CCTV5+ 4', url: 'http://125.210.152.19:9120/live/hzgq-cctvzhgq-h264.m3u8' },
  { name: 'CCTV5+ 5', url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888890/224/3221225761/index.m3u8' },
  { name: 'CCTV5+ 6', url: 'http://111.8.150.191:85/tsfile/live/1039_1.m3u8?key=txiptv&playlive=1&authid=0' },
  { name: 'CCTV5+ 7', url: 'http://39.134.24.162/dbiptv.sn.chinamobile.com/PLTV/88888888/224/3221225761/1.m3u8' },
  { name: 'CCTV5+ 8', url: 'http://58.205.220.58:8088/tlivectfree-cdn.ysp.cctv.cn/ysp/2000204503.m3u8' },
  { name: 'CCTV5+ 9', url: 'http://219.140.56.34:3333/tsfile/live/0016_1.m3u8' },
  { name: 'CCTV5+ 10', url: 'http://221.213.43.82:8888/newlive/live/hls/7/live.m3u8' },
  { name: 'CCTV5+ 11', url: 'http://120.196.232.124:8088/rrs03.hw.gmcc.net/PLTV/651/224/3221226711/1.m3u8' },
];

function testStream(stream) {
  return new Promise((resolve) => {
    try {
      const protocol = stream.url.startsWith('https') ? https : http;
      const options = {
        method: 'GET',
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      let receivedData = false;

      const req = protocol.request(stream.url, options, (res) => {
        receivedData = true;
        req.destroy();
        
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ name: stream.name, url: stream.url, status: 'working', code: res.statusCode });
        } else {
          resolve({ name: stream.name, url: stream.url, status: 'failed', code: res.statusCode });
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (receivedData) {
          resolve({ name: stream.name, url: stream.url, status: 'working', code: 'timeout-but-got-data' });
        } else {
          resolve({ name: stream.name, url: stream.url, status: 'timeout' });
        }
      });

      req.on('error', (err) => {
        req.destroy();
        if (receivedData) {
          resolve({ name: stream.name, url: stream.url, status: 'working', code: 'error-but-got-data' });
        } else {
          resolve({ name: stream.name, url: stream.url, status: 'error', error: err.message });
        }
      });

      req.end();
    } catch (e) {
      resolve({ name: stream.name, url: stream.url, status: 'error', error: e.message });
    }
  });
}

async function validateCCTV5() {
  console.log(`\n🔍 Testing ${streams.length} CCTV5 streams (with GET requests)...\n`);

  const working = [];
  const failed = [];

  // Process in parallel batches
  for (let i = 0; i < streams.length; i += PARALLEL_CHECKS) {
    const batch = streams.slice(i, i + PARALLEL_CHECKS);
    const batchResults = await Promise.all(batch.map(testStream));

    batchResults.forEach((result) => {
      if (result.status === 'working') {
        working.push(result);
        console.log(`✅ ${result.name} - ${result.url.substring(0, 70)}...`);
      } else {
        failed.push(result);
        console.log(`❌ ${result.name} (${result.status})`);
      }
    });

    const percent = Math.round(((i + batch.length) / streams.length) * 100);
    console.log(`   [${percent}%] Tested ${i + batch.length}/${streams.length}\n`);
  }

  // Results summary
  console.log(`${'='.repeat(80)}`);
  console.log(`\n📊 RESULTS SUMMARY`);
  console.log(`   Total tested: ${streams.length}`);
  console.log(`   ✅ Working: ${working.length} (${Math.round((working.length / streams.length) * 100)}%)`);
  console.log(`   ❌ Failed: ${failed.length}`);

  if (working.length > 0) {
    console.log(`\n🎬 WORKING STREAMS:\n`);
    working.forEach((stream) => {
      console.log(`✅ ${stream.name}`);
      console.log(`   URL: ${stream.url}\n`);
    });
    console.log(`\n📝 For index.js:\n`);
    working.forEach((stream, idx) => {
      const label = stream.name.includes('+') ? `CCTV5+ ${idx + 1}` : `CCTV5 ${idx + 1}`;
      console.log(`    { title: '${label}', url: '${stream.url}' },`);
    });
  } else {
    console.log(`\n⚠️  No working streams found. These streams may be:
   - Geographically restricted (IP-based access limited to China)
   - Require authentication or specific headers
   - Currently offline/unavailable
   - Using protocols not compatible with HEAD/GET requests\n`);
  }

  console.log(`\n`);
}

validateCCTV5();

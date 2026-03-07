const https = require('https');
const fs = require('fs');
const path = require('path');

// Test downloading a few segments
const SEGMENTS = [
  {
    url: 'https://vod-adaptive-ak.vimeocdn.com/exp=1772380412~acl=%2F34c932ff-d7da-4ba9-b346-036371a747f8%2Fpsid%3D886f9b117f622c24ca47cdfb22c57c484b4875797cb211e7bdf405d200c45ef5%2F%2A~hmac=d66cd29b14dc0727928f2cf625230626241abd1a60e9216d9c400ba246587d03/34c932ff-d7da-4ba9-b346-036371a747f8/psid=886f9b117f622c24ca47cdfb22c57c484b4875797cb211e7bdf405d200c45ef5/v2/remux/avf/f80b490d-926d-4dc8-aaab-252d1e7869c6/segment.m4s?pathsig=8c953e4f~1PBanHfAWJ6CGV-TmdWg-GVyOt3AxogZpTGLM46hmXw&r=dXMtY2VudHJhbDE%3D&sid=1&st=video',
    id: 1
  },
  {
    url: 'https://vod-adaptive-ak.vimeocdn.com/exp=1772380412~acl=%2F34c932ff-d7da-4ba9-b346-036371a747f8%2Fpsid%3D886f9b117f622c24ca47cdfb22c57c484b4875797cb211e7bdf405d200c45ef5%2F%2A~hmac=d66cd29b14dc0727928f2cf625230626241abd1a60e9216d9c400ba246587d03/34c932ff-d7da-4ba9-b346-036371a747f8/psid=886f9b117f622c24ca47cdfb22c57c484b4875797cb211e7bdf405d200c45ef5/v2/remux/avf/f80b490d-926d-4dc8-aaab-252d1e7869c6/segment.m4s?pathsig=8c953e4f~1PBanHfAWJ6CGV-TmdWg-GVyOt3AxogZpTGLM46hmXw&r=dXMtY2VudHJhbDE%3D&sid=2&st=video',
    id: 2
  }
];

async function downloadSegment(url, outputPath) {
  return new Promise((resolve, reject) => {
    console.log(`[Downloading] Segment ${path.basename(outputPath)}`);
    
    const file = fs.createWriteStream(outputPath);
    
    https.get(url, { timeout: 30000 }, (res) => {
      console.log(`[Response] Status: ${res.statusCode}`);
      
      if (res.statusCode !== 200) {
        fs.unlink(outputPath, () => {});
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      res.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(outputPath).size;
        console.log(`[Saved] ${outputPath} (${size} bytes)\n`);
        resolve(outputPath);
      });
      
      file.on('error', (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function testDownloadSegments() {
  console.log('\n=== Testing Segment Downloads ===\n');
  
  const tempDir = path.join(__dirname, '.test_segments');
  fs.mkdirSync(tempDir, { recursive: true });
  
  for (const segment of SEGMENTS) {
    try {
      const filePath = path.join(tempDir, `segment_${segment.id}.m4s`);
      await downloadSegment(segment.url, filePath);
    } catch (error) {
      console.error(`❌ Error downloading segment ${segment.id}:`, error.message);
    }
  }
  
  console.log('\n=== Test Complete ===\n');
  console.log('Temp directory:', tempDir);
  
  const files = fs.readdirSync(tempDir);
  console.log('Downloaded files:', files.length);
  files.forEach(f => {
    const stat = fs.statSync(path.join(tempDir, f));
    console.log(`  - ${f}: ${stat.size} bytes`);
  });
}

testDownloadSegments();

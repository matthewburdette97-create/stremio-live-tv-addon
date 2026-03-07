const { downloadVimeoVideo } = require('./vimeo-stream-extractor');
const path = require('path');

// Working Vimeo playlist URL
const PLAYLIST_URL = 'https://vod-adaptive-ak.vimeocdn.com/exp=1772380412~acl=%2F34c932ff-d7da-4ba9-b346-036371a747f8%2Fpsid%3D886f9b117f622c24ca47cdfb22c57c484b4875797cb211e7bdf405d200c45ef5%2F%2A~hmac=d66cd29b14dc0727928f2cf625230626241abd1a60e9216d9c400ba246587d03/34c932ff-d7da-4ba9-b346-036371a747f8/psid=886f9b117f622c24ca47cdfb22c57c484b4875797cb211e7bdf405d200c45ef5/v2/playlist/av/primary/playlist.json?omit=av1-hevc&pathsig=8c953e4f~LqbZri1ge6rBzz8gXkDI39_5DGFXouEDKEAMquG7cF8&r=dXM%3D&rh=30AskS';

// Output file path
const OUTPUT_FILE = path.join(__dirname, 'klassiki-my-thoughts-are-silent.mp4');

// Number of parallel workers
const MAX_WORKERS = 5;

async function downloadVideo() {
  console.log('\n');
  console.log('╔' + '═'.repeat(70) + '╗');
  console.log('║  Vimeo Video Download - Complete Video Builder                   ║');
  console.log('╚' + '═'.repeat(70) + '╝\n');
  
  console.log('Downloading video from Vimeo...\n');
  console.log('Video: My Thoughts Are Silent (Ukrainian, 1h 43m)');
  console.log('Segments: 1,026');
  console.log('Output: ' + OUTPUT_FILE);
  console.log('Workers: ' + MAX_WORKERS + ' parallel\n');
  console.log('═'.repeat(72) + '\n');
  
  try {
    const result = await downloadVimeoVideo(PLAYLIST_URL, OUTPUT_FILE, MAX_WORKERS);
    
    if (result.success) {
      console.log('\n' + '═'.repeat(72));
      console.log('\n✅ SUCCESS! Video downloaded completely\n');
      console.log('Details:');
      console.log('  File: ' + result.outputFile);
      console.log('  Size: ' + (require('fs').statSync(result.outputFile).size / 1024 / 1024).toFixed(2) + ' MB');
      console.log('  Segments: ' + result.segments);
      console.log('  Quality: ' + result.videoInfo.quality);
      console.log('  Duration: ' + (result.videoInfo.duration / 60).toFixed(2) + ' minutes\n');
      console.log('✓ Ready to play in any video player');
      console.log('✓ Can be added to Stremio or streamed');
      
    } else {
      console.log('\n❌ Download failed: ' + result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the download
downloadVideo();

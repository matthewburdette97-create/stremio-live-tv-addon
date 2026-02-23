/**
 * Add Genre Classification to Streams Database
 * Classifies channels based on keywords in their titles
 */

const fs = require('fs');
const path = require('path');

const STREAMS_DB = 'streams-database.json';
const OUTPUT_FILE = 'streams-database.json';

// Genre keywords - order matters (check specific before general)
const GENRE_KEYWORDS = {
  'sports': ['sport', 'eurosport', 'espn', 'nfl', 'nba', 'fifa', 'football', 'baseball', 'cricket', 'tyc sports', 'sky sports', 'bein sport', 'dazn'],
  'news': ['news', 'cnn', 'bbc news', 'al jazeera', 'abc news', 'nbc news', 'cctv news', 'ary news', 'france', 'reuters', 'noticias', 'noticia'],
  'music': ['music', 'mtv', 'vh1', 'tololmusic', 'arbud music'],
  'documentary': ['documentary', 'discovery', 'national geographic', 'nat geo'],
  'kids': ['kids', 'cartoon', 'nickelodeon', 'disney', 'baby', 'junior'],
  'movies': ['cinema', 'movie', 'film', 'hbo', 'paramount+', 'netflix'],
  'general': ['tv', 'channel', '1', '2', '3', 'rtsh', 'orf', 'yle', 'rte', 'rai', 'bbc', 'itv']
};

function classifyChannel(title) {
  const lowerTitle = title.toLowerCase();
  
  // Check each genre in order
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword)) {
        return genre;
      }
    }
  }
  
  // Default to general if no match
  return 'general';
}

function addGenres() {
  try {
    console.log('[Loading streams database...]');
    const db = JSON.parse(fs.readFileSync(STREAMS_DB, 'utf8'));
    
    let totalStreams = 0;
    const genreStats = {};
    
    console.log('[Classifying channels by genre...]\n');
    
    // Add genre to each stream
    Object.entries(db).forEach(([country, streams]) => {
      streams.forEach((stream) => {
        const genre = classifyChannel(stream.title);
        stream.genre = genre;
        totalStreams++;
        
        // Track stats
        if (!genreStats[genre]) {
          genreStats[genre] = 0;
        }
        genreStats[genre]++;
      });
    });
    
    // Write updated database
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(db, null, 2));
    
    console.log('[✓ Genre classification complete!]\n');
    console.log(`Total streams processed: ${totalStreams}`);
    console.log('\nGenre distribution:');
    Object.entries(genreStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([genre, count]) => {
        console.log(`  ${genre}: ${count} channels`);
      });
    
    console.log('\n[✓ Database updated successfully!]');
  } catch (error) {
    console.error('[✗ Error:', error.message);
    process.exit(1);
  }
}

addGenres();

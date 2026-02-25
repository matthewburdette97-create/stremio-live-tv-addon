#!/bin/bash

# Stream Versioning System - Example Usage

echo "=== Stream Versioning System Demo ==="
echo ""

# Add multiple versions/mirrors for a stream
echo "1. Adding J SPORTS 1 versions..."
node stream-versioning.js add Japan "J SPORTS 1" "https://nl.utako.moe/js1/tracks-v1a1/mono.m3u8" 1
node stream-versioning.js add Japan "J SPORTS 1" "https://backup.provider.com/jsports1" 2
node stream-versioning.js add Japan "J SPORTS 1" "https://mirror.cdnprovider.net/jsports1" 3

echo ""
echo "2. Adding NHK WORLD variations..."
node stream-versioning.js add Japan "NHK WORLD" "https://master.nhkworld.jp/nhkworld-tv/playlist/live.m3u8" 1
node stream-versioning.js add Japan "NHK WORLD" "https://nhk.lls.pbs.org/index.m3u8" 2

echo ""
echo "3. Testing J SPORTS 1 versions..."
node stream-versioning.js test Japan "J SPORTS 1"

echo ""
echo "4. Testing all Japan streams..."
node stream-versioning.js test Japan

echo ""
echo "5. Getting stream report..."
node stream-versioning.js report Japan "J SPORTS 1"

echo ""
echo "6. Exporting simplified database..."
node stream-versioning.js export > streams-database-clean.json

echo ""
echo "Done! Check streams-database-versioned.json for the full versioned database."

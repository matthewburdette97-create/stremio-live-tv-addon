#!/bin/bash

# Beamup deployment script for stremio-live-tv-addon
# This script automates the interactive beamup deployment process

echo "🚀 Deploying Live TV Stremio Add-on to Beamup..."
echo ""
echo "Using:"
echo "  Project Name: stremio-live-tv-addon"
echo "  Host: a.baby-beamup.club"
echo "  GitHub Username: matthewburdette97-create"
echo ""

# Provide inputs to beamup through stdin
# The prompts appear to be: Project Name, then host, then GitHub username
(
  echo "stremio-live-tv-addon"
  echo "a.baby-beamup.club"
  echo "matthewburdette97-create"
) | beamup

echo ""
echo "✅ Deployment process started!"
echo "Check the output above for any errors or follow-up instructions."

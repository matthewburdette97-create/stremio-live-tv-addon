# Stremio Add-on Development Guide

This workspace contains a Stremio add-on project built with Node.js and the Stremio Add-on SDK.

## Project Overview

- **Type**: Node.js Stremio Add-on
- **Main Entry**: `index.js`
- **Port**: 7070 (default)
- **Manifest Endpoint**: `http://localhost:7070/manifest.json`

## Development Workflow

1. Install dependencies with `npm install`
2. Start the add-on with `npm start`
3. Test in Stremio by adding the manifest URL
4. Modify handlers in `index.js` to add your content and streams

## Key Files

- `index.js` - Main add-on with Catalog, Meta, and Stream handlers
- `package.json` - Dependencies and scripts
- `README.md` - User-facing documentation

## Common Tasks

### Add a New Catalog

Edit the `manifest` object to add a new entry to the `catalogs` array, then implement its handler in `defineCatalogHandler`.

### Add Streaming Sources

Implement URLs in the `defineStreamHandler` function to return actual stream sources.

### Deploy to Production

Update the add-on to use environment variables for configuration and deploy to a hosting service (Heroku, Railway, etc.).

## Resources

- [Stremio Add-on SDK](https://docs.stremio.com/)
- [Protocol Documentation](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/protocol.md)

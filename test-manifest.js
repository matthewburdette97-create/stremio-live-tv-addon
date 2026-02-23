#!/usr/bin/env node
const http = require('http')

// Start the add-on server
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")
const fs = require('fs')
const path = require('path')

// Import the main add-on
require('./index.js')

// Wait for server to start, then test the manifest
setTimeout(() => {
  const options = {
    hostname: 'localhost',
    port: 7070,
    path: '/manifest.json',
    method: 'GET'
  }

  const req = http.request(options, (res) => {
    let data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      try {
        const manifest = JSON.parse(data)
        const countriesCatalog = manifest.catalogs.find(c => c.id === 'countries')
        
        console.log('\n✓ Manifest retrieved successfully')
        console.log('\n📺 Countries Catalog:')
        console.log(`  Name: ${countriesCatalog.name}`)
        console.log(`\n🎯 Genre Filter Options:`)
        if (countriesCatalog.extra && countriesCatalog.extra[0]) {
          const options = countriesCatalog.extra[0].options
          console.log(`  Available genres: ${options.join(', ')}`)
          console.log(`\n✓ Genre dropdown IS PRESENT in manifest!`)
        } else {
          console.log('  ❌ No genre options found in manifest')
        }
        
        process.exit(0)
      } catch (error) {
        console.error('Error parsing manifest:', error)
        process.exit(1)
      }
    })
  })

  req.on('error', (error) => {
    console.error('Error fetching manifest:', error)
    process.exit(1)
  })

  req.end()
}, 2000)

// Kill the process after 10 seconds
setTimeout(() => {
  console.error('Timeout waiting for manifest')
  process.exit(1)
}, 10000)

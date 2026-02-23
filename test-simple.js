const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")

const manifest = {
  id: "org.simple.test",
  version: "1.0.0",
  catalogs: [
    {
      type: "tv",
      id: "test",
      name: "Test"
    }
  ],
  resources: ["catalog"],
  types: ["tv"],
  name: "Simple Test",
  description: "Simple test addon"
}

const builder = new addonBuilder(manifest)

builder.defineCatalogHandler(async ({ type, id, extra }) => {
  console.log("Catalog request:", type, id)
  return { metas: [] }
})

const port = process.env.PORT || 7072
console.log(`Starting test addon on port ${port}...`)

try {
  serveHTTP(builder.getInterface(), { port: port })
  console.log(`✓ Test addon running on http://localhost:${port}/manifest.json`)
} catch (error) {
  console.error("Error starting server:", error)
  process.exit(1)
}

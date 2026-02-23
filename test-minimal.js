const { addonBuilder, serveHTTP } = require("stremio-addon-sdk")

const manifest = {
  id: "org.test.stremio",
  version: "1.0.0",
  name: "Test Addon",
  description: "Minimal test",
  resources: ["catalog"],
  types: ["tv"],
  catalogs: [{type: "tv", id: "test"}]
}

const builder = new addonBuilder(manifest)

builder.defineCatalogHandler(async () => {
  return { metas: [] }
})

if (require.main === module) {
  const port = process.env.PORT || 7071
  console.log(`Starting on port ${port}...`)
  serveHTTP(builder.getInterface(), { port })
  console.log(`Server running on http://localhost:${port}/manifest.json`)
}

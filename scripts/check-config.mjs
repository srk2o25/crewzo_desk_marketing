// Keeps the editor form (public/admin/config.yml) and the content contract (lib/schema.mjs) in sync.
// Runs before every build: if a field exists in one and not the other, the build fails with the
// difference, instead of the editor saving something the site can't render (or never offering a field).
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { ROOT } from '../lib/load.mjs'
import { COLLECTIONS, authorFields, siteSchema } from '../lib/schema.mjs'

const config = yaml.load(fs.readFileSync(path.join(ROOT, 'public/admin/config.yml'), 'utf8'))
const byName = Object.fromEntries(config.collections.map((c) => [c.name, c]))
const problems = []

// Compares field names level by level, descending into object widgets and lists of objects.
function compare(where, cmsFields, zodShape) {
  const cms = new Map(cmsFields.filter((f) => f.name !== 'body').map((f) => [f.name, f]))
  const schema = Object.keys(zodShape)
  for (const name of schema) if (!cms.has(name)) problems.push(`${where}: "${name}" is in lib/schema.mjs but has no editor field`)
  for (const name of cms.keys()) if (!schema.includes(name)) problems.push(`${where}: editor field "${name}" is not in lib/schema.mjs`)
  for (const [name, field] of cms) {
    const nested = field.fields && objectShape(zodShape[name])
    if (nested) compare(`${where}.${name}`, field.fields, nested)
  }
}

// Field names of an object schema, looking through optional/default/union wrappers and list items.
function objectShape(type) {
  if (!type) return undefined
  if (type.shape) return type.shape
  const d = type._def
  if (d.options) return d.options.map(objectShape).find(Boolean)
  return objectShape(d.innerType ?? d.schema ?? d.type)
}

for (const [key, collection] of Object.entries(COLLECTIONS)) {
  const cms = byName[key]
  if (!cms) {
    problems.push(`config.yml has no "${key}" collection`)
    continue
  }
  if (cms.folder !== collection.folder) problems.push(`${key}: config.yml folder "${cms.folder}" should be "${collection.folder}"`)
  compare(key, cms.fields, collection.fields.shape)
}
compare('authors', byName.authors.fields, authorFields.shape)
compare('settings/site', byName.settings.files.find((f) => f.name === 'site').fields, siteSchema.shape)

if (problems.length) {
  console.error(`Editor config and content schema are out of sync:\n${problems.map((p) => `  ✗ ${p}`).join('\n')}`)
  process.exit(1)
}
console.log(`Editor config in sync with content schema (${Object.keys(COLLECTIONS).length + 2} collections).`)

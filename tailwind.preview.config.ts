import type { Config } from 'tailwindcss'
import base from './tailwind.config'

// Same theme as the site, scanning only the editor preview templates.
const config: Config = { ...base, content: ['./public/admin/cms.js'] }
export default config

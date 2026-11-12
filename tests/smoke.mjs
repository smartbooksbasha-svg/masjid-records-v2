/**
 * Headless smoke test — bundles the real app with esbuild and drives it in jsdom.
 * Run: npm test
 */
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let pass = 0
let fail = 0
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  \u2713 ${name}`) }
  else { fail++; console.log(`  \u2717 ${name}`) }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- 1. bundle the real app -------------------------------------------------
const result = await build({
  absWorkingDir: root,
  entryPoints: ['src/main.tsx'],
  bundle: true,
  write: false,
  format: 'iife',
  platform: 'browser',
  jsx: 'automatic',
  loader: { '.css': 'text' },
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env.BASE_URL': '"/"',
    'import.meta.env.MODE': '"test"',
    'import.meta.env.DEV': 'false',
    'import.meta.env.PROD': 'true',
  },
  logLevel: 'silent',
})
const code = result.outputFiles[0].text

// ---- 2. jsdom shell ---------------------------------------------------------
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'https://localhost/',
})
const { window } = dom
window.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} }
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
window.scrollTo = () => {}
window.print = () => {}

const doc = window.document
const errs = []
window.addEventListener('error', (e) => errs.push(String(e.message)))
window.addEventListener('unhandledrejection', (e) => errs.push(String(e.reason)))

const script = doc.createElement('script')
script.textContent = code
doc.body.appendChild(script)
await sleep(400)

const $ = (sel) => doc.querySelector(sel)
const $$ = (sel) => [...doc.querySelectorAll(sel)]
const text = () => $('#root').textContent || ''

const goto = async (hash) => { window.location.hash = hash; await sleep(280) }

async function waitFor(fn, ms = 3000) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    try { if (fn()) return true } catch { /* keep polling */ }
    await sleep(50)
  }
  return false
}

function setInput(el, value) {
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
  const setter = Object.getOwnPropertyDescriptor(proto, 'value').set
  setter.call(el, value)
  el.dispatchEvent(new window.Event('input', { bubbles: true }))
}
function click(el) {
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
}
const byPlaceholder = (p) => $$('input, textarea').find((i) => (i.placeholder || '').includes(p))
const btnWith = (re) => $$('button').filter((b) => re.test(b.textContent || ''))

console.log('\nAuth — first-run owner setup')
ok('login/setup screen renders', text().includes('Create the owner account'))
ok('setup asks for name + email', !!byPlaceholder('Isthiyaque') && !!byPlaceholder('you@example.com'))

setInput(byPlaceholder('Isthiyaque'), 'Test Owner')
setInput(byPlaceholder('you@example.com'), 'owner@example.com')
setInput(byPlaceholder('At least 6 characters'), 'secret123')
setInput(byPlaceholder('Repeat password'), 'secret123')
click(btnWith(/Create account/)[0])

ok('owner created -> dashboard shows', await waitFor(() => text().includes('At a glance'), 4000))
const accs = JSON.parse(window.localStorage.getItem('mkr_accounts_v2') || '[]')
ok('owner account persisted (hashed)', accs.length === 1 && accs[0].role === 'owner' && accs[0].hash.length > 10)
ok('password not stored in plain text', !JSON.stringify(accs).includes('secret123'))

console.log('\nDashboard')
ok('app mounted (root not empty)', ($('#root').innerHTML || '').length > 200)
ok('KPI section renders', text().includes('At a glance'))
ok('street chart section renders', text().includes('Population by street'))
ok('sidebar nav renders', text().includes('Add Household') && text().includes('Audit Log'))

console.log('\nHouseholds list')
await goto('#/households')
ok('list screen renders', text().includes('Add Household'))
ok('sample family shows', text().includes('Abdul Rahman'))
ok('family id chip shows', text().includes('MK-2026-0001'))

const search = $('input[placeholder*="Search"]')
setInput(search, 'Ismail')
ok('search filters list', await waitFor(() => text().includes('Mohammed Ismail') && !text().includes('Abdul Rahman')))
setInput(search, 'zzzz-no-match')
ok('empty filter state shows', await waitFor(() => text().includes('No households match')))
setInput(search, '')
await waitFor(() => text().includes('Abdul Rahman'))

console.log('\nHousehold detail')
await goto('#/households/MK-2026-0001')
ok('detail renders head', text().includes('Abdul Rahman'))
ok('members table renders', text().includes('Fathima Beevi') && text().includes('Mohammed Ayaan'))
ok('documents section renders', text().includes('Documents held'))
ok('schemes section renders', text().includes('Government schemes'))

console.log('\nAdd household form')
await goto('#/add')
ok('form renders', text().includes('Add household'))
ok('new family id generated', /MK-\d{4}-\d{4}/.test(text()))

const saveBtns = btnWith(/Save household/)
ok('save button exists', saveBtns.length > 0)
click(saveBtns[0])
await sleep(250)
ok('validation blocks empty head', text().includes('Head of household ka naam zaroori hai'))

setInput(byPlaceholder('Abdul Rahman'), 'Test Family Head')
await sleep(120)
setInput($$('input').find((i) => (i.placeholder || '') === 'Member name'), 'Test Member One')
await sleep(120)
click(btnWith(/Save household/)[0])
await sleep(500)

ok('saved -> navigated to detail', text().includes('Test Family Head'))
ok('detail shows the new member', text().includes('Test Member One'))

const stored = JSON.parse(window.localStorage.getItem('mkr_families_v2') || '[]')
ok('persisted to localStorage', Array.isArray(stored) && stored.some((f) => f.head === 'Test Family Head'))

console.log('\nFind Family')
await goto('#/find')
ok('find screen renders', text().includes('Find Family') && !!$('input[placeholder*="MK-2026"]'))
setInput($('input[placeholder*="MK-2026"]'), 'Abdul Rahman')
ok('find returns a match', await waitFor(() => text().includes('Abdul Rahman')))
setInput($('input[placeholder*="MK-2026"]'), 'no-such-family-xyz')
ok('find empty state', await waitFor(() => text().includes('Koi match nahi mila')))

console.log('\nRecycle bin (soft delete)')
const head = stored.find((f) => f.head === 'Test Family Head')
await goto(`#/households/${head.id}`)
ok('detail open for delete', text().includes('Test Family Head'))
click(btnWith(/Delete/)[0])
await sleep(250)
ok('delete confirm modal shows', text().includes('Delete this household?'))
click(btnWith(/Delete/).pop())
await sleep(400)
await goto('#/recycle')
ok('deleted household in recycle bin', text().includes('Test Family Head'))
click(btnWith(/Restore/)[0])
await sleep(300)
ok('restored out of recycle bin', await waitFor(() => !text().includes('Test Family Head') || text().includes('Recycle bin khali hai')))
await goto('#/households')
ok('restored household back in list', text().includes('Test Family Head'))

console.log('\nReports & analytics')
await goto('#/reports')
ok('reports renders', text().includes('Reports & Analytics') && text().includes('Street-wise breakdown'))

console.log('\nDocuments')
await goto('#/documents')
ok('documents renders', text().includes('Aadhaar Card'))

console.log('\nGovernment schemes')
await goto('#/schemes')
ok('schemes renders', text().includes('Magalir Urimai Thogai'))

console.log('\nExports & print')
await goto('#/exports')
ok('exports renders', text().includes('Members CSV') && text().includes('Excel workbook'))

console.log('\nID Card Designer')
await goto('#/idcards')
ok('id card designer renders', text().includes('Card settings') && text().includes('Live preview'))

console.log('\nMasjid profile')
await goto('#/masjid')
ok('masjid profile renders', text().includes('Committee details'))

console.log('\nUsers')
await goto('#/users')
ok('users screen renders', text().includes('Add user') && text().includes('Owner · Admin'))

console.log('\nAdministration')
await goto('#/admin')
ok('administration renders', text().includes('Danger zone') && text().includes('Family ID format'))

console.log('\nAudit log')
await goto('#/audit')
ok('audit log renders', text().includes('Audit Log'))
ok('audit recorded the add', text().includes('family.add'))

console.log('\nNotifications')
await goto('#/notifications')
ok('notifications renders', text().includes('Welcome to Masjid Khidmat Records'))

console.log('\nMy profile')
await goto('#/profile')
ok('profile renders', text().includes('Change password') && text().includes('owner@example.com'))

console.log('\nSettings')
await goto('#/settings')
ok('settings renders', text().includes('Appearance') && text().includes('Backup & restore'))

console.log('\nLanguage switch')
await goto('#/settings')
click(btnWith(/^Hinglish$/)[0])
await sleep(250)
ok('hinglish applied to nav', text().includes('Ghar') || text().includes('Dhoondo'))

console.log('\nRuntime errors')
ok('no uncaught errors', errs.length === 0)
if (errs.length) console.log('   errors:', errs.slice(0, 5))

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)

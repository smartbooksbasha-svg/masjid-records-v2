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

const doc = window.document
const errs = []
window.addEventListener('error', (e) => errs.push(String(e.message)))
window.addEventListener('unhandledrejection', (e) => errs.push(String(e.reason)))

const script = doc.createElement('script')
script.textContent = code
doc.body.appendChild(script)
await sleep(400)

const text = () => $('#root').textContent || ''
const $ = (sel) => doc.querySelector(sel)
const $$ = (sel) => [...doc.querySelectorAll(sel)]

const goto = async (hash) => { window.location.hash = hash; await sleep(250) }

async function waitFor(fn, ms = 2500) {
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
function setSelect(el, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
  setter.call(el, value)
  el.dispatchEvent(new window.Event('change', { bubbles: true }))
}
function click(el) {
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
}

console.log('\nDashboard')
ok('app mounted (root not empty)', ($('#root').innerHTML || '').length > 200)
ok('hero heading renders', text().includes('Community Records'))
ok('KPI section renders', text().includes('At a glance'))
ok('street chart section renders', text().includes('Population by street'))

console.log('\nHouseholds list')
await goto('#/households')
ok('list screen renders', text().includes('Add Household'))
ok('sample family shows', text().includes('Abdul Rahman'))
ok('family id chip shows', text().includes('MK-2026-0001'))
ok('search input present', !!$('input[placeholder*="Search"]'))

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
ok('member card renders', text().includes('New member') || text().includes('Head'))
ok('new family id generated', /MK-\d{4}-\d{4}/.test(text()))

// validation: saving empty shows error
const saveBtns = $$('button').filter((b) => /Save household/.test(b.textContent || ''))
ok('save button exists', saveBtns.length > 0)
click(saveBtns[0])
await sleep(250)
ok('validation blocks empty head', text().includes('Head of household ka naam zaroori hai'))

// fill and save
const inputs = $$('input')
const headInput = inputs.find((i) => (i.placeholder || '').includes('Abdul Rahman'))
ok('head input found', !!headInput)
setInput(headInput, 'Test Family Head')
await sleep(150)

const memberName = $$('input').find((i) => (i.placeholder || '') === 'Member name')
ok('member name input found', !!memberName)
setInput(memberName, 'Test Member One')
await sleep(150)

const save2 = $$('button').filter((b) => /Save household/.test(b.textContent || ''))
click(save2[0])
await sleep(400)

ok('saved -> navigated to detail', text().includes('Test Family Head'))
ok('detail shows the new member', text().includes('Test Member One'))

const stored = JSON.parse(window.localStorage.getItem('mkr_families_v2') || '[]')
ok('persisted to localStorage', Array.isArray(stored) && stored.some((f) => f.head === 'Test Family Head'))

console.log('\nBack to list')
await goto('#/households')
ok('new household appears in list', text().includes('Test Family Head'))

console.log('\nNav routes')
for (const [hash, label] of [['#/reports', 'Reports & Analytics'], ['#/settings', 'Settings'], ['#/', 'Community Records']]) {
  await goto(hash)
  ok(`route ${hash} renders ${label}`, text().includes(label))
}

console.log('\nRuntime errors')
ok('no uncaught errors', errs.length === 0)
if (errs.length) console.log('   errors:', errs.slice(0, 5))

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail ? 1 : 0)

# TASK — Masjid Khidmat Records v2 (fresh rebuild from RDP v1.0)

GOAL (top): Build a NEW, modern, unique-looking Masjid community records
website from RDP v1.0. Do NOT merge with the old app (`~/masjid-kidmat-records`).
Plan: see PROJECT_PLAN.md. Live target: smartbooksbasha-svg.github.io/masjid-records-v2/

## Steps
- [x] 1. Save project decision to memory
- [x] 2. Create project folder + PROJECT_PLAN.md + TASK.md
- [x] 3. Build 3-direction design preview (ui-preview.html)
- [x] 4. Create GitHub repo `masjid-records-v2` + deploy preview live (Pages)
- [x] 5. Shan's pick = ③ SANCTUM (2026-11-12)
- [x] 6. Scaffold React + TS + Vite + Tailwind app (package.json, vite.config.ts, tsconfig, tailwind, postcss, index.html, main.tsx, index.css, lib/types+data+stats)
- [x] 7. App shell (sidebar + mobile drawer + routes) + Dashboard (Sanctum style)
- [x] 8. Deploy app live (GitHub Actions -> Pages) — LIVE, verified 200 on html/js/css/hero.jpg
- [ ] 9. Phase 2: households/families + members + documents + schemes
- [ ] 10. Phase 3: Find Family + QR + ID Card Designer + Masjid Profile + exports
- [ ] 11. Phase 4: admin/users/device approval/audit/recycle bin/notifications
- [ ] 12. Phase 5: offline (IndexedDB) + sync + backup/restore + Drive
- [ ] 13. Phase 6: 4 languages + Urdu RTL + PWA + security/perf + prod verify

- [ ] 9. Phase 2: households/families + members + documents + schemes  <-- NOW
- [ ] 10. Phase 3: Find Family + QR + ID Card Designer + Masjid Profile + exports
- [ ] 11. Phase 4: admin/users/device approval/audit/recycle bin/notifications
- [ ] 12. Phase 5: offline (IndexedDB) + sync + backup/restore + Drive
- [ ] 13. Phase 6: 4 languages + Urdu RTL + PWA + security/perf + prod verify

## NOW
Step 9 — Dashboard live with sample data (10 households). Next: real data layer
(IndexedDB/localStorage store) + Households list + Add Household form + member rows.

## Decisions
- Fresh repo `masjid-records-v2`, stack = React+TS+Vite+Tailwind+Supabase.
- Deploy via GitHub Actions to Pages (build_type=workflow set 2026-11-12).
- Routing = HashRouter (safe on Pages). Vite base = `/masjid-records-v2/`.
- Design = Sanctum: azure #0E5C86/#4E9BC7, Sora display + Manrope body, white cards r20, bg #F5F7F9.
- Hero photo = Wikimedia Commons (Sultan Ahmed Mosque), public/hero.jpg.
- `shadow-float` + `.mono` added to Tailwind/CSS. `src/vite-env.d.ts` needed for `import.meta.env`.
- ⚠️ After switching Pages build_type, a QUEUED legacy "pages build and deployment" run can still
  overwrite the site with the repo root — if live html references `/src/main.tsx`, re-dispatch deploy.yml.

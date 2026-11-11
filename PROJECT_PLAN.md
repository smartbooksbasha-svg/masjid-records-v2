# Masjid Khidmat Records — v2 (Fresh Rebuild) — MASTER PLAN

GOAL: A fresh, modern, unique-looking community records web app built from
**RDP v1.0** ("Masjid Khidmat Records — Complete SRS & Development Plan").
Separate from the old vanilla app (`~/masjid-kidmat-records`) — do NOT merge.
Stack per RDP: React + TypeScript + Vite + Tailwind + Supabase.
Deploy: GitHub Actions -> GitHub Pages.

Repo: https://github.com/smartbooksbasha-svg/masjid-records-v2
Live: https://smartbooksbasha-svg.github.io/masjid-records-v2/

## NOW
Stage 1.5 UI PREVIEW GATE — 3 modern/unique design directions built & deployed,
waiting for Shan's pick.

## Webdev pipeline (stages)
- [x] 1 Idea discovery (RDP provided = the brief)
- [x] 2 User research (Shan + committee; existing app = proven needs)
- [x] 3 Requirements (RDP Parts A–N)
- [x] 4 PRD (RDP v1.0 IS the PRD)
- [ ] 5 PRD review + open questions
- [x] 6 User flow (from RDP nav + roles)
- [ ] 7 UX / IA / states
- [ ] 8 UI design system (after direction pick)
- [ ] 9 Technical spec / DB schema / RLS
- [ ] 10 Build plan
- [ ] 11 Implementation
- [ ] 12 Testing
- [ ] 13 Responsive
- [ ] 14 Security
- [ ] 15 Performance
- [ ] 16 Accessibility
- [ ] 17 SEO
- [ ] 18 UAT
- [ ] 19 Iterate
- [ ] 19b Customization round (before deploy)
- [ ] 20 Pre-launch checklist
- [ ] 21 Deploy
- [ ] 22 Post-launch

## RDP development phases (Part K)
- [ ] Phase 1 Foundation: project setup, Supabase, auth, migrations, RLS,
      roles, main layout
- [ ] Phase 2 Core records: dashboard, streets, family list/detail,
      add/edit family, members, documents, schemes
- [ ] Phase 3 Advanced: Find Family, QR scanner, ID Card Designer,
      Masjid Profile, reports, Excel/PDF exports
- [ ] Phase 4 Administration: admin mgmt, users, device approval, audit log,
      recycle bin, notifications
- [ ] Phase 5 Offline & backup: IndexedDB, drafts, sync queue, conflicts,
      JSON backup/restore, Google Drive
- [ ] Phase 6 Finalize: 4 languages + Urdu RTL, PWA install, security/perf
      testing, deploy, production verification

## Design gate
Round 1 (rejected by Shan): Civic Ledger · Midnight Registry · Arctic Atelier.
Round 2 (premium): Obsidian · Porcelain · **SANCTUM** <- PICKED 2026-11-12.
- [x] Direction picked: SANCTUM (cinematic, image-led)
- [ ] Design system: azure #0E5C86 / #4E9BC7 · Sora (display) + Manrope (body)
      · white cards radius 20 · bg #F5F7F9 · full-bleed mosque photo hero

## Key decisions
- 2026-11-12: New repo `masjid-records-v2`, fresh build, not merged with old.
- 2026-11-12: Stack = RDP stack (React+TS+Vite+Tailwind+Supabase).
- 2026-11-12: Deploy = GitHub Actions -> Pages (Vercel optional later).
- 2026-11-12: `~/masjid-family-hub` = reference only, not merged.

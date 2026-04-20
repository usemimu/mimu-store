---
name: mimu-design
description: Use this skill to generate well-branded interfaces and assets for mìmú, a Lagos-based digital out-of-home advertising platform. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for three product surfaces: the Advertiser mobile app, Host PWA, and mimu.ng marketing website.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

**Brand name:** mìmú (lowercase, diacritic on ì — always respect this)
**Pronunciation:** "mee-moo" · Yoruba: "to grab, to hold attention"

**Primary color (Clay):** `#B55430` — warm terracotta/Lagos clay. NOT fintech blue, NOT purple, NOT generic orange.
**Dark background:** `#0E0D0B` — near-black with warm undertone
**Success (Moss):** `#2B7244` · **Accent (Gold):** `#B4881C`

**Display typeface:** Cormorant (Google Fonts) — for headlines, campaign names, large numbers, hero text
**UI typeface:** Plus Jakarta Sans (Google Fonts) — for all UI text, body, labels
**Mono:** JetBrains Mono — for IDs, data, code

**Icons:** Phosphor Icons (regular weight, 1.5px stroke, 24px grid)
CDN: `https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css`

**Currency:** Always ₦ before amount. Nigerian comma formatting: ₦15,000 not ₦15000.

**Voice rules:**
- Numbers not adjectives ("₦14,200 earned" not "boost your earnings")
- No exclamation marks. No emoji. No corporate speak.
- Specific places ("50 screens in Yaba") not vague abstractions
- Plain Nigerian English, occasional natural Pidgin

**Dark mode:** Dark is PRIMARY (especially for website). Not an afterthought.

## Files

- `README.md` — full brand documentation
- `colors_and_type.css` — all CSS tokens
- `assets/` — logo SVGs (logo.svg, logo-white.svg, logo-black.svg, logo-favicon.svg, logo-mark.svg)
- `preview/` — design system card previews
- `ui_kits/advertiser-app/index.html` — Advertiser mobile app prototype
- `ui_kits/host-pwa/index.html` — Host PWA prototype
- `ui_kits/website/index.html` — mimu.ng marketing website prototype

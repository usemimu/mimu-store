# mìmú Design System

**mìmú** (pronounced "mee-moo") means "to grab, to hold attention" in Yoruba. It is a digital out-of-home (DOOH) advertising platform built in Lagos, Nigeria, that turns neighborhood small businesses — pharmacies, eateries, salons, barbershops — into a distributed digital screen network. Small businesses buy verified ad time starting at ₦5,000/campaign; on-device AI anonymously counts viewers, so advertisers pay for measured attention, not estimates.

**Sources:** No external codebase or Figma file was provided. This design system is entirely original, designed from the brief. All design decisions documented below are intentional and grounded in the brand strategy.

---

## Products / Surfaces

| Surface | Audience | Platform |
|---|---|---|
| **mìmú for Advertisers** | Nigerian SMEs: restaurant owners, fashion brands, fintechs, churches | React Native iOS + Android (375×812 frame) |
| **mìmú for Hosts** | Screen hosts: pharmacies, eateries, salons | PWA, 360×640 baseline Android |
| **mimu.ng Website** | SME evaluators, host prospects, national brands, press | Responsive web, 1440 desktop / 390 mobile |

---

## Positioning Pillars
1. **Built for Nigerian SMEs first** — Naira pricing, Pidgin/Yoruba-friendly, Paystack-native, APCON automatic
2. **Verified attention, not promises** — real AI-measured viewership, transparent proof of play
3. **Neighborhood infrastructure** — hosted by local businesses, earnings flow back to the neighborhood

---

## CONTENT FUNDAMENTALS

### Tone of voice
- **Warm, direct, Lagos-confident.** Grown, not cheeky. Serious about money, never sterile.
- Plain Nigerian English. Occasional natural Pidgin where it fits ("your account don activate").
- **Never** uses exclamation marks, emoji, or "excited to announce" language.
- Shows numbers, not adjectives: "₦14,200 earned this month" — never "boost your earnings today!"
- Uses specific places: "50 screens across Yaba" — never "reach your audience everywhere."

### Copy conventions
- Numbers: ₦ symbol always before amount, Nigerian comma formatting — ₦15,000 never ₦15000
- Dates: "Today, 3:42 PM" → "Mar 14" → "Mar 14, 2026" (Africa/Lagos timezone)
- Person: second-person "you/your business" not third-person. Avoid "users."
- Sentences: short, declarative. One idea per sentence.
- CTA labels: verb-first, specific — "Create campaign", "Add money", "View breakdown" — never "Get started", "Learn more", "Click here."
- Errors: say what happened + what to do. "Payment failed. Check your card details and try again."
- Empty states: give a number-anchored reason to act. "Screens in your LGA are free right now. First week always has the most open slots."

### Do / Don't examples
| Context | Do | Don't |
|---|---|---|
| Onboarding welcome | "Your first screen is in Surulere. 847 people pass it every day." | "Welcome to mìmú! 🎉 We're excited to have you!" |
| Error message | "We could not verify your card. Try again or use a different card." | "Oops! Something went wrong. Please try again later." |
| Success state | "Campaign is live. You're on 12 screens in Yaba." | "Congratulations! Your campaign is now live! 🚀" |
| Empty state | "No campaigns yet. Screens in Yaba start at ₦5,000 for a full week." | "You haven't created any campaigns yet. Get started today!" |
| Notification | "3,204 people saw your ad yesterday in Lekki." | "Your ad is performing great! Keep it up!" |

---

## VISUAL FOUNDATIONS

### Color Philosophy
**Primary — Lagos Clay (`--clay`):** A deep warm terracotta/clay, referencing Lagos laterite soil and terracotta architecture. Distinctly different from fintech blue, Kuda purple, and Flutterwave orange. Warm without being loud. Conveys groundedness and confidence.

**Neutral — Warm Charcoal scale:** Warm-tinted grays (slight warm bias in HSL, not cold blue-gray). Dark mode background is near-black with warm undertone (`#0E0D0B`), never pure black.

**Secondary — Moss Green (`--moss`):** Deep forest green for positive/success states and secondary accents. Pairs with clay without being the Nigerian flag cliché — it's darker and more sophisticated.

**Accent — Lagoon Gold (`--gold`):** Muted amber used sparingly for data highlights, financial figures, premium markers.

### Typography
**Display — Cormorant** (Google Fonts): Elegant high-contrast serif. Used for hero headlines, campaign names, large numbers. Supports ì and ú diacritics cleanly. Conveys editorial confidence; closer to a newspaper than a startup.

**UI / Body — Plus Jakarta Sans** (Google Fonts): Modern geometric sans. Clean, legible at small sizes, strong Latin extended support for diacritics. Used for all UI text, body copy, labels, captions.

**Mono — JetBrains Mono** (Google Fonts): Used for campaign IDs, codes, data tables. Tabular numbers.

### Spacing
Base unit: **8px**. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96. Touch targets minimum 48×48dp (56 preferred for Host PWA).

### Corner Radii
- **xs:** 4px — tags, badges
- **sm:** 8px — inputs, small cards
- **md:** 12px — cards, modals
- **lg:** 16px — sheets, large containers
- **xl:** 24px — hero cards, splash backgrounds
- **full:** 9999px — pills, avatars

### Shadows / Elevation
Three levels, warm-tinted (no cold blue drop shadows):
- **Level 1 (resting):** `0 1px 3px rgba(14,13,11,0.08), 0 1px 2px rgba(14,13,11,0.06)`
- **Level 2 (raised):** `0 4px 12px rgba(14,13,11,0.10), 0 2px 4px rgba(14,13,11,0.08)`
- **Level 3 (floating):** `0 12px 32px rgba(14,13,11,0.14), 0 4px 8px rgba(14,13,11,0.10)`
Dark mode: same structure, opacity slightly higher (ambient light is lower).

### Backgrounds
- Light mode: off-white `#F7F5F2` base, never pure white. Cards on `#FFFFFF` with level-1 shadow.
- Dark mode: `#0E0D0B` base. Cards on `#1A1815`. Surface 2 (raised): `#232018`. Border: `rgba(255,255,255,0.08)`.
- No gradients on backgrounds. No full-bleed pattern overload. Texture is expressed through typography and space, not decoration.
- Photography: documentary/editorial. Real Lagos locations, natural warm light, small business environments. Never stock photography.

### Animation / Motion
mìmú is about *attention* — motion is intentional, never decorative.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) for entrances. `cubic-bezier(0.4, 0, 1, 1)` for exits. `cubic-bezier(0.4, 0, 0.2, 1)` (standard) for state changes.
- **Duration scale:** micro 80ms, fast 150ms, normal 250ms, slow 400ms, deliberate 600ms
- **What moves:** page transitions (slide), modals (rise), toasts (slide from bottom), numbers (count-up for impressive stats)
- **What doesn't move:** content already in viewport, icons on hover, static decorative elements
- No bounces, no spring physics. Controlled, grown.

### Borders & Dividers
- Light mode: `#E8E4DE` (warm gray border)
- Dark mode: `rgba(255,255,255,0.08)` (subtle white alpha)
- 1px borders only. No thick colored borders. No accent-colored left-borders.

### Cards
- Light: white background, level-1 shadow, 12px radius
- Dark: `#1A1815` background, 1px border `rgba(255,255,255,0.08)`, 12px radius
- Hover: level-2 shadow (light) or border brightens to `rgba(255,255,255,0.14)` (dark)
- No colored card backgrounds except semantic states (success/warning/error tints)

### Hover / Press States
- Interactive elements: opacity 0.85 on hover; scale(0.97) on press
- Links: color darkens (not underline on hover)
- Buttons: darken primary color by ~15% on hover; no glow/shadow changes
- No color shifts to new hues on hover — state changes are tonal, not chromatic

### Transparency / Blur
Used sparingly:
- Navigation bar on scroll: `backdrop-filter: blur(20px)` with 80% opacity background
- Modal overlays: `rgba(14,13,11,0.6)` scrim
- Not used decoratively; only for functional overlay contexts

### Iconography style
See ICONOGRAPHY section below.

---

## ICONOGRAPHY

**Approach:** Phosphor Icons (phosphoricons.com) as the base icon set. Regular weight (stroke, not filled), 1.5px stroke, rounded joins and caps, 24×24 base grid (also works at 16, 20, 32). Phosphor has excellent coverage and a clean, confident aesthetic that matches mìmú's tone.

**Base set:** Phosphor Icons loaded from CDN (`https://unpkg.com/@phosphor-icons/web`). Import in HTML: `<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />` (or via the phosphor-react package in React Native).

**Modifications:** 
- Stroke color always inherits from text color (no hardcoded icon colors except semantic states)
- Icons inside buttons: 20px
- Standalone icons: 24px  
- Display/hero contexts: 32px
- Never scale icons with `transform` — use the right size class

**No emoji used as icons.** No Unicode chars as functional icons. No decorative icon grids or icon-heavy layouts.

**Custom mark:** The mìmú brand mark is a custom SVG — a geometric focal-point diamond suggesting "captured attention." Not derived from any icon library. See `assets/logo-mark.svg`.

**Assets directory:** `assets/` contains logo SVGs in all required variations.

---

## File Index

| Path | Contents |
|---|---|
| `README.md` | This file — full brand + design system documentation |
| `SKILL.md` | Agent skill descriptor for Claude Code |
| `colors_and_type.css` | All CSS custom properties: color tokens, type scale, spacing, radius, shadow |
| `assets/logo.svg` | Primary wordmark, full color |
| `assets/logo-white.svg` | Wordmark on dark / white version |
| `assets/logo-black.svg` | Wordmark on light / black version |
| `assets/logo-mark.svg` | Symbol/mark only (for favicon, avatar, app icon) |
| `assets/logo-horizontal.svg` | Mark + wordmark horizontal lockup |
| `assets/logo-stacked.svg` | Mark + wordmark stacked lockup |
| `preview/` | Design System tab preview cards |
| `ui_kits/advertiser-app/` | Advertiser mobile app UI kit |
| `ui_kits/host-pwa/` | Host PWA UI kit |
| `ui_kits/website/` | mimu.ng marketing website UI kit |

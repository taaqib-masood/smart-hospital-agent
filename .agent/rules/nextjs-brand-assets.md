---
trigger: model_decision
description: Complete procedure for updating favicons and brand icons in Next.js App Router projects.
---

# Next.js Brand Icon & Favicon Checklist

When updating logos and favicons in Next.js App Router:
1. Always generate and replace:
   - `app/favicon.ico` (32x32 standard favicon)
   - `app/icon.png` (192x192 PNG app icon)
   - `app/apple-icon.png` (180x180 Apple touch icon)
   - `public/favicon.ico` & `public/icon.png` (for fallback static routing)
2. Declare explicitly in `app/layout.tsx` `metadata.icons` with both array entries for PNG and ICO.
3. Test direct HTTP 200 response on `/favicon.ico` and `/icon.png`.

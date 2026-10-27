---
name: germinai-design-system
description: Applies GerminAI's React design system, brand tokens and aligned layout patterns. Use automatically when creating, modifying or reviewing GerminAI UI, pages, components, styles, responsive layouts, article/editor/account interfaces, or GerminAI visual alignment.
---
# GerminAI design system

1. Read the actual affected page/component and reuse @germinai/design-system exports. Do not create a second primitive convention.
2. Read [tokens.md](tokens.md) for colors, typography, spacing, motion and responsive rules; [components.md](components.md) for the complete public inventory; [examples.md](examples.md) for alignment and controlled examples.
3. Keep title and description in one left-aligned stack. Optional actions go right, never the explanatory paragraph. Institution logo/info/story share one compact surface with matched top padding; the independence note stays in its footer.
4. Use scoped g-* classes/CSS variables and import @germinai/design-system/styles.css. Preserve monochrome brand identity and the subtle gradient section-band signature. No bright accent, arbitrary ornament or oversized whitespace.
5. Native controls need visible labels and associated help/errors. Sheets need accessible title/description, focus containment, Escape and focus return. Respect reduced motion and narrow screens.
6. Preserve real PT/EN content, routing and application-owned API/auth/review/serialization. Demo controls preview actual local values; never pretend to log in, send email, upload or publish.
7. Use genuine existing public brand asset URLs. Do not copy third-party assets or imply Instituto J&F endorsement. Software MIT does not license marks/portraits.

Source package: https://github.com/edumdp-dev/germinai-design-system. Complete interactive examples: gallery/main.tsx in that repository. Request verification only when the assignment allows it; do not invent build/test/browser results.

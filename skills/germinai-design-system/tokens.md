# Brand tokens and layout

| CSS token | Value | Role |
| --- | --- | --- |
| --g-bg | #050505 | Page background |
| --g-fg | #f5f5f5 | Titles and controls |
| --g-body | #a0a0a0 | Paragraphs and context |
| --g-surface | #0d0d0d | Shared panels |
| --g-raised | #161616 | Raised state |
| --g-border | #262626 | Quiet edges |
| --g-focus | #dedede | Keyboard outline |
| --g-display | Space Grotesk Variable / Space Grotesk / sans-serif | Display |
| --g-font | Geist Variable / Geist / sans-serif | Body |
| --g-mono | JetBrains Mono / monospace | Metadata/code |
| --g-space-1/2/3/4/6/8/14 | 8/16/24/32/48/64/112px | 8px spacing basis |
| --g-radius | 12px | Surface corners |
| --g-duration | 180ms | Control transitions |
| --g-ease | cubic-bezier(.2,.7,.2,1) | Restrained easing |

## Type and measure
Display 500 weight, tight tracking (-.055em for major headings), line-height 1.08. Page title clamp(40px,5.2vw,68px); section title clamp(30px,4.2vw,52px), 36px on narrow screens. Cards 24px/1.2, -.035em. Body 15px/1.75, max65ch. Metadata 11px/1.7 monospace. Small help 12px/1.7. Load fonts in the application; library does not inject global font imports.

## Structure
.g-shell: max1180px; width calc(100% - 96px), 56px below1024, 40px below768. Section bands: vertical padding96px, 80px below1024, 64px below768. Page intro88px/64px, mobile56px/40px. Heading stack gap16px; heading/action gap32px; heading bottom40px, mobile28px. Cards/panels32px padding, mobile24px. Responsive columns use minmax(0,1fr). Mission grid3 columns becomes1 below768. Reading column65ch with220px sidebar; mobile sidebar moves before article.

## Signature and alignment
SectionBand backgrounds transition from #050505 through #090909 (base), #0d0d0d (soft), or #161616 (raised), then back to #050505. Gradients live on sections, never overlay readable content. Do not replace every separator with a gradient or add giant empty gutters.
InstitutionPanel: one surface; columns minmax(220px,.7fr) and minmax(0,1.5fr), gap48px; equal32px top padding and align-items:start. Genuine logo on compact light plate, max240px width, intrinsic ratio. Story starts at same top edge; no forced tall logo area. Footer has20px/32px padding within the same panel. Mobile uses one column and24px padding.

## Interaction/accessibility
Visible2px keyboard focus with4px offset. Inputs44px minimum height; primary mobile actions use Button size=lg (44px). Compact sizes are for dense desktop contexts, not the only mobile navigation target. Disabled controls retain native semantics. Destructive/status meaning must be text, not color. Hover movement is at most3px on resources and1.025x on portraits. Reduced motion disables transitions/animations; particles render still and stop offscreen/background. Sheet uses Radix modal behavior with labelled content and focus restoration. Keep paragraphs in actual semantic elements in slots. Navigation slots own their localized nav aria-label.

## Rights
Software MIT; GerminAI/Instituto J&F names and logos, founder portraits and third-party marks retain owners' rights. Use https://germinai.duds.dev/images/brand-lockup.webp, brand-mark.webp, instituto-jef.png, eduardo.webp, enzo.webp and nicolas.webp as remote URLs when appropriate. Do not fake, crop or distort institution marks. Clearly state GerminAI's independence; never imply an official institution channel.

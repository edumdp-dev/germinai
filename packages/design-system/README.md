# GerminAI design system

Accessible React/TypeScript components drawn from the real GerminAI site: black and neutral surfaces, Space Grotesk display typography, Geist body text, JetBrains Mono metadata and gentle section-transition gradients. No Tailwind dependency, API credentials, backend, or paid services.

## Install

React and React DOM 18.2+ are peer dependencies. Node 20.19+ is recommended.

```sh
npm install github:edumdp-dev/germinai-design-system
```

For reproducible releases append the published commit: `github:edumdp-dev/germinai-design-system#COMMIT_SHA`. npm Git installation runs `prepare`, building JavaScript, scoped CSS and TypeScript declarations. Local integration: `npm install ../germinai-design-system` after installing/building this repository. This repository must be published before the Git installation command is available.

```tsx
import { PageIntro, SectionBand, SectionHeading, Button } from '@germinai/design-system'
import '@germinai/design-system/styles.css'

export function LearningPage() {
  return <main className="g-theme">
    <PageIntro title="Aprender é a nossa origem." description="Projetos e conhecimento compartilhado." />
    <SectionBand tone="soft">
      <div className="g-shell">
        <SectionHeading title="Nossa missão." description="Democratizar o estudo e o uso da inteligência artificial." />
        <Button asChild variant="outline"><a href="https://germinai.duds.dev">Conheça o GerminAI</a></Button>
      </div>
    </SectionBand>
  </main>
}
```

Load the fonts in the consuming app (not bundled into the library). The showcase uses `@fontsource-variable/geist`, `@fontsource-variable/space-grotesk`, and `@fontsource/jetbrains-mono/400.css`. System fallbacks remain usable without them. Scoped CSS affects only `g-*` classes and descendants; `g-theme` is the optional application shell. No global body or root styles are applied by the package. Components inherit the documented brand CSS variables; override them on the actual component class if a themed instance is needed.

## Run the interactive showcase

```sh
npm install
npm run dev
npm run build
npm run build:gallery
npm run preview
```

`dev` serves the gallery. `build` emits `dist/index.js`, `dist/styles.css` and declarations. `build:gallery` emits the standalone static site to `showcase-dist`; `preview` previews that output. The gallery includes usage code for every component and the full callable source. Email input, composer, file selection and review actions only preview real local values: no email is sent, no account is created, no file uploaded and no article published. A real bundled text file demonstrates downloads. Remote logos and portraits link to GerminAI’s public site instead of copying brand assets.

## API and design guidance

- [Complete exported API and component inventory](skills/germinai-design-system/components.md)
- [Tokens, responsive layout, motion and brand rules](skills/germinai-design-system/tokens.md)
- [Correct alignment and controlled examples](skills/germinai-design-system/examples.md)
- Source of runnable examples: `gallery/main.tsx`.

`Button` preserves `asChild`, six variants and eight sizes. `Badge` preserves `asChild` and six variants. The Radix-backed `Sheet` preserves root/trigger/close props and the named header/footer/title/description/content exports, `side` and `showCloseButton`. Focus containment, Escape dismissal, outside-pointer dismissal and focus restoration are provided by Radix, not hand-written approximations. Always supply a SheetTitle and SheetDescription (or deliberately set `aria-describedby={undefined}` where there is no description).

Application controllers retain localization, routing, API operations, serialization and authorization. `HeaderFrame` and `FooterFrame` accept caller-owned navigation landmarks with localized labels. `linkComponent` on cards accepts native anchor props, so React Router can be adapted without coupling the package to a router. `PostComposer` does not generate or silently alter a slug; the controller owns that decision.

Downloads accept root-relative and HTTP(S) URLs only. AttachmentList is presentation, not file validation or access control. Serve sensitive files from authorized endpoints with download headers. Institutional information and story share one surface with equal top padding; its independence note belongs in the same panel footer.

## Agent skill

The automatically matched skill lives in `skills/germinai-design-system/`. Copy that complete directory to `~/.agents/skills/germinai-design-system/`; keep SKILL.md and all three reference files together. It covers GerminAI UI creation, maintenance and alignment, not backend behavior. Installation does not change global agent policies.

## Licensing and provenance

Software and documentation are MIT licensed; see LICENSE. GerminAI names, logos, founder portraits, Instituto J&F marks and other brand assets are not licensed by the software license. Their rights remain with their respective owners. Do not imply institutional endorsement, crop or distort the genuine Instituto J&F logo, or redistribute third-party images under MIT. The gallery references existing public GerminAI image URLs. Original pattern evidence came from GerminAI site components, pages and styles; Radix handles dialog and slot accessibility.

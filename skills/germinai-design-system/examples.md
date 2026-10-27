# Correct composition examples

Import components from @germinai/design-system and import @germinai/design-system/styles.css. Use a g-theme app shell and app-loaded fonts. These examples are functions callable in a React app.

## Heading and institution alignment

```tsx
import { SectionBand, SectionHeading, InstitutionPanel } from '@germinai/design-system'
export function OriginSection() {
  return <SectionBand tone="soft"><div className="g-shell">
    <SectionHeading title="De onde viemos." description="Nos encontramos em um ambiente de formação prática." />
    <InstitutionPanel
      logo={<img src="https://germinai.duds.dev/images/instituto-jef.png" alt="Instituto J&F" />}
      info={<><p>Centro de Educação para os Negócios</p><p>Escola · Empresa · Família</p></>}
      story={<><p>Foi nesse ambiente que nasceu a vontade de aprender e construir juntos.</p><p>Compartilhamos ferramentas, projetos e descobertas sobre inteligência artificial.</p></>}
      footer="O GerminAI é uma iniciativa independente de estudantes, não um canal oficial do Instituto J&F."
    />
  </div></SectionBand>
}
```

Correct: [title → description] left; optional action right. Incorrect: title left and description detached right. Correct institution: logo/info and story start with equal panel padding; independence note spans same panel footer. Incorrect: logo in giant vertically centered column, narrow story with arbitrary top offset or note orphaned outside.

## Fully controlled draft, honest local preview

```tsx
import { useState } from 'react'
import { PostComposer, type ComposerValue } from '@germinai/design-system'
export function DraftExample() {
  const [value, setValue] = useState<ComposerValue>({ title: 'Aprender juntos', slug: 'aprender-juntos', excerpt: 'Um ponto de partida compartilhado.', locale: 'pt', category: 'Aprendizado', sections: [{ heading: 'Contexto', text: 'Mantenha o contexto perto do título.' }] })
  const [preview, setPreview] = useState<ComposerValue | null>(null)
  return <div className="g-theme">
    <PostComposer value={value} onChange={setValue} heading="Rascunho local" submitLabel="Visualizar rascunho" onSubmit={event => { event.preventDefault(); setPreview(value) }} />
    {preview && <output><h2>{preview.title}</h2><p>{preview.excerpt}</p>{preview.sections.map((section,index) => <section key={index}><h3>{section.heading}</h3><p>{section.text}</p></section>)}</output>}
  </div>
}
```

Actual application: keep API calls in the controller, serialize sections into paragraph arrays there, preventDefault, update busy/error and only report real server success. Never label the gallery action Publish/Sign in if it only changes local state.

## Sheet and label associations

```tsx
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, Button, Field, Input } from '@germinai/design-system'
export function Preferences() {
  return <Sheet><SheetTrigger asChild><Button size="lg">Preferências</Button></SheetTrigger>
    <SheetContent side="right" closeLabel="Fechar preferências"><SheetHeader><SheetTitle>Preferências</SheetTitle><SheetDescription>Controles locais de visualização.</SheetDescription></SheetHeader>
      <Field label="Nome" hint="Nome usado na visualização."><Input autoComplete="name" /></Field>
      <SheetFooter><SheetClose asChild><Button variant="outline">Fechar</Button></SheetClose></SheetFooter>
    </SheetContent>
  </Sheet>
}
```

Keep asChild to one real element. Supply icon-button aria-labels. Avoid nested buttons/anchors, nested navigation landmarks and unlabelled controls. Sheets include portal and overlay; do not duplicate them around SheetContent.

## Router adapter

```tsx
import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { PostCard } from '@germinai/design-system'
const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function RouterLink({ href = '/', ...props }, ref) { return <Link ref={ref} to={href} {...props} /> })
export function ArticleLink() {
  return <PostCard title="Aprender juntos" excerpt="Conhecimento compartilhado." category="Aprendizado" authorName="GerminAI" readTime="2 min" href="/pt/blog/aprender-juntos" locale="pt" linkComponent={RouterLink} />
}
```

Full component/state coverage lives in gallery/main.tsx; those examples are presentation only. Preserve PT/EN meanings and genuine public image assets when moving patterns into real pages.

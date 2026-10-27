# Complete exported inventory

All components accept the documented className where applicable; native primitives forward refs and native props. Node means ReactNode. Public types: Variant, ButtonSize, PostStatus, Attachment, LinkComponent, ComposerValue, PostComposerProps. Library exports no backend calls.

## Primitives
- Button: native button props + asChild?:boolean, variant?:default|destructive|outline|secondary|ghost|link, size?:default|xs|sm|lg|icon|icon-xs|icon-sm|icon-lg. asChild uses Radix Slot for one real child. buttonVariants({variant?,size?,className?}) returns scoped classes.
- Badge: native span props + asChild and same six variants. badgeVariants({variant?,className?}) returns scoped classes.
- Sheet: Radix Dialog.Root props (open/defaultOpen/onOpenChange/modal). SheetTrigger and SheetClose accept Radix props incl asChild. SheetPortal/SheetOverlay exported for advanced composition. SheetContent: Radix Content props + side?:top|right|bottom|left, showCloseButton?:boolean, closeLabel?:string. It includes its portal/overlay. SheetHeader/SheetFooter: div props. SheetTitle/SheetDescription: Radix title/description props. Always pair title and description; callers own local language.
- Surface: native div props; bordered rounded panel.
- Input/Textarea/Select: full native respective props, refs, scoped styling. Select takes real option children.
- Field({label:Node,hint?:Node,error?:Node,children:one control ReactElement,id?,className?}): creates/uses control ID, labels it, merges aria-describedby and sets aria-invalid for error. Use one native/custom forwarded-prop control, not an opaque nested fragment.
- StatusBadge({status:pending|published|rejected,locale?:pt|en,children?,className?}): truthful localized state text; optional label override.
- RoleBadge({role:visitor|member|admin|superadmin,locale?:pt|en,children?,className?}): truthful localized role; authorization remains server-owned.
- AttachmentList({items:Attachment[],label?:Node,locale?:pt|en,className?}). Attachment={id,name,size,mimeType,sha256,downloadUrl}; all required. Only root-relative or HTTP(S) downloadable anchors; invalid URLs render filename without link. Empty list renders nothing. Authorization and response headers remain server-owned.

## Page/layout
- PageIntro({title:Node,description:Node,eyebrow?:Node,className?}): page H1 with context.
- SectionHeading({id?,title:Node,description?:Node,action?:Node,className?,level?:2|3}): id labels the heading, copy stacked left, optional action right.
- SectionBand: HTML section props + tone?:base|raised|soft; supplies subtle monochrome background/padding, not shell width.
- HeaderFrame({brand:Node,navigation:Node,actions:Node,skipLink?:Node,className?}). FooterFrame({brand:Node,description?:Node,navigation:Node,actions?:Node,bottom?:Node,className?}). Slot owns links, controllers and navigation landmark/localized aria-label.
- InstitutionPanel({logo:Node,info:Node,story:Node,footer:Node,className?}): one shared surface, compact source column, readable story, in-panel note.
- MissionGrid({children:Node,className?}): supply semantic article items with heading and paragraph.
- FounderCard({image:Node,name:Node,role:Node,action:Node,className?}): image slot preserves alt and object position; caller supplies link.
- ParticleField({className?}): decorative canvas orbit, no required props, no meaningful content hidden in it.
- ArticleLayout({title:Node,description?:Node,category?:Node,metadata?:Node,backLink?:Node,sidebar?:Node,children:Node,related?:Node,className?}): article structure/readable body/sidebar, caller supplies sections and TOC.

## Cards
- ResourceCard({name:string,subtitle:Node,description:Node,url:string,logo:string|Node,className?,newTabLabel?:string}): external link with rel=noopener noreferrer and accessible new-tab context. String logo uses decorative image; Node allows customized branded plate.
- ProjectCard({title:string,subtitle:Node,description?:Node,href:string,tags?:string[],kind?:terminal|library,compact?:boolean,actionLabel?:string,linkComponent?:LinkComponent,newTab?:boolean,className?}): supplied content with neutral terminal/book preview. Compact hides extended description/tags.
- PostCard({title,excerpt,category,authorName,readTime,publishedAt?,href,icon?:Node,linkComponent?:LinkComponent,locale?:pt|en,className?}): string text props; publishedAt ISO date, localized UTC formatting.
- LinkComponent=React.ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>>. Adapt Router Link by mapping href to to, preserve refs/native props. Library has no router dependency.

## Account/editor/review
- LoginPanel({title:Node,description:Node,note?:Node,heading:Node,children:Node,footer?:Node,className?}): intro and form surface; real forms/API/status supplied by caller.
- ComposerValue={title:string,slug:string,excerpt:string,locale:pt|en,category:string,sections:{heading:string,text:string}[]}.
- PostComposer({value:ComposerValue,onChange(next),onSubmit(formEvent),onCancel?,heading?:Node,submitLabel?:string,busy?:boolean,error?:Node,fileControl?:Node,className?,description?:Node,uiLocale?:pt|en}): fully controlled title/slug/excerpt/language/category/sections, add up to30 sections, remove while more than1. Native validation/length bounds; blank-line text serialization stays caller-owned. uiLocale defaults to article locale. FileControl is a slot, never an upload implementation. onSubmit must preventDefault if handling asynchronously. Parent decides slug generation, request format, errors and actual success.
- ReviewCard({title:Node,excerpt:Node,status:PostStatus,locale?:pt|en,category?:Node,authorName?:Node,path?:Node,reviewNote?:Node,children?:Node,controls?:Node,actions?:Node,className?,previewLabel?:string}): status, expandable actual article body and optional real review controls. No invented approve/reject effects; caller supplies permission checks, note requirement, requests and actions.

## Example coverage
Runnable gallery/main.tsx includes every value export: six Button/Badge variants, all button sizes, asChild links, variant helpers, controlled fields, all statuses/roles, normal and composed Sheets, real bundled AttachmentList download, every layout/card/pattern, controlled composer and locally previewed review note. Each family has displayed usage code; the full gallery source includes imports and state.

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import * as Dialog from '@radix-ui/react-dialog'

export type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
const join = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ')
export function buttonVariants({ variant = 'default', size = 'default', className }: { variant?: Variant | null; size?: ButtonSize | null; className?: string } = {}) { return join('g-button', `g-button--${variant ?? 'default'}`, `g-button--${size ?? 'default'}`, className) }
export function badgeVariants({ variant = 'default', className }: { variant?: Variant | null; className?: string } = {}) { return join('g-badge', `g-badge--${variant ?? 'default'}`, className) }
export const Button = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<'button'> & { variant?: Variant; size?: ButtonSize; asChild?: boolean }>(function Button({ variant, size, asChild, className, ...props }, ref) {
  const Component = asChild ? Slot : 'button'
  return <Component ref={ref} data-slot="button" className={buttonVariants({ variant, size, className })} {...props} />
})
export const Badge = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'> & { variant?: Variant; asChild?: boolean }>(function Badge({ variant, asChild, className, ...props }, ref) {
  const Component = asChild ? Slot : 'span'
  return <Component ref={ref} data-slot="badge" className={badgeVariants({ variant, className })} {...props} />
})
export function Sheet(props: React.ComponentProps<typeof Dialog.Root>) { return <Dialog.Root {...props} /> }
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close
export const SheetPortal = Dialog.Portal
export const SheetOverlay = React.forwardRef<React.ElementRef<typeof Dialog.Overlay>, React.ComponentPropsWithoutRef<typeof Dialog.Overlay>>(function SheetOverlay({ className, ...props }, ref) { return <Dialog.Overlay ref={ref} className={join('g-sheet-overlay', className)} {...props} /> })
export const SheetContent = React.forwardRef<React.ElementRef<typeof Dialog.Content>, React.ComponentPropsWithoutRef<typeof Dialog.Content> & { side?: 'left' | 'right' | 'top' | 'bottom'; showCloseButton?: boolean; closeLabel?: string }>(function SheetContent({ side = 'right', showCloseButton = true, closeLabel = 'Fechar / Close', className, children, ...props }, ref) {
  return <SheetPortal><SheetOverlay /><Dialog.Content ref={ref} className={join('g-sheet', `g-sheet--${side}`, className)} {...props}>{children}{showCloseButton && <SheetClose className="g-sheet-close" aria-label={closeLabel}><span aria-hidden="true">×</span></SheetClose>}</Dialog.Content></SheetPortal>
})
export function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) { return <div className={join('g-sheet-header', className)} {...props} /> }
export function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) { return <div className={join('g-sheet-footer', className)} {...props} /> }
export const SheetTitle = React.forwardRef<React.ElementRef<typeof Dialog.Title>, React.ComponentPropsWithoutRef<typeof Dialog.Title>>(function SheetTitle({ className, ...props }, ref) { return <Dialog.Title ref={ref} className={join('g-sheet-title', className)} {...props} /> })
export const SheetDescription = React.forwardRef<React.ElementRef<typeof Dialog.Description>, React.ComponentPropsWithoutRef<typeof Dialog.Description>>(function SheetDescription({ className, ...props }, ref) { return <Dialog.Description ref={ref} className={join('g-copy', className)} {...props} /> })
export function Surface({ className, ...props }: React.ComponentProps<'div'>) { return <div className={join('g-surface', className)} {...props} /> }
export const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(function Input({ className, ...props }, ref) { return <input ref={ref} className={join('g-input', className)} {...props} /> })
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentPropsWithoutRef<'textarea'>>(function Textarea({ className, ...props }, ref) { return <textarea ref={ref} className={join('g-input', className)} {...props} /> })
export const Select = React.forwardRef<HTMLSelectElement, React.ComponentPropsWithoutRef<'select'>>(function Select({ className, ...props }, ref) { return <select ref={ref} className={join('g-input', className)} {...props} /> })
/** Wrap one control: id, help and error association are applied to the child. */
export function Field({ label, hint, error, children, id, className }: { label: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; children: React.ReactElement<React.HTMLAttributes<HTMLElement> & { id?: string }>; id?: string; className?: string }) {
  const generated = React.useId(); const controlId = id ?? children.props.id ?? generated
  const describedBy = [children.props['aria-describedby'], hint ? `${controlId}-hint` : '', error ? `${controlId}-error` : ''].filter(Boolean).join(' ')
  return <div className={join('g-field', className)}><label htmlFor={controlId}>{label}</label>{React.cloneElement(children, { id: controlId, 'aria-describedby': describedBy || undefined, 'aria-invalid': error ? true : children.props['aria-invalid'] })}{hint && <p className="g-help" id={`${controlId}-hint`}>{hint}</p>}{error && <p className="g-error" role="alert" id={`${controlId}-error`}>{error}</p>}</div>
}
export type PostStatus = 'pending' | 'published' | 'rejected'
export function StatusBadge({ status, locale = 'pt', children, className }: { status: PostStatus; locale?: 'pt' | 'en'; children?: React.ReactNode; className?: string }) { const labels = locale === 'en' ? { pending: 'Awaiting review', published: 'Published', rejected: 'Changes requested' } : { pending: 'Em revisão', published: 'Publicado', rejected: 'Ajustes solicitados' }; return <Badge variant="outline" className={className} data-status={status}>{children ?? labels[status]}</Badge> }
export function RoleBadge({ role, locale = 'pt', children, className }: { role: 'visitor' | 'member' | 'admin' | 'superadmin'; locale?: 'pt' | 'en'; children?: React.ReactNode; className?: string }) { const labels = locale === 'en' ? { visitor: 'Visitor', member: 'Member', admin: 'Admin', superadmin: 'Superadmin' } : { visitor: 'Visitante', member: 'Membro', admin: 'Admin', superadmin: 'Superadmin' }; return <Badge variant="secondary" className={className}>{children ?? labels[role]}</Badge> }
export interface Attachment { id: string; name: string; size: number; mimeType: string; sha256: string; downloadUrl: string }
export function AttachmentList({ items, label, locale = 'pt', className }: { items: Attachment[]; label?: React.ReactNode; locale?: 'pt' | 'en'; className?: string }) {
  const titleId = React.useId()
  if (!items.length) return null
  return <section className={join('g-attachments', className)} aria-labelledby={titleId}><h3 id={titleId}>{label ?? 'Downloads'}</h3><ul>{items.map(item => <li key={item.id}>{/^(?:https?:\/\/[^\\\s]+|\/(?![/\\])[^\\\s]*)$/.test(item.downloadUrl) ? <a href={item.downloadUrl} download={item.name} rel="noopener noreferrer">{item.name}<span className="g-sr-only"> — {locale === 'en' ? 'download file' : 'baixar arquivo'}</span></a> : <span>{item.name}</span>}<span className="g-meta">{new Intl.NumberFormat(locale).format(item.size / 1024)} KiB · {item.mimeType}</span></li>)}</ul></section>
}

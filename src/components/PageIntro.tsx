export default function PageIntro({ title, description }: { title: string; description: string }) {
  return (
    <header className="page-intro container-shell">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

import { BookOpen, Terminal } from "lucide-react"
import { PostCard } from "@germinai/design-system"
import RouterLink from "@/components/RouterLink"
import type { BlogArticle } from "@/lib/blog"
import { articlePath, type Locale } from "@/lib/i18n"

export default function PostList({ items, locale }: { items: BlogArticle[]; locale: Locale }) {
  return <div className="post-list">
    {items.map(post => {
      const Icon = post.projectId === "oh-my-goat" ? Terminal : BookOpen
      return <PostCard
        key={post.id}
        title={post.title}
        excerpt={post.excerpt}
        category={post.category}
        authorName={post.authorName}
        readTime={post.readTime}
        locale={locale}
        publishedAt={post.publishedAt ?? undefined}
        href={articlePath(locale, post.id)}
        icon={<Icon strokeWidth={1.2} aria-hidden="true" />}
        linkComponent={RouterLink}
      />
    })}
  </div>
}

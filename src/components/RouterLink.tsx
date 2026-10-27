import { forwardRef, type AnchorHTMLAttributes } from "react"
import { Link } from "react-router-dom"

/** Supplies the site's router to presentation-only design-system cards. */
const RouterLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
  function RouterLink({ href = "", ...props }, ref) {
    return <Link ref={ref} to={href} {...props} />
  },
)

export default RouterLink

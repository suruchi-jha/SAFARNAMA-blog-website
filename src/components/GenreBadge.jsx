import { Link } from "react-router-dom"

export default function GenreBadge({ genre, small = false, large = false }) {
  if (!genre || !genre.name) {
    return null
  }

  let className = "genre-badge"
  if (large) className += " large"
  if (small) className += " small"

  return (
    <Link to={`/blogs/genre/${genre.name.toLowerCase()}`} className={className}>
      {genre.name}
    </Link>
  )
}

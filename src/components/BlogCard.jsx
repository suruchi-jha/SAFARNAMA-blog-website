import { Link } from "react-router-dom"
import GenreBadge from "./GenreBadge"
import { ThumbsUp, ThumbsDown } from "lucide-react"

export default function BlogCard({ blog, compact = false, grid = false }) {
  if (!blog) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-muted">Blog information unavailable</p>
        </div>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date"
    try {
      const options = { year: "numeric", month: "short", day: "numeric" }
      return new Date(dateString).toLocaleDateString(undefined, options)
    } catch (e) {
      return dateString
    }
  }

  const truncateContent = (content, maxLength) => {
    if (!content) return ""
    if (content.length <= maxLength) return content
    return content.substr(0, maxLength) + "..."
  }

  const safeAuthor = blog.author || { username: "Unknown", profilePhoto: null }
  const safeGenres = Array.isArray(blog.genres) ? blog.genres : []
  const safeUpvoteCount = blog.upvoteCount || 0
  const safeDownvoteCount = blog.downvoteCount || 0

  if (grid) {
    return (
      <div className="blog-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="blog-card-content" style={{ flexGrow: 1 }}>
          <h3 className="blog-title">
            <Link to={`/blogs/${blog.id}`}>{blog.title || "Untitled Blog"}</Link>
          </h3>

          <div className="genre-badges">
            {safeGenres.slice(0, 3).map((genre) => (
              <GenreBadge key={genre.id} genre={genre} small />
            ))}
            {safeGenres.length > 3 && <span className="genre-badge">{safeGenres.length - 3}</span>}
          </div>

          <div className="blog-meta">
            <span>
              By{" "}
              <Link to={`/users/${safeAuthor.username}`} className="blog-author">
                {safeAuthor.username}
              </Link>{" "}
              on {formatDate(blog.createdAt)}
            </span>
          </div>

          <p className="blog-excerpt">{truncateContent(blog.content || "", 120)}</p>
        </div>

        <div className="blog-actions">
          <Link to={`/blogs/${blog.id}`} className="btn btn-primary">
            Read More
          </Link>

          <div className="blog-votes">
            <div className="vote-btn upvote">
              <ThumbsUp size={14} />
              <span>{safeUpvoteCount}</span>
            </div>
            <div className="vote-btn downvote">
              <ThumbsDown size={14} />
              <span>{safeDownvoteCount}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="blog-card">
        <div className="blog-card-content">
          <h3 className="blog-title">
            <Link to={`/blogs/${blog.id}`}>{blog.title || "Untitled Blog"}</Link>
          </h3>

          <div className="blog-meta">
            <span>Posted on {formatDate(blog.createdAt)}</span>
          </div>

          <p className="blog-excerpt">{truncateContent(blog.content || "", 100)}</p>

          <div className="blog-actions">
            <Link to={`/blogs/${blog.id}`} className="btn btn-primary">
              Read More
            </Link>

            <div className="blog-votes">
              <div className="vote-btn upvote">
                <ThumbsUp size={14} />
                <span>{safeUpvoteCount}</span>
              </div>
              <div className="vote-btn downvote">
                <ThumbsDown size={14} />
                <span>{safeDownvoteCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-card">
      <div className="blog-card-content">
        <h3 className="blog-title">
          <Link to={`/blogs/${blog.id}`}>{blog.title || "Untitled Blog"}</Link>
        </h3>

        <div className="genre-badges">
          {safeGenres.map((genre) => (
            <GenreBadge key={genre.id} genre={genre} />
          ))}
        </div>

        <div className="blog-meta">
          <span>
            By{" "}
            <Link to={`/users/${safeAuthor.username}`} className="blog-author">
              {safeAuthor.username}
            </Link>{" "}
            on {formatDate(blog.createdAt)}
          </span>
        </div>

        <p className="blog-excerpt">{truncateContent(blog.content || "", 200)}</p>

        <div className="blog-actions">
          <Link to={`/blogs/${blog.id}`} className="btn btn-primary">
            Read More
          </Link>

          <div className="blog-votes">
            <div className="vote-btn upvote">
              <ThumbsUp size={16} />
              <span>{safeUpvoteCount}</span>
            </div>
            <div className="vote-btn downvote">
              <ThumbsDown size={16} />
              <span>{safeDownvoteCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

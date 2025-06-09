"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { blogService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import GenreBadge from "../components/GenreBadge"
import { ThumbsUp, ThumbsDown, Edit } from "lucide-react"

export default function ViewBlog() {
  const { id } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const [voting, setVoting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Get username from localStorage or session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUsername(user.username)
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }

    // Fetch blog
    const fetchBlog = async () => {
      try {
        const blogData = await blogService.getBlogById(id)
        setBlog(blogData)
      } catch (err) {
        console.error("Error fetching blog:", err)
        setError("Failed to load blog. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchBlog()
  }, [id])

  const handleVote = async (isUpvote) => {
    if (!username) {
      navigate("/login")
      return
    }

    setVoting(true)
    try {
      await blogService.voteBlog(id, isUpvote)
      // Refresh blog data to get updated vote counts
      const updatedBlog = await blogService.getBlogById(id)
      setBlog(updatedBlog)
    } catch (err) {
      console.error("Error voting:", err)
      setError("Failed to vote. Please try again.")
    } finally {
      setVoting(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={!!username} username={username} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={!!username} username={username} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!username} username={username} />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {blog.genres.map((genre) => (
                  <GenreBadge key={genre.id} genre={genre} />
                ))}
              </div>

              <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                <div>
                  By{" "}
                  <Link to={`/users/${blog.author.username}`} className="text-blue-500 hover:underline">
                    {blog.author.username}
                  </Link>{" "}
                  on {formatDate(blog.createdAt)}
                  {blog.updatedAt && <span> (Updated on {formatDate(blog.updatedAt)})</span>}
                </div>

                {username === blog.author.username && (
                  <Link to={`/blogs/${blog.id}/edit`} className="flex items-center text-gray-600 hover:text-blue-500">
                    <Edit size={16} className="mr-1" />
                    <span>Edit</span>
                  </Link>
                )}
              </div>

              <div className="prose max-w-none mb-8">
                {blog.content.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleVote(true)}
                    disabled={voting}
                    className="flex items-center px-3 py-1 bg-gray-100 hover:bg-green-100 rounded-md transition-colors"
                  >
                    <ThumbsUp size={18} className="mr-2 text-green-600" />
                    <span>{blog.upvoteCount}</span>
                  </button>

                  <button
                    onClick={() => handleVote(false)}
                    disabled={voting}
                    className="flex items-center px-3 py-1 bg-gray-100 hover:bg-red-100 rounded-md transition-colors"
                  >
                    <ThumbsDown size={18} className="mr-2 text-red-600" />
                    <span>{blog.downvoteCount}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}


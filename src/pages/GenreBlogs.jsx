"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { blogService, genreService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import BlogCard from "../components/BlogCard"
import GenreBadge from "../components/GenreBadge"

export default function GenreBlogs() {
  const { genreName } = useParams()
  const [blogs, setBlogs] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")

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

    // Fetch blogs by genre and all genres
    const fetchData = async () => {
      try {
        const [blogsData, genresData] = await Promise.all([
          blogService.getBlogsByGenre(genreName),
          genreService.getAllGenres(),
        ])
        setBlogs(blogsData)
        setGenres(genresData)
      } catch (err) {
        console.error(`Error fetching blogs for genre ${genreName}:`, err)
        setError("Failed to load blogs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [genreName])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={!!username} username={username} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{genreName} Blogs</h1>
          <Link
            to="/explore"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Back to Explore
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content - Blogs */}
          <div className="md:col-span-2">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {blogs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">No blogs available in this genre yet.</p>
                {username && (
                  <Link
                    to="/blogs/create"
                    className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Create the First Blog in this Genre
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {blogs.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Other Genres */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Other Genres</h3>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {genres
                    .filter((genre) => genre.name.toLowerCase() !== genreName.toLowerCase())
                    .map((genre) => (
                      <GenreBadge key={genre.id} genre={genre} />
                    ))}
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


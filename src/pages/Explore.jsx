"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { blogService, genreService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import BlogCard from "../components/BlogCard"
import GenreBadge from "../components/GenreBadge"

export default function Explore() {
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

    // Fetch blogs and genres
    const fetchData = async () => {
      try {
        const [blogsData, genresData] = await Promise.all([blogService.getAllBlogs(), genreService.getAllGenres()])
        setBlogs(blogsData)
        setGenres(genresData)
      } catch (err) {
        console.error("Error fetching explore data:", err)
        setError("Failed to load blogs. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Explore</h1>

        {/* Genres Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Browse by Genre</h2>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre) => (
              <GenreBadge key={genre.id} genre={genre} large />
            ))}
          </div>
        </div>

        {/* All Blogs Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">All Blogs</h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {blogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No blogs available yet.</p>
              {username && (
                <Link
                  to="/blogs/create"
                  className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Create the First Blog
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} grid />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}


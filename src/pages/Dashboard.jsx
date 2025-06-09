"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { blogService, genreService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import BlogCard from "../components/BlogCard"
import GenreBadge from "../components/GenreBadge"

export default function Dashboard() {
  const [popularBlogs, setPopularBlogs] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [username, setUsername] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      navigate("/login")
      return
    }

    try {
      const user = JSON.parse(storedUser)
      setUsername(user.username)
    } catch (e) {
      console.error("Error parsing user data:", e)
      navigate("/login")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [genresResponse, blogsResponse] = await Promise.all([
          genreService.getAllGenres(),
          blogService.getPopularBlogs(),
        ])

        const blogsData = Array.isArray(blogsResponse) ? blogsResponse : []
        const genresData = Array.isArray(genresResponse) ? genresResponse : []

        setPopularBlogs(blogsData)
        setGenres(genresData)
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-height-screen">
        <Navbar isLoggedIn={true} username={username} />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-height-screen">
      <Navbar isLoggedIn={true} username={username} />

      <div className="main-content">
        <div className="container section dashboard-container">
          <div className="dashboard-grid">
            <div className="dashboard-main">
              <h2 className="section-title">Popular Blogs</h2>

              {error && (
                <div className="card error-card">
                  <div className="card-body">
                    <p className="error-text">{error}</p>
                  </div>
                </div>
              )}

              {popularBlogs.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center">
                    <p className="text-muted mb-3">No blogs available yet. Be the first to create one!</p>
                    <Link to="/blogs/create" className="btn btn-primary">
                      Create Blog
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="blogs-list">
                  {popularBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} />
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-sidebar">
              <div className="card mb-4">
                <div className="card-body text-center">
                  <h3 className="card-title">Welcome to Safarnama</h3>
                  <p className="text-muted mb-3">Share your travel stories and experiences with the world.</p>
                  <Link to="/blogs/create" className="btn btn-primary w-full">
                    Create New Blog
                  </Link>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Explore Genres</h3>
                </div>
                <div className="card-body">
                  <div className="genre-badges">
                    {genres.length > 0 ? (
                      genres.map((genre) => <GenreBadge key={genre.id} genre={genre} />)
                    ) : (
                      <p className="text-muted">No genres available</p>
                    )}
                  </div>
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

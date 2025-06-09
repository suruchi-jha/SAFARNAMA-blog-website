"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { userService, blogService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import BlogCard from "../components/BlogCard"

export default function Profile() {
  const { username: profileUsername } = useParams()
  const [user, setUser] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentUsername, setCurrentUsername] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setCurrentUsername(userData.username)
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }

    const fetchData = async () => {
      try {
        const userData = await userService.getUserByUsername(profileUsername)
        setUser(userData)

        const blogsData = await blogService.getBlogsByAuthor(profileUsername)
        setBlogs(blogsData)
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [profileUsername])

  if (loading) {
    return (
      <div className="min-height-screen">
        <Navbar isLoggedIn={!!currentUsername} username={currentUsername} />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-height-screen">
        <Navbar isLoggedIn={!!currentUsername} username={currentUsername} />
        <div className="main-content">
          <div className="container section">
            <div className="error-container">
              <h2 className="error-title">Error</h2>
              <p className="error-message">{error || "User not found"}</p>
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-height-screen">
      <Navbar isLoggedIn={!!currentUsername} username={currentUsername} />

      <div className="main-content">
        <div className="container section profile-container">
          <div className="profile-grid">
            <div className="profile-sidebar">
              <div className="card profile-card">
                <img
                  src={user.profilePhoto || "/images/default-profile.png"}
                  alt={`${user.username}'s profile`}
                  className="profile-image"
                />
                <h2 className="profile-name">{user.username}</h2>
                <p className="profile-email">{user.email}</p>

                {currentUsername === profileUsername && (
                  <Link to="/profile/edit" className="btn btn-primary w-full">
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            <div className="profile-main">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{user.username}'s Blogs</h3>
                </div>

                <div className="card-body">
                  {blogs.length === 0 ? (
                    <div className="text-center">
                      <p className="text-muted mb-4">No blogs available yet.</p>
                      {currentUsername === profileUsername && (
                        <Link to="/blogs/create" className="btn btn-primary">
                          Create Your First Blog
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="blogs-list">
                      {blogs.map((blog) => (
                        <BlogCard key={blog.id} blog={blog} compact />
                      ))}
                    </div>
                  )}
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

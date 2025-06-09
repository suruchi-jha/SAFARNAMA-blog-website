"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search } from "lucide-react"

export default function Navbar({ isLoggedIn, username }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoggedIn && username) {
      setCurrentUser({ username })
    } else {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setCurrentUser(user)
        } catch (e) {
          console.error("Error parsing user data:", e)
        }
      }
    }
  }, [isLoggedIn, username])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`)
      setIsMenuOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      localStorage.removeItem("user")
      setCurrentUser(null)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Safarnama
        </Link>

        <ul className="navbar-nav">
          <li>
            <Link to="/" className="navbar-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/explore" className="navbar-link">
              Explore
            </Link>
          </li>
          {currentUser && (
            <li>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          <form onSubmit={handleSearch} className="navbar-search">
            <input
              type="search"
              placeholder="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="search-icon" size={16} />
          </form>

          {currentUser ? (
            <div className="d-flex align-center" style={{ gap: "1rem" }}>
              <span className="navbar-user">Hi, {currentUser.username}</span>
              <Link to="/blogs/create" className="btn btn-primary">
                Create Blog
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <div className="d-flex align-center" style={{ gap: "0.5rem" }}>
              <Link to="/login" className="btn btn-secondary">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

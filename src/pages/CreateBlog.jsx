"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { blogService, genreService, authService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function CreateBlog() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    genreIds: [],
  })
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(false)
  const [genresLoading, setGenresLoading] = useState(true)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Get username from localStorage
    const storedUser = localStorage.getItem("user")
    console.log("Stored user data:", storedUser)

    if (!storedUser) {
      console.log("No user found in localStorage, redirecting to login")
      navigate("/login")
      return
    }

    try {
      const user = JSON.parse(storedUser)
      console.log("Parsed user data:", user)

      if (!user || !user.username) {
        console.log("Invalid user data, redirecting to login")
        localStorage.removeItem("user")
        navigate("/login")
        return
      }

      setUsername(user.username)
      console.log("User found in localStorage:", user.username)
    } catch (e) {
      console.error("Error parsing user data:", e)
      localStorage.removeItem("user")
      navigate("/login")
      return
    }

    // Check if the user is still authenticated with the server
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...")
        const isAuthenticated = await authService.checkAuth()
        console.log("Authentication check result:", isAuthenticated)

        if (!isAuthenticated) {
          console.error("User is not authenticated, redirecting to login")
          localStorage.removeItem("user")
          navigate("/login?session=expired")
          return
        }
      } catch (err) {
        console.error("Auth check error:", err)
        localStorage.removeItem("user")
        navigate("/login")
        return
      }
    }

    checkAuth()

    // Fetch genres
    const fetchGenres = async () => {
      try {
        setGenresLoading(true)
        const genresData = await genreService.getAllGenres()
        console.log("Fetched genres for create blog:", genresData)

        if (Array.isArray(genresData) && genresData.length > 0) {
          setGenres(genresData)
        } else {
          console.warn("No genres available or empty genres array returned")
          setError("Failed to load genres. Please try again or contact the administrator.")
        }
      } catch (err) {
        console.error("Error fetching genres:", err)
        setError("Failed to load genres. Please try again later.")
      } finally {
        setGenresLoading(false)
      }
    }

    fetchGenres()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleGenreChange = (e) => {
    const { value, checked } = e.target
    const genreId = Number.parseInt(value, 10)

    setFormData((prev) => {
      if (checked) {
        return { ...prev, genreIds: [...prev.genreIds, genreId] }
      } else {
        return { ...prev, genreIds: prev.genreIds.filter((id) => id !== genreId) }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error("Title is required")
      }

      if (!formData.content.trim()) {
        throw new Error("Content is required")
      }

      // Check authentication before submitting
      const isAuthenticated = await authService.checkAuth()
      if (!isAuthenticated) {
        throw new Error("Your session has expired. Please log in again.")
      }

      console.log("Submitting blog:", formData)
      const response = await blogService.createBlog(formData)
      console.log("Blog created successfully:", response)
      navigate("/dashboard")
    } catch (err) {
      console.error("Error creating blog:", err)

      // Check if it's an authentication error
      if (err.response && err.response.status === 401) {
        alert("Your session has expired. Please log in again.")
        localStorage.removeItem("user")
        navigate("/login")
      } else if (err.response && err.response.status === 403) {
        setError("Forbidden: You don't have permission to create a blog.")
      } else if (err.message && err.message.includes("session")) {
        alert("Your session has expired. Please log in again.")
        localStorage.removeItem("user")
        navigate("/login")
      } else {
        setError(err.message || err.response?.data?.error || "Failed to create blog. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (!username) {
    return null // Don't render anything if not authenticated (will redirect)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={true} username={username} />

      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Create New Blog</h2>
            </div>

            <div className="p-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genres</label>
                  <div className="border border-gray-300 rounded-md p-4">
                    {genresLoading ? (
                      <p className="text-gray-500">Loading genres...</p>
                    ) : genres.length === 0 ? (
                      <p className="text-gray-500">No genres available. Please contact the administrator.</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {genres.map((genre) => (
                          <div key={genre.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`genre-${genre.id}`}
                              name="genreIds"
                              value={genre.id}
                              onChange={handleGenreChange}
                              checked={formData.genreIds.includes(genre.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`genre-${genre.id}`} className="ml-2 text-sm text-gray-700">
                              {genre.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {loading ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

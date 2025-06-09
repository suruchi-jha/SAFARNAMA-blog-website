"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { blogService, genreService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function EditBlog() {
  const { id } = useParams()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    genreIds: [],
  })
  const [blog, setBlog] = useState(null)
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
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

    // Fetch blog and genres
    const fetchData = async () => {
      try {
        const [blogData, genresData] = await Promise.all([blogService.getBlogById(id), genreService.getAllGenres()])

        setBlog(blogData)
        setGenres(genresData)

        // Set form data
        setFormData({
          title: blogData.title,
          content: blogData.content,
          genreIds: blogData.genres.map((genre) => genre.id),
        })
      } catch (err) {
        console.error("Error fetching blog data:", err)
        setError("Failed to load blog data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

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
    setSubmitting(true)

    try {
      await blogService.updateBlog(id, formData)
      navigate(`/blogs/${id}`)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update blog. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={true} username={username} />
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

  // Check if user is the author
  if (blog && blog.author.username !== username) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={true} username={username} />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to edit this blog.</p>
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
      <Navbar isLoggedIn={true} username={username} />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Edit Blog</h2>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {genres.map((genre) => (
                        <div key={genre.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`genre-${genre.id}`}
                            name="genreIds"
                            value={genre.id}
                            checked={formData.genreIds.includes(genre.id)}
                            onChange={handleGenreChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`genre-${genre.id}`} className="ml-2 text-sm text-gray-700">
                            {genre.name}
                          </label>
                        </div>
                      ))}
                    </div>
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
                    disabled={submitting}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {submitting ? "Updating..." : "Update"}
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


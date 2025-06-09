import axios from "axios"

const API_BASE = process.env.REACT_APP_API_BASE_URL || "/api";
// Create an axios instance with the base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/api", // This will work for both development and production
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies/session
})

// Add a request interceptor to include authentication token if available
api.interceptors.request.use(
  (config) => {
    // Log all API requests for debugging
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || {})
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    console.error(`API Error: ${error.config?.url || "unknown"}`, error.response?.data || error.message)

    if (error.response && error.response.status === 401 && !error.config.url.includes("/auth/login")) {
      // Redirect to login page for unauthorized errors
      console.log("Authentication error, redirecting to login")
      localStorage.removeItem("user")
      window.location.href = "/login?session_expired=true"
    }
    return Promise.reject(error)
  },
)

// Authentication services
export const authService = {
  login: async (username, password) => {
    try {
      console.log("Attempting login for:", username)

      // Use fetch instead of axios for login
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Login failed")
      }

      const userData = await response.json()
      console.log("Login response:", userData)

      // Store user info in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userData.id,
          username: userData.username,
          email: userData.email,
        }),
      )
      return userData
    } catch (error) {
      console.error("Login error:", error.message)
      throw error
    }
  },

  register: async (userData) => {
    try {
      console.log("Registering user:", userData.username)

      // Use fetch instead of axios for registration
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Registration failed")
      }

      const data = await response.json()
      console.log("Registration response:", data)
      return data
    } catch (error) {
      console.error("Registration error:", error.message)
      throw error
    }
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout")
      // Remove user info from localStorage
      localStorage.removeItem("user")
      return response.data
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message)
      throw error
    }
  },

  // Check if the user is still authenticated
  checkAuth: async () => {
    try {
      console.log("Checking authentication status")
      const response = await api.get("/auth/check")
      console.log("Auth check response:", response.data)
      return response.data.authenticated
    } catch (error) {
      console.error("Auth check error:", error.response?.data || error.message)
      return false
    }
  },
}

// Genre services
export const genreService = {
  getAllGenres: async () => {
    try {
      console.log("Fetching all genres")
      const response = await api.get("/genres")
      console.log("Genres API response:", response.data)

      // Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data && Array.isArray(response.data.content)) {
        return response.data.content
      } else {
        console.warn("Unexpected genres response format:", response.data)
        return []
      }
    } catch (error) {
      console.error("Error fetching genres:", error)
      // Return empty array on error
      return []
    }
  },
}

// Blog services
export const blogService = {
  getAllBlogs: async () => {
    try {
      const response = await api.get("/blogs")
      return response.data
    } catch (error) {
      console.error("Error fetching blogs:", error)
      throw error
    }
  },

  getPopularBlogs: async () => {
    try {
      const response = await api.get("/blogs/popular")
      return response.data
    } catch (error) {
      console.error("Error fetching popular blogs:", error)
      throw error
    }
  },

  getBlogById: async (id) => {
    try {
      const response = await api.get(`/blogs/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching blog ${id}:`, error)
      throw error
    }
  },

  getBlogsByAuthor: async (username) => {
    try {
      const response = await api.get(`/blogs/author/${username}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching blogs by author ${username}:`, error)
      throw error
    }
  },

  getBlogsByGenre: async (genreName) => {
    try {
      const response = await api.get(`/blogs/genre/${genreName}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching blogs for genre ${genreName}:`, error)
      throw error
    }
  },

  createBlog: async (blogData) => {
    try {
      console.log("Creating blog with data:", blogData)

      // Ensure we have genreIds even if empty
      if (!blogData.genreIds || !Array.isArray(blogData.genreIds)) {
        blogData.genreIds = []
      }

      const response = await api.post("/blogs", blogData)
      console.log("Create blog response:", response.data)
      return response.data
    } catch (error) {
      console.error("Error creating blog:", error.response?.data || error.message)
      throw error
    }
  },

  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/blogs/${id}`, blogData)
      return response.data
    } catch (error) {
      console.error(`Error updating blog ${id}:`, error)
      throw error
    }
  },

  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blogs/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error deleting blog ${id}:`, error)
      throw error
    }
  },

  voteBlog: async (id, isUpvote) => {
    try {
      const response = await api.post(`/blogs/${id}/vote`, { upvote: isUpvote })
      return response.data
    } catch (error) {
      console.error(`Error voting for blog ${id}:`, error)
      throw error
    }
  },
}

// User services
export const userService = {
  getUserByUsername: async (username) => {
    try {
      const response = await api.get(`/users/${username}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching user ${username}:`, error)
      throw error
    }
  },

  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users/search?query=${query}`)
      return response.data
    } catch (error) {
      console.error("Error searching users:", error)
      throw error
    }
  },
}

export default api

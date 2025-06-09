"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { authService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    if (searchParams.get("success") === "true") {
      setSuccessMessage("Registration successful! Please login with your credentials.")
    }
  }, [location])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setLoading(true)

    try {
      if (!formData.username || !formData.password) {
        throw new Error("Username and password are required")
      }

      await authService.login(formData.username, formData.password)
      navigate("/dashboard")
    } catch (err) {
      console.error("Login Error:", err)
      setError(err.response?.data?.error || err.message || "Invalid username or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-height-screen">
      <Navbar />

      <div className="main-content">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h2 className="auth-title">Login</h2>
            </div>

            <div className="auth-body">
              {successMessage && (
                <div className="alert alert-success">
                  <p>{successMessage}</p>
                </div>
              )}

              {error && (
                <div className="alert alert-error">
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <div className="auth-footer">
                <p className="auth-link-text">
                  Don't have an account?{" "}
                  <Link to="/signup" className="auth-link">
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

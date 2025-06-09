"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!formData.username.trim()) {
        throw new Error("Username is required")
      }
      if (!formData.email.trim()) {
        throw new Error("Email is required")
      }
      if (!formData.password.trim()) {
        throw new Error("Password is required")
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long")
      }

      await authService.register(formData)
      navigate("/login?success=true")
    } catch (err) {
      console.error("Registration Error:", err)
      setError(err.response?.data?.error || err.message || "Registration failed. Please try again.")
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
              <h2 className="auth-title">Sign Up</h2>
            </div>

            <div className="auth-body">
              {error && <div className="alert alert-error">{error}</div>}

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
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
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
                  {loading ? "Signing up..." : "Sign Up"}
                </button>
              </form>

              <div className="auth-footer">
                <p className="auth-link-text">
                  Already have an account?{" "}
                  <Link to="/login" className="auth-link">
                    Login
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

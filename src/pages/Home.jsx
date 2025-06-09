"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowDown } from "lucide-react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

// Sample genres for the explore section
const genres = [
  "Travel",
  "Food",
  "Technology",
  "Lifestyle",
  "Health",
  "Fitness",
  "Fashion",
  "Beauty",
  "Business",
  "Finance",
  "Education",
  "Entertainment",
  "Sports",
  "Politics",
  "Science",
]

export default function Home() {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])
  const y = useTransform(scrollY, [0, 300], [0, 100])

  const [currentUser, setCurrentUser] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
      } catch (e) {
        console.error("Error parsing user data:", e)
      }
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const exploreSection = document.getElementById("explore-section")

      if (exploreSection) {
        const exploreSectionTop = exploreSection.offsetTop
        const windowHeight = window.innerHeight

        if (scrollPosition > exploreSectionTop - windowHeight / 1.5) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-height-screen">
      <Navbar isLoggedIn={!!currentUser} username={currentUser?.username} />

      <div className="main-content">
        {/* Hero Section with Parallax */}
        <section className="hero-parallax-section">
          <motion.div
            className="hero-background"
            style={{
              backgroundImage: `url("/scenary.png")`,
              y,
              scale,
            }}
          >
            <div className="hero-overlay" />
          </motion.div>

          <motion.div className="hero-content-parallax" style={{ opacity }}>
            <motion.h1
              className="hero-title-large"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Safarnama
            </motion.h1>

            <motion.p
              className="hero-subtitle-large"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Share your journey, discover new stories
            </motion.p>

            <motion.div
              className="hero-scroll-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <ArrowDown size={32} />
            </motion.div>
          </motion.div>
        </section>

        {/* About Section */}
        <section className="section">
          <div className="container">
            <div className="about-content">
              <h2 className="section-title text-center">About Safarnama</h2>
              <p className="about-text">
                Safarnama is a platform for storytellers, travelers, and creators to share their experiences with the
                world. Whether you're documenting your travels, sharing your expertise, or simply expressing your
                thoughts, Safarnama provides a beautiful space for your stories to come alive.
              </p>
              <p className="about-text">
                Join our growing community of writers and readers to connect, inspire, and be inspired.
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section">
          <div className="container">
            <h2 className="section-title text-center">Why Choose Safarnama?</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <h3>Global Community</h3>
                <p>Connect with travelers from every corner of the world and share your unique experiences.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3>Rich Storytelling</h3>
                <p>Create detailed travel blogs with photos, tips, and memories that inspire others.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗺️</div>
                <h3>Discover Destinations</h3>
                <p>Find hidden gems and popular destinations through authentic traveler experiences.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Section with Animation */}
        <section id="explore-section" className="explore-section">
          <div className="container">
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, y: 50 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="section-title">Explore</h2>
              <p className="section-subtitle">Discover stories from various genres</p>
            </motion.div>

            <motion.div
              className="explore-genres-grid"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {genres.map((genre, index) => (
                <motion.div
                  key={index}
                  className="explore-genre-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link to={`/blogs/genre/${genre.toLowerCase()}`} className="genre-badge large">
                    {genre}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section-improved">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Share Your Adventure?</h2>
              <p>Join thousands of travelers sharing their stories on Safarnama</p>
              {!currentUser && (
                <div className="cta-actions">
                  <Link to="/signup" className="btn btn-cta-primary">
                    Join Safarnama Today
                  </Link>
                  <Link to="/explore" className="btn btn-cta-secondary">
                    Explore Stories
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const colors = [
  "from-purple-500/80 to-pink-500/80",
  "from-blue-500/80 to-cyan-500/80",
  "from-green-500/80 to-emerald-500/80",
  "from-orange-500/80 to-red-500/80",
  "from-indigo-500/80 to-purple-500/80",
  "from-teal-500/80 to-green-500/80",
  "from-rose-500/80 to-pink-500/80",
  "from-amber-500/80 to-orange-500/80",
]

export function FloatingBalls({ genres }) {
  const containerRef = useRef(null)
  const ballsRef = useRef([])
  const animationFrameRef = useRef(null)
  const [, forceUpdate] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Initialize balls with spacing to prevent initial overlap
    const minDistance = 150 // Minimum distance between ball centers

    ballsRef.current = genres.map((genre, index) => {
      const size = 60 + Math.random() * 80
      let x, y
      let attempts = 0
      const maxAttempts = 50

      // Try to find a position that doesn't overlap with existing balls
      do {
        x = size + Math.random() * (containerWidth - size * 2)
        y = size + Math.random() * (containerHeight - size * 2)
        attempts++

        // Check if this position overlaps with any existing ball
        const overlaps = ballsRef.current.some((existingBall) => {
          const dx = existingBall.x - x
          const dy = existingBall.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)
          return distance < minDistance
        })

        if (!overlaps || attempts >= maxAttempts) break
      } while (true)

      const speed = 0.3 + Math.random() * 0.4
      const angle = Math.random() * Math.PI * 2

      return {
        id: genre,
        name: genre,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
        color: colors[index % colors.length],
      }
    })

    // Animation loop
    const animate = () => {
      const balls = ballsRef.current
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      balls.forEach((ball, i) => {
        ball.x += ball.vx
        ball.y += ball.vy

        const radius = ball.size / 2

        // Bounce off walls
        if (ball.x - radius <= 0 || ball.x + radius >= containerWidth) {
          ball.vx = -ball.vx
          ball.x = ball.x - radius <= 0 ? radius : containerWidth - radius
        }

        if (ball.y - radius <= 0 || ball.y + radius >= containerHeight) {
          ball.vy = -ball.vy
          ball.y = ball.y - radius <= 0 ? radius : containerHeight - radius
        }

        // Check collision with other balls
        for (let j = i + 1; j < balls.length; j++) {
          const other = balls[j]
          const dx = other.x - ball.x
          const dy = other.y - ball.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDist = (ball.size + other.size) / 2

          if (distance < minDist) {
            // Collision detected - swap velocities and separate balls
            const angle = Math.atan2(dy, dx)
            const targetX = ball.x + Math.cos(angle) * minDist
            const targetY = ball.y + Math.sin(angle) * minDist

            // Separate the balls
            const ax = (targetX - other.x) * 0.5
            const ay = (targetY - other.y) * 0.5

            ball.x -= ax
            ball.y -= ay
            other.x += ax
            other.y += ay

            // Swap velocities
            const tempVx = ball.vx
            const tempVy = ball.vy
            ball.vx = other.vx
            ball.vy = other.vy
            other.vx = tempVx
            other.vy = tempVy
          }
        }
      })

      forceUpdate({})
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [genres])

  const handleClick = (genreName) => {
    navigate(`/blogs/genre/${genreName.toLowerCase()}`)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[600px] rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #8b4513 0%, #a0522d 100%)",
      }}
    >
      {ballsRef.current.map((ball, index) => (
        <motion.button
          key={ball.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          onClick={() => handleClick(ball.name)}
          className={`absolute flex items-center justify-center rounded-full bg-gradient-to-br ${ball.color} backdrop-blur-sm shadow-lg hover:scale-110 transition-transform cursor-pointer border border-white/20`}
          style={{
            width: ball.size,
            height: ball.size,
            left: ball.x - ball.size / 2,
            top: ball.y - ball.size / 2,
            boxShadow:
              "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 -10px 20px rgba(0, 0, 0, 0.2), inset 0 10px 20px rgba(255, 255, 255, 0.1)",
          }}
        >
          <span className="text-white px-3 text-center drop-shadow-lg">{ball.name}</span>
        </motion.button>
      ))}
    </div>
  )
}

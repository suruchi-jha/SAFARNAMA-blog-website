"use client"

import { motion } from "framer-motion"
import { Link } from "react-router-dom"

export default function GenreButton({ genre, delay, isVisible }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link
        to={`/blogs/genre/${genre.toLowerCase()}`}
        className="block w-full text-center py-3 px-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300"
      >
        {genre}
      </Link>
    </motion.div>
  )
}


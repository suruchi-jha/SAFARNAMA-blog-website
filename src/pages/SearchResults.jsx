"use client"

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { userService } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("query") || ""
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")

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

    // Search users
    const searchUsers = async () => {
      if (!query) {
        setUsers([])
        setLoading(false)
        return
      }

      try {
        const usersData = await userService.searchUsers(query)
        setUsers(usersData)
      } catch (err) {
        console.error("Error searching users:", err)
        setError("Failed to search users. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    searchUsers()
  }, [query])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar isLoggedIn={!!username} username={username} />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Search Results for "{query}"</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Users</h2>
              </div>

              <div className="p-6">
                {users.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No users found matching your search.</p>
                ) : (
                  <div className="divide-y">
                    {users.map((user) => (
                      <Link
                        key={user.id}
                        to={`/users/${user.username}`}
                        className="flex items-center py-4 px-2 hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={user.profilePhoto || "/images/default-profile.png"}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{user.username}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}


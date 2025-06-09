import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Dashboard from "./pages/Dashboard"
import CreateBlog from "./pages/CreateBlog"
import EditBlog from "./pages/EditBlog"
import ViewBlog from "./pages/ViewBlog"
import Profile from "./pages/Profile"
import Explore from "./pages/Explore"
import GenreBlogs from "./pages/GenreBlogs"
import SearchResults from "./pages/SearchResults"
import "./index.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/blogs/create" element={<CreateBlog />} />
        <Route path="/blogs/:id" element={<ViewBlog />} />
        <Route path="/blogs/:id/edit" element={<EditBlog />} />
        <Route path="/users/:username" element={<Profile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/blogs/genre/:genreName" element={<GenreBlogs />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </Router>
  )
}

export default App


import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { Toaster } from "react-hot-toast"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ResourceDetails from "./pages/ResourceDetails"
import UploadResource from "./pages/UploadResource"
import Profile from "./pages/Profile"
import Bookmarks from "./pages/Bookmarks"
import StudyGroups from "./pages/StudyGroups"
import Leaderboard from "./pages/Leaderboard"
import ResetPassword from "./pages/ResetPassword"
import GitHubCallback from "./components/auth/GitHubCallback"
import PrivateRoute from "./components/auth/PrivateRoute"
import "./App.css"

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8 relative">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/auth/github/callback" element={<GitHubCallback />} />
                <Route path="/resources/:id" element={<ResourceDetails />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <PrivateRoute>
                      <UploadResource />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/bookmarks"
                  element={
                    <PrivateRoute>
                      <Bookmarks />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/study-groups"
                  element={
                    <PrivateRoute>
                      <StudyGroups />
                    </PrivateRoute>
                  }
                />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App


import { Plane, MapPin, Users, User, LogOut, LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface NavbarProps {
  user?: { name: string }
  isAuthenticated?: boolean
  logout?: () => void
  onMapClick?: () => void
  onCommunityClick?: () => void
  onProfileClick?: () => void
  onAuthClick?: () => void
}

const Navbar = ({
  user,
  isAuthenticated,
  logout,
  onMapClick,
  onCommunityClick,
  onProfileClick,
  onAuthClick
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const handleMapClick = () => { setIsMenuOpen(false); onMapClick?.(); }
  const handleCommunityClick = () => { setIsMenuOpen(false); onCommunityClick?.(); }
  const handleProfileClick = () => {
    setIsMenuOpen(false)
    if (!isAuthenticated && onAuthClick) { onAuthClick(); return; }
    onProfileClick?.();
  }
  const handleAuthClick = () => { setIsMenuOpen(false); onAuthClick?.(); }
  const handleLogout = () => { setIsMenuOpen(false); logout?.(); }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Aviation Bay</h1>
              <p className="text-xs text-gray-500">Jet Spotting & Identification</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={handleMapClick} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
              <MapPin className="w-4 h-4" /><span>Jet Map</span>
            </button>
            <button onClick={handleCommunityClick} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
              <Users className="w-4 h-4" /><span>Community</span>
            </button>
            <button onClick={handleProfileClick} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-100" title={isAuthenticated ? "View your profile" : "Sign in to access profile"}>
              <User className="w-4 h-4" /><span>{isAuthenticated ? "My Profile" : "Profile"}</span>
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-50" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={handleAuthClick} className="flex items-center space-x-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors px-4 py-2 rounded-lg font-medium" title="Optional: Sign in to track your jet spottings">
                <LogIn className="w-4 h-4" /><span>Sign In (Optional)</span>
              </button>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
            <div className="flex flex-col space-y-2">
              <button onClick={handleMapClick} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors text-left w-full">
                <MapPin className="w-4 h-4" /><span>Jet Map</span>
              </button>
              <button onClick={handleCommunityClick} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors text-left w-full">
                <Users className="w-4 h-4" /><span>Community</span>
              </button>
              <button onClick={handleProfileClick} className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-md transition-colors text-left w-full">
                <User className="w-4 h-4" /><span>{isAuthenticated ? "My Profile" : "Profile (Sign in required)"}</span>
              </button>
              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">{user?.name}</span>
                      <p className="text-xs text-gray-500">Signed in</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-md transition-colors text-left w-full">
                    <LogOut className="w-4 h-4" /><span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <button onClick={handleAuthClick} className="flex items-center space-x-2 bg-blue-500 text-white hover:bg-blue-600 px-3 py-2 rounded-md transition-colors text-left w-full font-medium">
                    <LogIn className="w-4 h-4" /><span>Sign In (Optional)</span>
                  </button>
                  <div className="px-3 py-2 text-xs text-gray-500">
                    ✈️ Sign in to save jet sightings and join the aviation community
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

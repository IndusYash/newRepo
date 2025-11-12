import { useEffect, useState } from 'react'
import { Camera, MapPin, Zap, Plane } from 'lucide-react'

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0)
  const [currentText, setCurrentText] = useState(0)

  const loadingTexts = [
    "Jet Spotters Welcome!",
    "Identifying Planes, Mapping Discoveries..."
  ]

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1
      })
    }, 30)
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length)
    }, 750)
    return () => {
      clearInterval(progressInterval)
      clearInterval(textInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center z-[9999]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center px-8 max-w-2xl">

        {/* Aviation Bay Logo/Emblem Placeholder */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Plane className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          {/* Aviation Branding */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 animate-fade-in tracking-tight">
            Aviation Bay
          </h1>
          <p className="text-blue-200 text-lg md:text-xl font-medium animate-fade-in delay-300">
            Jet Spotter & Identification Platform
          </p>
          <p className="text-blue-300 text-sm mt-2 animate-fade-in delay-500">
            Discover • Identify • Map Every Flight
          </p>
        </div>

        {/* App Features Preview */}
        <div className="flex justify-center gap-6 mb-8 animate-fade-in delay-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2 mx-auto backdrop-blur-sm">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-blue-200">Jet Photo AI</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2 mx-auto backdrop-blur-sm">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-blue-200">Location Logging</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2 mx-auto backdrop-blur-sm">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <p className="text-xs text-blue-200">Instant Jet ID</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 animate-fade-in delay-1000">
          <div className="w-full bg-white/20 rounded-full h-3 mb-4 backdrop-blur-sm">
            <div
              className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm text-blue-200">
            <span>Launching...</span>
            <span className="font-mono">{progress}%</span>
          </div>
        </div>

        {/* Dynamic Loading Text */}
        <div className="h-6 animate-fade-in delay-1200">
          <p className="text-white font-medium transition-all duration-500">
            {loadingTexts[currentText]}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/20 animate-fade-in delay-1500">
          <p className="text-blue-300 text-xs">
            ✈️ For Aviation Enthusiasts Everywhere
          </p>
          <p className="text-blue-400 text-xs mt-1">
            Version 1.0 • Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen

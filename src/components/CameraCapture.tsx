import { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, Upload, RotateCcw, CheckCircle, X } from 'lucide-react'
import { CameraCaptureProps } from '../types'

const CameraCapture = ({ onImageCapture }: CameraCaptureProps) => {
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: facingMode
  }

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedPhoto(imageSrc)
      onImageCapture(imageSrc)
      setShowCamera(false)
    }
  }, [onImageCapture])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        setCapturedPhoto(result)
        onImageCapture(result)
      }
    }
    reader.readAsDataURL(file)
  }, [onImageCapture])

  const toggleCamera = () => {
    setShowCamera(!showCamera)
    setCapturedPhoto(null)
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setShowCamera(true)
  }

  if (capturedPhoto) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="relative rounded-lg overflow-hidden shadow-md">
          <img 
            src={capturedPhoto} 
            alt="Captured jet" 
            className="w-full max-w-md mx-auto rounded-lg shadow-lg border border-gray-200"
          />
          <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={retakePhoto}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Camera className="w-5 h-5" />
            Retake Photo
          </button>
        </div>
      </div>
    )
  }

  if (showCamera) {
    return (
      <div className="space-y-4 animate-slide-up">
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full max-w-lg mx-auto aspect-video"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 px-4">
            <button
              onClick={switchCamera}
              className="bg-black bg-opacity-60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-80 transition-all duration-200 shadow-lg"
              title="Switch Camera"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={capturePhoto}
              className="bg-blue-500 text-white p-4 rounded-full hover:bg-blue-600 transition-all duration-200 shadow-xl transform hover:scale-110"
              title="Capture Photo"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button
              onClick={toggleCamera}
              className="bg-black bg-opacity-60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-opacity-80 transition-all duration-200 shadow-lg"
              title="Close Camera"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 group">
        <div className="transform group-hover:scale-110 transition-transform duration-300">
          <Camera className="w-16 h-16 mx-auto text-gray-400 group-hover:text-blue-500 mb-4 transition-colors duration-300" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2 group-hover:text-blue-600 transition-colors duration-300">
          Capture or Upload Jet Photo
        </h3>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Take a photo of a jet to identify its model and log its location. Perfect for aviation enthusiasts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={toggleCamera}
            className="flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[160px]"
          >
            <Camera className="w-5 h-5" />
            Open Camera
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-12 h-px bg-gray-300"></div>
            <span className="text-sm font-medium">or</span>
            <div className="w-12 h-px bg-gray-300"></div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="image-input"
          />
          <label
            htmlFor="image-input"
            className="flex items-center gap-3 px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 cursor-pointer font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[160px]"
          >
            <Upload className="w-5 h-5" />
            Upload Jet Photo
          </label>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>JPEG, PNG, WebP supported • Max 5MB</span>
        </div>
      </div>
    </div>
  )
}

export default CameraCapture

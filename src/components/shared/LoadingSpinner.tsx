import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex flex-col items-center mb-4">
          <span className="text-3xl mb-1">✈️</span>
          <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto text-blue-500`} />
        </div>
        <p className="text-blue-600 font-semibold">
          {message || 'Loading...'} <span className="ml-1">Aviation Bay</span>
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner

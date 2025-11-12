import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, Waves, AlertTriangle } from 'lucide-react'

// Local prop type (project's ../types does not export VoiceInputProps)
interface VoiceInputProps {
  onTranscript: (text: string) => void
}

// Declare global SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

const VoiceInput = ({ onTranscript }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const isStartingRef = useRef(false)

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      
      const recognition = new SpeechRecognition()
      
      // Configure recognition settings
      recognition.continuous = true // Changed back to true for better control
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        console.log('🎤 Speech recognition started')
        setIsListening(true)
        setError(null)
        setInterimTranscript('')
        isStartingRef.current = false
      }

      recognition.onresult = (event: any) => {
        let interimText = ''
        let finalText = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript
          
          if (event.results[i].isFinal) {
            finalText += transcriptSegment
          } else {
            interimText += transcriptSegment
          }
        }
        
        setInterimTranscript(interimText)
        
        if (finalText) {
          console.log('✅ Final transcript:', finalText)
          setTranscript(prev => prev + (prev ? ' ' : '') + finalText)
        }
      }

      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error)
        setIsListening(false)
        isStartingRef.current = false
        
        switch (event.error) {
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone access and try again.')
            break
          case 'no-speech':
            setError('No speech detected. Please try speaking closer to the microphone.')
            break
          case 'audio-capture':
            setError('No microphone found. Please check your microphone connection.')
            break
          case 'network':
            setError('Network error. Please check your internet connection.')
            break
          case 'aborted':
            // This is expected when user stops recording, don't show error
            console.log('🛑 Speech recognition stopped by user')
            break
          default:
            setError(`Speech recognition error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        console.log('🛑 Speech recognition ended')
        setIsListening(false)
        setInterimTranscript('')
        isStartingRef.current = false
        
        // Send transcript to parent if we have any
        if (transcript.trim()) {
          onTranscript(transcript.trim())
          console.log('📤 Transcript sent to parent:', transcript.trim())
        }
      }

      recognitionRef.current = recognition
    } else {
      console.warn('⚠️ Speech recognition not supported')
      setIsSupported(false)
    }

    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.warn('⚠️ Error stopping recognition on cleanup:', e)
        }
      }
    }
  }, [transcript, onTranscript])

  const startListening = async () => {
    if (!recognitionRef.current || isListening || isStartingRef.current) return

    try {
      isStartingRef.current = true
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      setError(null)
      setTranscript('')
      setInterimTranscript('')
      
      console.log('🎤 Starting speech recognition...')
      recognitionRef.current.start()
      
    } catch (err: any) {
      console.error('❌ Microphone permission error:', err)
      setError('Microphone access is required for voice input. Please allow microphone access.')
      isStartingRef.current = false
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && (isListening || isStartingRef.current)) {
      try {
        console.log('🛑 Manually stopping speech recognition...')
        recognitionRef.current.stop()
        
        // Immediately update UI state
        setIsListening(false)
        isStartingRef.current = false
        
        // Send current transcript if available
        const currentTranscript = transcript.trim() || interimTranscript.trim()
        if (currentTranscript) {
          onTranscript(currentTranscript)
          console.log('📤 Final transcript sent:', currentTranscript)
        }
        
        // Clear interim text
        setInterimTranscript('')
        
      } catch (error) {
        console.error('❌ Error stopping recognition:', error)
        setIsListening(false)
        isStartingRef.current = false
      }
    }
  }

  const toggleListening = () => {
    if (isListening || isStartingRef.current) {
      stopListening()
    } else {
      startListening()
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    setError(null)
    console.log('🧹 Transcript cleared')
  }

  const sendCurrentTranscript = () => {
    const currentText = transcript.trim() || interimTranscript.trim()
    if (currentText) {
      onTranscript(currentText)
      setTranscript('')
      setInterimTranscript('')
      console.log('📤 Manual transcript send:', currentText)
    }
  }

  if (!isSupported) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl animate-fade-in">
        <div className="flex items-center gap-3 text-yellow-800">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Speech recognition not available</p>
            <p className="text-xs text-yellow-600 mt-1">
              Please use Chrome, Edge, or Safari for voice input functionality
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      
      {/* Voice Input Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            disabled={!isSupported}
            className={`
              flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
              ${isListening || isStartingRef.current
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
              }
            `}
          >
            {isListening || isStartingRef.current ? (
              <>
                <MicOff className="w-5 h-5" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Start Voice Input
              </>
            )}
          </button>
          
          {/* Additional Control Buttons */}
          <div className="flex gap-2">
            {(transcript || interimTranscript) && (
              <button
                onClick={sendCurrentTranscript}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                title="Add current speech to comments"
              >
                Add Text
              </button>
            )}
            
            {transcript && (
              <button
                onClick={clearTranscript}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                title="Clear transcript"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Listening Indicator */}
      {(isListening || isStartingRef.current) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3 text-blue-800">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-red-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="font-medium">
              {isStartingRef.current ? 'Starting...' : 'Listening... Speak now!'}
            </span>
            <Waves className="w-4 h-4 text-blue-600 animate-bounce" />
          </div>
          
          {/* Show interim results while speaking */}
          {interimTranscript && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-100">
              <p className="text-sm text-gray-600 italic">
                Hearing: "{interimTranscript}"
              </p>
            </div>
          )}
          
          {/* Show accumulated transcript */}
          {transcript && (
            <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                Captured: "{transcript}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start gap-3 text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Voice Input Error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-600 underline hover:text-red-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Transcript Result */}
      {transcript && !isListening && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 mb-2">Voice Input Ready:</p>
              <div className="bg-white p-3 rounded-lg border border-green-100">
                <p className="text-sm text-green-700 leading-relaxed">
                  "{transcript}"
                </p>
              </div>
              <p className="text-xs text-green-600 mt-2">
                ✅ Click "Add Text" to add to comments, or start recording again to add more
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span>Click "Start Voice Input" and allow microphone access</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>Speak clearly - you can record multiple times</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
            <span>Click "Stop Recording" when finished, then "Add Text"</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceInput

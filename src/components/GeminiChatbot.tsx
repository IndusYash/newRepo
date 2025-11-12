import React, { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Send, Trash2, User, Plane } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  content: string
  timestamp: Date
}

interface GeminiChatbotProps {
  className?: string
}

const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const initializeGemini = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        if (!apiKey) throw new Error('API key not found')
        const genAI = new GoogleGenerativeAI(apiKey)
        const generativeModel = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            maxOutputTokens: 512,
            temperature: 0.7
          }
        })
        setModel(generativeModel)
      } catch (err) {
        setError('Failed to initialize AI')
      }
    }
    initializeGemini()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !model || isLoading) return
    setIsLoading(true)
    setError(null)
    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      // Use last N messages for context
      const historyLength = 6
      const contextMessages = [...messages, userMessage].slice(-historyLength)

      // Gemini API expects only 'user' and 'model', alternating
      const geminiMessages = contextMessages
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))

      // For first message, prepend instructions to the text
      if (geminiMessages.length === 1) {
        geminiMessages[0].parts[0].text =
          `You are an expert Aviation Spotter AI for the Aviation Bay app. Only answer about aircraft, jets, aviation, jet spotting, airplane identification. Be concise and friendly.\n` +
          geminiMessages[0].parts[0].text
      }

      const result = await model.generateContent({
        contents: geminiMessages
      })
      console.log("🔗 Gemini raw response:", result)
      const candidate = result?.response?.candidates?.[0];
      console.log("Gemini candidate:", candidate);

      let aiContent = ""
      if (candidate?.content?.parts?.[0]?.text) {
        aiContent = candidate.content.parts[0].text
      } else if (typeof candidate?.content === 'string') {
        aiContent = candidate.content
      } else if (candidate?.text) {
        aiContent = candidate.text
      }
      if (!aiContent) {
        console.log("Gemini candidate structure (no text found):", candidate)
        aiContent = "Sorry, I didn't get a response. Try again or check the console for details."
      }

      const assistantMessage: Message = {
        role: 'model',
        content: aiContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err: unknown) {
      let errorMessage = 'Sorry, please try again.'
      if (err instanceof Error) {
        if (err.message?.includes('quota') || err.message?.includes('limit')) {
          errorMessage = 'Too many requests. Wait a moment.'
        } else if (err.message?.includes('SAFETY')) {
          errorMessage = 'Cannot respond to that question.'
        } else if (err.message?.includes('API key')) {
          errorMessage = 'API setup issue.'
        }
      }
      const errorMsg: Message = {
        role: 'model',
        content: errorMessage,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) sendMessage(input.trim())
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Aviation Bay AI</h3>
            <p className="text-sm text-gray-500">{messages.length} messages</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-gray-500 hover:text-red-600 rounded"
          disabled={messages.length === 0}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
        {messages.length === 0 && !error && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Plane className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Aviation Spotter AI</h3>
            <p className="text-gray-600 text-sm mb-4">
              Ask about jet models, airplane types, or share your aviation curiosity!
            </p>
            <div className="space-y-2 max-w-sm mx-auto">
              <button
                onClick={() => sendMessage('How can I identify a jet from a photo?')}
                className="w-full p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded border"
              >
                How do I spot a jet/aircraft model?
              </button>
              <button
                onClick={() => sendMessage('What are some famous fighter jets?')}
                className="w-full p-2 text-sm bg-sky-50 hover:bg-sky-100 rounded border"
              >
                What are famous jets?
              </button>
              <button
                onClick={() => sendMessage('How do I tell a Boeing from an Airbus?')}
                className="w-full p-2 text-sm bg-indigo-50 hover:bg-indigo-100 rounded border"
              >
                Boeing vs. Airbus differences
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
              message.role === 'user'
                ? 'bg-blue-500'
                : 'bg-blue-500'
            }`}>
              {message.role === 'user' ? (
                <User className="w-3 h-3 text-white" />
              ) : (
                <Plane className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-3 rounded-lg text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.content}
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-xs text-gray-500 ml-2">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about jets, airplanes..."
            disabled={isLoading || !model}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={isLoading || !model || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {model ? '✈️ Aviation AI ready' : '⏳ Connecting...'}
        </div>
      </form>
    </div>
  )
}

export default GeminiChatbot

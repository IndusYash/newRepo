import { GoogleGenerativeAI } from '@google/generative-ai'
import { DetectedJet, GeminiJetResponse } from '../types' // Change types to aviation context!
import { AI_JET_ANALYSIS_PROMPT } from '../utils/constants' // Update your prompt!

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export const analyzeImageWithGemini = async (imageDataUrl: string): Promise<DetectedJet[]> => {
  try {
    // Validate API key
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env file')
    }

    // Convert data URL to base64
    const base64Data = imageDataUrl.split(',')[1]
    if (!base64Data) {
      throw new Error('Invalid image data format')
    }

    // Determine MIME type from data URL
    const mimeTypeMatch = imageDataUrl.match(/data:([^;]+);/)
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg'

    console.log('🔍 Sending jet image to Gemini AI for analysis...')
    console.log('📊 Image size:', Math.round(base64Data.length * 0.75 / 1024), 'KB')

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout - please try again')), 30000)
    )

    // Use aviation-specific prompt!
    const analysisPromise = model.generateContent([AI_JET_ANALYSIS_PROMPT, imagePart])

    const result = await Promise.race([analysisPromise, timeoutPromise]) as any
    const response = await result.response
    const text = response.text()

    console.log('✅ Gemini AI jet response received')
    console.log('📝 Raw jet response:', text)

    // Parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.warn('⚠️ No JSON found in response, trying jet text extraction')
        return extractJetsFromText(text)
      }

      const parsedResponse: GeminiJetResponse = JSON.parse(jsonMatch[0])
      if (!parsedResponse.jets || !Array.isArray(parsedResponse.jets)) {
        console.warn('⚠️ Invalid jet response format, trying text extraction')
        return extractJetsFromText(text)
      }

      // Validate and filter jets
      const validJets = parsedResponse.jets
        .filter(jet =>
          jet.jetType &&
          typeof jet.confidence === 'number' &&
          jet.description &&
          jet.confidence >= 0.3
        )
        .map(jet => ({
          ...jet,
          jetType: normalizeJetType(jet.jetType),
          confidence: Math.min(jet.confidence, 1.0),
          description: jet.description.trim()
        }))

      console.log('🎯 Detected jets:', validJets)
      return validJets

    } catch (parseError) {
      console.error('❌ Error parsing Gemini jet response:', parseError)
      console.log('🔄 Falling back to jet text extraction')
      return extractJetsFromText(text)
    }

  } catch (error: any) {
    console.error('❌ Error calling Gemini API:', error)

    if (error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini API configuration.')
    }
    if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.')
    }
    if (error.message?.includes('timeout')) {
      throw new Error('Request timeout. Please try again with a smaller image.')
    }

    throw new Error('Failed to analyze jet image. Please try again.')
  }
}

// Normalize jet type names to match predefined categories
const normalizeJetType = (jetType: string): string => {
  const normalized = jetType.toLowerCase().trim()

  // Standard aviation types; add more as you expand!
  const jetTypeMap: Record<string, string> = {
    'fighter': 'fighter jet',
    'f16': 'fighter jet',
    'mig': 'fighter jet',
    'rafale': 'fighter jet',
    'hornet': 'fighter jet',
    'airbus': 'commercial airliner',
    'boeing': 'commercial airliner',
    'a320': 'commercial airliner',
    '737': 'commercial airliner',
    'passenger': 'commercial airliner',
    'helicopter': 'helicopter',
    'chopper': 'helicopter',
    'apache': 'helicopter',
    'bell': 'helicopter',
    'drone': 'drone',
    'uav': 'drone',
    'quadcopter': 'drone',
    'cargo': 'cargo aircraft',
    'freighter': 'cargo aircraft'
  }

  return jetTypeMap[normalized] || normalized
}

// Fallback function to extract jets from text (for basic identification)
const extractJetsFromText = (text: string): DetectedJet[] => {
  console.log('🔄 Extracting jets from text response')

  const jets: DetectedJet[] = []
  const textLower = text.toLowerCase()

  // Static aviation keywords; extend as needed!
  const jetKeywords = [
    {
      jetType: 'fighter jet',
      terms: ['fighter', 'f16', 'mig', 'rafale', 'hornet', 'combat'],
      confidence: 0.8
    },
    {
      jetType: 'commercial airliner',
      terms: ['airbus', 'boeing', 'passenger', 'a320', '737'],
      confidence: 0.8
    },
    {
      jetType: 'helicopter',
      terms: ['helicopter', 'chopper', 'bell', 'apache', 'rotor'],
      confidence: 0.75
    },
    {
      jetType: 'drone',
      terms: ['drone', 'uav', 'quadcopter'],
      confidence: 0.7
    },
    {
      jetType: 'cargo aircraft',
      terms: ['cargo', 'freighter', 'goods', 'transport'],
      confidence: 0.65
    }
  ]

  jetKeywords.forEach(({ jetType, terms, confidence }) => {
    const foundTerms = terms.filter(term => textLower.includes(term))
    if (foundTerms.length > 0) {
      const adjustedConfidence = Math.min(confidence + (foundTerms.length - 1) * 0.1, 0.98)

      jets.push({
        jetType,
        confidence: adjustedConfidence,
        description: `Detected ${jetType} based on AI analysis (found: ${foundTerms.join(', ')})`
      })
    }
  })

  const uniqueJets = jets.filter((jet, index, self) =>
    index === self.findIndex(j => j.jetType === jet.jetType)
  )

  console.log('📋 Extracted jets from text:', uniqueJets)
  return uniqueJets
}

// Test API connection
export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.error('❌ Gemini API key not found')
      return false
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent('Hello, please respond with "OK" if you can see this message.')
    const response = await result.response
    const text = response.text()

    console.log('🔗 Gemini API test response:', text)
    return text.toLowerCase().includes('ok')
  } catch (error) {
    console.error('❌ Gemini API connection test failed:', error)
    return false
  }
}

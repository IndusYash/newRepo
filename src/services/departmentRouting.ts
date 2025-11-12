// src/services/jetIdentification.ts

interface JetIdentificationRule {
  jetPatterns: string[]
  jetTypeId: string
  confidence: number
  keywords?: string[]
  priority?: string[]  // Use for reporting urgency if needed
}

interface JetIdentificationResult {
  jetTypeId: string
  confidence: number
  reasoning: string
  alternativeJetTypes?: string[]
}

// Aviation Bay jet identification rules
const JET_RULES: JetIdentificationRule[] = [
  {
    jetPatterns: ['fighter', 'f16', 'mig', 'rafale', 'hornet'],
    jetTypeId: '1', // Fighter Jets
    confidence: 0.98,
    keywords: ['supersonic', 'combat', 'stealth', 'wings', 'missile'],
    priority: ['urgent', 'high']
  },
  {
    jetPatterns: ['airbus', 'boeing', 'commercial', '737', 'a320', 'passenger'],
    jetTypeId: '2', // Commercial Airliner
    confidence: 0.97,
    keywords: ['passenger', 'airbus', 'boeing', 'flight', 'route'],
    priority: ['medium', 'high']
  },
  {
    jetPatterns: ['helicopter', 'apache', 'bell', 'rotor', 'chopper'],
    jetTypeId: '3', // Helicopters
    confidence: 0.96,
    keywords: ['rotor', 'vertical', 'chopper', 'hover'],
    priority: ['medium', 'urgent']
  },
  {
    jetPatterns: ['drone', 'uav', 'quadcopter'],
    jetTypeId: '4', // Drones
    confidence: 0.93,
    keywords: ['remote', 'quadcopter', 'uav', 'drone'],
    priority: ['medium', 'low']
  },
  {
    jetPatterns: ['cargo', 'freighter'],
    jetTypeId: '5', // Cargo Aircraft
    confidence: 0.90,
    keywords: ['cargo', 'freighter', 'goods', 'transport'],
    priority: ['medium', 'low']
  }
]

// AI-powered aviation jet identification (routing is now type assignment)
export class JetIdentificationService {

  // Main auto-assignment function (use image data later)
  static async autoAssignJetType(report: {
    jetName: string
    description: string
    priority: string
    location?: { address: string }
  }): Promise<JetIdentificationResult> {

    console.log('Auto-assigning jet type for report:', report.jetName)

    try {
      // Direct pattern match for jet name/type
      const directMatch = this.findDirectJetMatch(report.jetName)
      if (directMatch) {
        return {
          jetTypeId: directMatch.jetTypeId,
          confidence: directMatch.confidence,
          reasoning: `Direct jet match: "${report.jetName}" assigned to jet type`,
          alternativeJetTypes: []
        }
      }

      // Text analysis: review description and jetName
      const textAnalysis = await this.analyzeReportText(report)
      if (textAnalysis.confidence > 0.7) {
        return textAnalysis
      }

      // Location-based identification (optional, not usual for jets)
      // You can add custom location logic if needed, e.g., base or known airport spotting.

      // Default fallback
      return this.getDefaultAssignment(report.priority)

    } catch (error) {
      console.error('Error in auto-assignment:', error)
      return this.getDefaultAssignment(report.priority)
    }
  }

  // Direct pattern matching
  private static findDirectJetMatch(jetName: string): JetIdentificationRule | null {
    const normalizedJetName = jetName.toLowerCase()

    return JET_RULES.find(rule =>
      rule.jetPatterns.some(pattern =>
        normalizedJetName.includes(pattern) || pattern.includes(normalizedJetName)
      )
    ) || null
  }

  // Text analysis of report (jetName + description)
  private static async analyzeReportText(report: {
    jetName: string
    description: string
    priority: string
  }): Promise<JetIdentificationResult> {
    const combinedText = `${report.jetName} ${report.description}`.toLowerCase()
    const scores: Record<string, number> = {}
    const matchedKeywords: Record<string, string[]> = {}

    // Analyze keywords for each jet type
    JET_RULES.forEach(rule => {
      let score = 0
      const keywords: string[] = []

      rule.jetPatterns.forEach(pattern => {
        if (combinedText.includes(pattern)) {
          score += 0.3
          keywords.push(pattern)
        }
      })

      if (rule.keywords) {
        rule.keywords.forEach(keyword => {
          if (combinedText.includes(keyword)) {
            score += 0.2
            keywords.push(keyword)
          }
        })
      }

      if (rule.priority && rule.priority.includes(report.priority)) {
        score += 0.1
      }

      if (score > 0) {
        scores[rule.jetTypeId] = score
        matchedKeywords[rule.jetTypeId] = keywords
      }
    })

    // Find best match
    const entries = Object.entries(scores)
    if (entries.length === 0) {
      return {
        jetTypeId: '1',
        confidence: 0.2,
        reasoning: 'No keyword matches found - defaulting to Fighter Jet'
      }
    }

    const bestEntry = entries.reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)

    if (bestEntry && scores[bestEntry[0]] > 0.3) {
      const keywords = matchedKeywords[bestEntry[0]] || []
      return {
        jetTypeId: bestEntry[0],
        confidence: Math.min(scores[bestEntry[0]], 0.98),
        reasoning: `Text analysis matched keywords: ${keywords.join(', ')}`,
        alternativeJetTypes: Object.keys(scores).filter(d => d !== bestEntry[0])
      }
    }

    return {
      jetTypeId: '1',
      confidence: 0.2,
      reasoning: 'Low confidence text analysis - defaulting to Fighter Jet'
    }
  }

  // Default jet assignment based on priority
  private static getDefaultAssignment(priority: string): JetIdentificationResult {
    const priorityDefaults: Record<string, string> = {
      'urgent': '1',      // Fighter Jets
      'high': '2',        // Commercial Airliner
      'medium': '3',      // Helicopters
      'low': '4',         // Drones
    }

    const defaultJet = priorityDefaults[priority] || '1'

    return {
      jetTypeId: defaultJet,
      confidence: 0.5,
      reasoning: `Default assignment based on priority: "${priority}"`,
      alternativeJetTypes: Object.values(priorityDefaults).filter(d => d !== defaultJet)
    }
  }

  // Helper: Get jet type name
  static getJetTypeName(jetTypeId: string): string {
    const jetTypeNames: Record<string, string> = {
      '1': 'Fighter Jet',
      '2': 'Commercial Airliner',
      '3': 'Helicopter',
      '4': 'Drone',
      '5': 'Cargo Aircraft'
    }

    return jetTypeNames[jetTypeId] || 'General Aviation'
  }

  // Get identification statistics
  static getIdentificationStats(): {
    totalRules: number
    jetTypesCount: number
    avgConfidence: number
  } {
    const confidences = JET_RULES.map(rule => rule.confidence)
    const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length

    return {
      totalRules: JET_RULES.length,
      jetTypesCount: new Set(JET_RULES.map(rule => rule.jetTypeId)).size,
      avgConfidence: Math.round(avgConfidence * 100) / 100
    }
  }
}

export type { JetIdentificationRule, JetIdentificationResult }

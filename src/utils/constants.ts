import { JetCategory } from '../types'

export const JET_CATEGORIES: JetCategory[] = [
  {
    id: 'fighter-jet',
    name: 'Fighter Jets',
    description: 'Military jet aircraft for combat and defense',
    color: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
    icon: '✈️'
  },
  {
    id: 'commercial-airliner',
    name: 'Commercial Airliners',
    description: 'Jets used for passenger transport (Airbus, Boeing, etc)',
    color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
    icon: '🛫'
  },
  {
    id: 'helicopter',
    name: 'Helicopters',
    description: 'Rotary-wing aircraft including choppers',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200',
    icon: '🚁'
  },
  {
    id: 'drone',
    name: 'Drones',
    description: 'UAVs, quadcopters and other unmanned jets',
    color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
    icon: '🛸'
  },
  {
    id: 'cargo-aircraft',
    name: 'Cargo Aircraft',
    description: 'Freighters and transport jets for goods',
    color: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200',
    icon: '✈️'
  }
]

export const AI_JET_ANALYSIS_PROMPT = `
Analyze this image for jet aircraft and classify by type. Look for:
- Fighter jets (military, combat, etc.)
- Commercial airliners (Airbus, Boeing, etc.)
- Helicopters
- Drones (UAVs, quadcopters, etc.)
- Cargo aircraft

For each jet found, provide:
1. Jet type (one of: fighter-jet, commercial-airliner, helicopter, drone, cargo-aircraft)
2. Confidence level (0.0 to 1.0)
3. Brief description of the specific jet

Return response in JSON format:
{
  "jets": [
    {
      "jetType": "jet_type_name",
      "confidence": 0.85,
      "description": "Brief description of the jet"
    }
  ]
}

If no jets are found, return: {"jets": []}
`

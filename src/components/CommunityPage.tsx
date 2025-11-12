import { X, Hammer } from 'lucide-react'

const CommunityPage = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-10 flex flex-col items-center animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center space-y-4">
          <Hammer className="w-16 h-16 text-blue-500 mb-2 animate-bounce" />
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">Coming Soon!</h2>
          <p className="text-lg text-gray-600 text-center max-w-md">
            The Community & Jet Sightings page for <span className="font-semibold text-blue-600">Aviation Bay</span> is under construction.<br />
            We’re building features for sharing jet photos, experiences, and discussions.<br />
            Stay tuned for takeoff!
          </p>
        </div>
      </div>
    </div>
  )
}

export default CommunityPage

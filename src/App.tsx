import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, AviationAuthContext } from "./contexts/AviationAuthContext";
import Navbar from "./components/Navbar";
import CameraCapture from "./components/CameraCapture";
import JetCategories from "./components/JetCategories";
import VoiceInput from "./components/VoiceInput";
import AIAnalysis from "./components/AIAnalysis";
import MapView from "./components/MapView";
import LoadingScreen from "./components/LoadingScreen";
import CommunityPage from "./components/CommunityPage";
import GeminiChatbot from "./components/GeminiChatbot";
import { analyzeImageWithGemini, testGeminiConnection } from "./services/gemini";
import { DetectedJet, JetReport } from "./types";
import {
  Loader2, CheckCircle, AlertCircle, Camera, Send, RefreshCw, MapPin, Clock, User,
  MessageCircle, X, Settings, ArrowLeft,
} from "lucide-react";

// ==== Citizen Aviation Bay Main App Page ====
function CitizenAppContent() {
  const auth = useContext(AviationAuthContext);
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated;
  const navigate = useNavigate();

  // =======================
  // Correct state initializations!
  // =======================
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  const [showCommunity, setShowCommunity] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  // removed optional Profile/Auth modal states (components not present)
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedJets, setDetectedJets] = useState<DetectedJet[]>([]);
  const [selectedJetTypes, setSelectedJetTypes] = useState<string[]>([]);
  const [spotterNotes, setSpotterNotes] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<"valid" | "invalid" | "checking">("checking");
  // match JetReport.location type: object with optional address | undefined
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | undefined>(undefined);

  // ==== App Initialization ====
  useEffect(() => {
    const initializeApp = async () => {
      // API key check
      const isValid = await testGeminiConnection();
      setApiKeyStatus(isValid ? "valid" : "invalid");
      // Try to get geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) =>
            setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
          (err) => setUserLocation(undefined),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      }
      setIsInitialLoading(false);
    };
    initializeApp();
  }, []);

  // ==== Image Analysis ====
  const handleImageCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setIsAnalyzing(true);
    setError(null);
    try {
      if (apiKeyStatus !== "valid") throw new Error("AI service not ready.");
      const jets = await analyzeImageWithGemini(imageDataUrl);
      setDetectedJets(jets);
      if (isAuthenticated) setSelectedJetTypes(jets.map(jet => jet.jetType));
    } catch (error: any) {
      setError(error.message || "Failed to analyze image. Please try again.");
      setDetectedJets([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ==== Submit Jet Sighting (SAVE TO SUPABASE IN REAL APP) ====
  const handleSubmitJetSpotting = async () => {
    if (!capturedImage) return setError("Please capture a jet photo first.");
    if (!isAuthenticated && detectedJets.length === 0)
      return setError("No jets identified by AI. Please sign in to manually select/confirm jet types.");
    if (isAuthenticated && selectedJetTypes.length === 0)
      return setError("Please select at least one jet type.");
    setIsSubmitting(true);
    setError(null);
    try {
      const report: JetReport = {
        id: `AVBAY-${Date.now()}`,
        image: capturedImage,
        jetTypes: isAuthenticated ? selectedJetTypes : detectedJets.map(jet => jet.jetType),
        detectedJets,
        timestamp: new Date().toISOString(),
        location: userLocation,
        comments: spotterNotes, // provide required "comments" field from spotterNotes
        // user in the demo context doesn't include `id` — cast to any to satisfy the type
        userId: isAuthenticated ? (user as any)?.id : undefined,
        submissionType: isAuthenticated ? "manual" : "ai-only",
      };
      // Replace with:
      // await supabase.from('jet_reports').insert(report);
      setSubmitted(true);
      setTimeout(resetForm, 4000);
    } catch (error) {
      setError("Failed to submit jet report. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCapturedImage(null);
    setDetectedJets([]);
    setSelectedJetTypes([]);
    setSpotterNotes("");
    setError(null);
  };

  // ==== LOADING & SUBMISSION VIEWS ====
  if (isInitialLoading) return <LoadingScreen />;
  if (submitted)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Jet Spotted Successfully!</h2>
            <p className="text-gray-600 leading-relaxed">
              Thank you for your jet spotting! The Aviation Bay community appreciates your contribution.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-6">
              <Clock className="w-4 h-4" />
              <span>
                Spotted at: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "unknown location"}
              </span>
            </div>
            <button onClick={resetForm} className="mt-4 px-8 py-4 bg-blue-500 text-white rounded-xl">
              Spot Another Jet!
              <RefreshCw className="w-5 h-5 ml-2" />
            </button>
          </div>
        </main>
      </div>
    );

  // ==== MAIN REPORTING UI ====
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar
        user={user}
        isAuthenticated={isAuthenticated}
        // The prop expects "() => void" so remove "tab" argument!
        onMapClick={() => setShowMap(true)}
        onCommunityClick={() => setShowCommunity(true)}
        // leave profile/auth actions out (UserProfile/AuthModal not present)
      />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-xl">✈️</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Aviation Bay: Jet Spotting</h1>
            <p className="text-blue-600 font-semibold mb-4">India's open platform for aviation enthusiasts</p>
            <p className="text-gray-600 text-lg">Capture and upload jet photos, let our AI identify the jet, and help map airspace activity!</p>
          </div>
          {/* Camera */}
          {!capturedImage ? (
            <CameraCapture onImageCapture={handleImageCapture} />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Captured Jet Image</h2>
              </div>
              <img src={capturedImage} alt="Captured Jet" className="max-w-full max-h-64 rounded-xl shadow-lg mx-auto mb-4" />
              <button onClick={resetForm} className="px-4 py-2 bg-gray-400 text-white rounded">
                Take New Photo <RefreshCw className="w-4 h-4 inline ml-2" />
              </button>
            </div>
          )}

          {/* AI Jet Detection Results */}
          {capturedImage && (
            <>
              <div>
                <AIAnalysis detectedJets={detectedJets} isAnalyzing={isAnalyzing} />
                {isAuthenticated ? (
                  <JetCategories selectedJetTypes={selectedJetTypes} onSelectionChange={setSelectedJetTypes} />
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4 text-left">
                    <h3 className="font-bold text-blue-900 mb-2">AI-Detected Jet Types:</h3>
                    {detectedJets.length > 0 ? (
                      detectedJets.map((jet, idx) => (
                        <div key={idx} className="mb-2">
                          <span className="font-medium capitalize">{jet.jetType}</span>
                          <span className="ml-2 text-xs text-blue-700">{Math.round(jet.confidence * 100)}% confidence</span>
                          <p className="text-xs text-blue-500 mt-1">{jet.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-blue-700">No jets identified yet.</p>
                    )}
                  </div>
                )}
              </div>
              {/* Spotter comments */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-3">Spotter Notes (optional)</h2>
                <textarea
                  className="w-full min-h-[80px] p-3 border rounded"
                  placeholder="Add details about the sighting, location, or other notes..."
                  value={spotterNotes}
                  onChange={(e) => setSpotterNotes(e.target.value)}
                />
                <VoiceInput onTranscript={(text: string) => setSpotterNotes(spotterNotes ? (spotterNotes + " " + text) : text)} />
              </div>
              {/* Submission */}
              <div className="text-center mt-4">
                <button
                  onClick={handleSubmitJetSpotting}
                  className={`px-12 py-5 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl transition-all duration-200 shadow-xl`}
                  disabled={isSubmitting || (isAuthenticated ? selectedJetTypes.length === 0 : detectedJets.length === 0) || isAnalyzing}
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin inline mr-2" /> : <Send className="w-6 h-6 inline mr-2" />}
                  Spot this Jet!
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mt-4 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="font-bold text-red-800">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button onClick={() => setError(null)} className="text-red-500 underline font-medium">Dismiss</button>
              </div>
            </div>
          )}
        </div>
        {/* Community, Map, Profile, Auth Modals, Chatbot... */}
        {showCommunity && <CommunityPage onClose={() => setShowCommunity(false)} />}
        {showMap && <MapView onClose={() => setShowMap(false)} />}
        {/* Profile, Auth Modals removed */}
        {showChatbot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold">AI Assistant</h2>
                </div>
                <button onClick={() => setShowChatbot(false)} className="p-2">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <GeminiChatbot />
              </div>
            </div>
          </div>
        )}
        {/* Floating Chatbot Button */}
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full shadow-lg z-40 flex items-center justify-center"
          title="Open AI Assistant"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </main>
    </div>
  );
}

// ==== Main App Export ====
function App() {
  return (
    <Router>
      <div className="App">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<CitizenAppContent />} />
            {/* removed AdminPanel route (component not found) */}
             <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </div>
    </Router>
  );
}

export default App;

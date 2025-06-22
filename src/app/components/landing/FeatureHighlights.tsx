import { Zap, Palette, CloudSun } from 'lucide-react';

const FeatureHighlights = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-5xl">
    <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
      <div className="p-3 bg-blue-500/20 rounded-full mb-4">
        <Zap className="h-6 w-6 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-blue-400">Smart Organization</h3>
      <p className="text-gray-400 text-center">Effortlessly catalog your clothes with AI-powered image recognition and smart categorization.</p>
    </div>
    <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
      <div className="p-3 bg-purple-500/20 rounded-full mb-4">
        <Palette className="h-6 w-6 text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-purple-400">Style Recommendations</h3>
      <p className="text-gray-400 text-center">Get personalized outfit suggestions based on your wardrobe, weather, and style preferences.</p>
    </div>
    <div className="flex flex-col items-center p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105">
      <div className="p-3 bg-teal-500/20 rounded-full mb-4">
        <CloudSun className="h-6 w-6 text-teal-400" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-teal-400">Weather Integration</h3>
      <p className="text-gray-400 text-center">Plan your outfits with real-time weather updates and seasonal recommendations.</p>
    </div>
  </div>
);

export default FeatureHighlights; 
import { Cloud, CloudRain, CloudSnow, CloudSun, Sun, Wind } from "lucide-react";
import { useWeather } from "@/app/context/WeatherContext";
import { useState } from "react";

// Animated weather icons
const AnimatedRain = () => (
  <div className="relative w-4 h-4">
    <CloudRain className="w-4 h-4 text-blue-400" />
    <div className="absolute inset-0 overflow-hidden">
      <div className="animate-rain">
        <div className="raindrop" />
        <div className="raindrop" style={{ animationDelay: "0.2s" }} />
        <div className="raindrop" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  </div>
);

const AnimatedSnow = () => (
  <div className="relative w-4 h-4">
    <CloudSnow className="w-4 h-4 text-blue-300" />
    <div className="absolute inset-0 overflow-hidden">
      <div className="animate-snow">
        <div className="snowflake" />
        <div className="snowflake" style={{ animationDelay: "0.2s" }} />
        <div className="snowflake" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  </div>
);

const AnimatedWind = () => (
  <div className="relative w-4 h-4">
    <Wind className="w-4 h-4 text-gray-400 animate-wind" />
  </div>
);

export default function WeatherDisplay() {
  const { weatherData } = useWeather();
  const [isHovered, setIsHovered] = useState(false);

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle')) {
      return <AnimatedRain />;
    } else if (desc.includes('snow')) {
      return <AnimatedSnow />;
    } else if (desc.includes('mist') || desc.includes('fog')) {
      return <Cloud className="w-4 h-4 text-gray-300" />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="w-4 h-4 text-gray-400" />;
    } else if (desc.includes('partly cloudy') || desc.includes('few clouds')) {
      return <CloudSun className="w-4 h-4 text-blue-400" />;
    } else if (desc.includes('wind')) {
      return <AnimatedWind />;
    } else {
      return <Sun className="w-4 h-4 text-yellow-400" />;
    }
  };

  if (!weatherData) return null;

  return (
    <div className="relative">
      <button 
        className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-800/50 rounded-full hover:bg-gray-800/70 transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {getWeatherIcon(weatherData.description)}
        <span className="text-sm font-medium text-gray-200">
          {Math.round(weatherData.temperature)}°F
        </span>
        <span className="text-xs text-gray-400">
          {weatherData.location}
        </span>
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div 
          className="absolute right-0 mt-2 w-72 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl shadow-2xl p-4 z-50 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-700/50">
            <div className="p-2 bg-gray-700/50 rounded-lg">
              {getWeatherIcon(weatherData.description)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {weatherData.description}
              </h3>
              <p className="text-sm text-gray-400">{weatherData.location}</p>
            </div>
          </div>
          
          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Temperature</div>
              <div className="text-lg font-medium text-gray-200">
                {Math.round(weatherData.temperature)}°F
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Feels Like</div>
              <div className="text-lg font-medium text-gray-200">
                {Math.round(weatherData.feels_like)}°F
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Humidity</div>
              <div className="text-lg font-medium text-gray-200">
                {weatherData.humidity}%
              </div>
            </div>
            
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Wind Speed</div>
              <div className="text-lg font-medium text-gray-200">
                {weatherData.wind_speed} mph
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-400 text-right">
            Last updated: {new Date(weatherData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
} 
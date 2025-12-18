import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isVisible: boolean;
}

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isVisible && isAnimating === false) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isAnimating]);

  // Don't render anything if loading is complete and animation is done
  if (!isVisible && !isAnimating) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center overflow-hidden transition-transform duration-500"
      style={{
        transform: isAnimating ? "translateY(-100%)" : "translateY(0)",
      }}
    >
      {/* Animated spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-gray-700 border-t-cyan-500 animate-spin"></div>
      </div>

      {/* Loading text */}
      <h2 className="text-2xl font-semibold text-white mb-2">Loading Player Data</h2>
      <p className="text-gray-400 text-sm">Retrieving stats and hero information...</p>
    </div>
  );
}

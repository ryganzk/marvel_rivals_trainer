"use client"; // This is required for button clicks/state

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const cachePlayerStats = (name: string, payload: any) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(
      `playerStats:${name.toLowerCase()}`,
      JSON.stringify({ data: payload, cachedAt: Date.now() })
    );
  };

  // Function to call our internal API route
  const fetchPlayerStats = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      alert("Please enter a player username.");
      return;
    }

    setLoading(true);
    setFeedback(null); // Clear previous results
    
    try {
      // We call our new local API route: /api/player/[username]
      const response = await fetch(`/api/player/${trimmedUsername}`);
      const result = await response.json();

      if (!response.ok) {
        // Handle errors like player not found or API issue
        const message = result?.error || JSON.stringify(result);
        setFeedback(`Error (${response.status}): ${message}`);
      } else {
        cachePlayerStats(trimmedUsername, result);
        setFeedback("Success. Opening player view...");
        router.push(`/player/${encodeURIComponent(trimmedUsername)}`);
      }
      
    } catch (error) {
      console.error("Error fetching player stats:", error);
      setFeedback("Failed to load data (Network Error)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 sm:p-24 bg-gray-900 text-white">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-10 text-cyan-400 tracking-wider">
        MARVEL RIVALS TRAINER
      </h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full max-w-lg">
        {/* The Input Field */}
        <input
          type="text"
          placeholder="Enter Marvel Rivals Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-grow p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400 text-sm"
          disabled={loading}
        />

        {/* The Button */}
        <button
          onClick={fetchPlayerStats}
          disabled={loading}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 rounded-lg font-bold transition-all shadow-md shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-cyan-400 text-sm"
        >
          {loading ? "FETCHING..." : "GET PLAYER STATS"}
        </button>
      </div>

      {/* The Output Field */}
      <div className="w-full max-w-4xl p-4 pt-8 bg-black border border-gray-700 rounded-md shadow-2xl relative">
        <div className="absolute top-0 left-0 bg-gray-800 px-2 py-1 text-xs text-gray-400 rounded-tl-md rounded-br-md">
          PLAYER STATS ROUTING STATUS
        </div>
        
        <pre className="mt-4 overflow-auto max-h-[600px] text-xs sm:text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
          {feedback
            ? feedback
            : "// Enter a username and click 'GET PLAYER STATS'. Successful responses open a dedicated player page."}
        </pre>
      </div>
    </main>
  );
}
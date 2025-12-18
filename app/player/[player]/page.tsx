"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import HeroRolePieChart from "@/app/components/HeroRolePieChart";
import HeroPlayedPieChart from "@/app/components/HeroPlayedPieChart";
import LoadingScreen from "@/app/components/LoadingScreen";

const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const IS_DEV = process.env.NODE_ENV === "development";

const playerCacheKey = (player: string) => `playerStats:${player.toLowerCase()}`;
const updateLockKey = (player: string) => `playerUpdateLock:${player.toLowerCase()}`;

const formatRemaining = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

export default function PlayerPage() {
  const params = useParams<{ player: string }>();
  const router = useRouter();
  const username = decodeURIComponent(params?.player ?? "");

  const [playerData, setPlayerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [nextUpdateAt, setNextUpdateAt] = useState<number | null>(null);
  const [clock, setClock] = useState(Date.now());
  const [selectedRole, setSelectedRole] = useState<'Vanguard' | 'Duelist' | 'Strategist' | null>(null);
  const [useRanked, setUseRanked] = useState<boolean>(false);

  // Tick a local clock for the countdown text.
  useEffect(() => {
    const id = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!username) return;

    let shouldFetchFresh = true;

    // Check for cached player data
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(playerCacheKey(username));
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed?.data && parsed?.cachedAt) {
            const cacheAge = Date.now() - parsed.cachedAt;
            // Use cached data if it's less than 30 minutes old
            if (cacheAge < THIRTY_MINUTES_MS) {
              setPlayerData(parsed.data);
              shouldFetchFresh = false;
            }
          }
        } catch (err) {
          console.warn("Failed to parse cached player data", err);
        }
      }

      const lockedUntil = localStorage.getItem(updateLockKey(username));
      if (lockedUntil) {
        const ts = Number(lockedUntil);
        if (!Number.isNaN(ts)) setNextUpdateAt(ts);
      }
    }

    // Only fetch fresh data if cache is missing or expired
    if (shouldFetchFresh) {
      fetchPlayerData();
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;
    if (nextUpdateAt !== null && nextUpdateAt <= clock) {
      setNextUpdateAt(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem(updateLockKey(username));
      }
    }
  }, [clock, nextUpdateAt, username]);

  const fetchPlayerData = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/player/${username}`);
      const result = await res.json();

      if (!res.ok) {
        const message = result?.error || `Request failed (${res.status})`;
        throw new Error(message);
      }

      setPlayerData(result);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          playerCacheKey(username),
          JSON.stringify({ data: result, cachedAt: Date.now() })
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load player data";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!username) return;
    setUpdateLoading(true);
    setUpdateMessage(null);

    try {
      const res = await fetch(`/api/player/${username}/update`);
      const result = await res.json();

      if (!res.ok) {
        const message = result?.error || `Update failed (${res.status})`;
        throw new Error(message);
      }

      const lockUntil = Date.now() + THIRTY_MINUTES_MS;
      setNextUpdateAt(lockUntil);
      if (typeof window !== "undefined") {
        localStorage.setItem(updateLockKey(username), String(lockUntil));
      }

      setUpdateMessage("Update requested. Refreshing stats...");
      await fetchPlayerData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed";
      setUpdateMessage(message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const remainingMs = nextUpdateAt ? Math.max(0, nextUpdateAt - clock) : 0;
  const updateDisabled = updateLoading || remainingMs > 0;
  const iconPath = playerData?.player?.icon?.player_icon as string | undefined;
  const iconUrl = iconPath
    ? iconPath.startsWith("http")
      ? iconPath
      : `https://marvelrivalsapi.com/rivals${iconPath}`
    : null;

  const rankPath = playerData?.player?.rank?.image as string | undefined;
  const rankUrl = rankPath
    ? rankPath.startsWith("http")
      ? rankPath
      : `https://marvelrivalsapi.com/rivals${rankPath}`
    : null;
  const rankName = playerData?.player?.rank?.rank ?? "Unranked";
  const displayName = playerData?.player?.player_name || username || "Unknown Player";
  const teamName = playerData?.player?.team?.club_team_mini_name || "No Team";
  const heroes = (useRanked ? playerData?.heroes_ranked : playerData?.heroes_unranked) || [];

  return (
    <>
      <LoadingScreen isVisible={!playerData} />
      <main className="min-h-screen bg-gray-900 text-white">
        {/* Banner section with green background */}
        <div className="relative bg-green-900 overflow-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-12 relative z-10">
            {/* Banner content will go here */}
          </div>
        </div>

        {/* Divider section */}
        <div className="relative w-full overflow-hidden" style={{ height: '180px' }}>
          <svg
            className="absolute top-0 left-0 w-full h-full"
            viewBox="0 0 1200 180"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          {/* Fill the area above the divider with banner color */}
          <path
            d="M0,0 L1200,0 L1200,10 L380,70 L400,20 L0,120 Z"
            fill="#14532d"
          />
          {/* Fill the area below the divider with page background color */}
          <path
            d="M0,120 L400,20 L380,70 L1200,10 L1200,180 L0,180 Z"
            fill="#111827"
          />
          {/* Three-line divider in page color */}
          <line
            x1="0"
            y1="120"
            x2="400"
            y2="20"
            stroke="#111827"
            strokeWidth="3"
          />
          <line
            x1="400"
            y1="20"
            x2="380"
            y2="70"
            stroke="#111827"
            strokeWidth="3"
          />
          <line
            x1="380"
            y1="70"
            x2="1200"
            y2="10"
            stroke="#111827"
            strokeWidth="3"
          />
        </svg>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 relative pt-6">
        <div className="flex justify-end mb-6">
          <div className="text-right flex flex-col items-end gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-white break-all">{displayName}</h1>
            <div className="flex items-center gap-3">
              {rankUrl && (
                <img
                  src={rankUrl}
                  alt={`${rankName} badge`}
                  className="h-10 w-10 object-contain"
                  loading="lazy"
                />
              )}
              <span className="text-lg font-semibold text-white">{rankName}</span>
            </div>
            <p className="text-sm text-gray-300">{teamName}</p>
            <button
              onClick={handleUpdate}
              disabled={updateDisabled}
              className="px-4 py-2 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 rounded-md font-semibold transition-all border border-cyan-400"
            >
              {updateLoading ? "Updating..." : updateDisabled ? "Update Locked" : "Update Player"}
            </button>
            {(remainingMs > 0 || updateMessage) && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-gray-300">
                  {remainingMs > 0 ? `Update in ${formatRemaining(remainingMs)}` : "Update available now"}
                </span>
                {updateMessage && (
                  <span className="text-xs text-amber-200">{updateMessage}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-12">
        {loading && <p className="text-sm text-gray-300">Loading player data...</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}

        {!loading && !error && playerData && (
          <>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-[260px]">
                <HeroRolePieChart
                  heroes={heroes}
                  selectedRole={selectedRole}
                  onSelectRole={setSelectedRole}
                />
              </div>
              <div className="flex-1 min-w-[260px]">
                <HeroPlayedPieChart heroes={heroes} filterRole={selectedRole} />
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setUseRanked((v) => !v)}
                className="px-4 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md hover:border-cyan-500 transition-all"
              >
                Viewing: {useRanked ? 'Ranked' : 'Unranked'} — Click to switch
              </button>
            </div>

            {IS_DEV && (
              <div className="mt-8 w-full text-left p-4 pt-8 bg-black border border-gray-700 rounded-md shadow-2xl relative">
                <div className="absolute top-0 left-0 bg-gray-800 px-2 py-1 text-xs text-gray-400 rounded-tl-md rounded-br-md">
                  PLAYER STATS JSON OUTPUT
                </div>
                <pre className="mt-4 overflow-auto max-h-[600px] text-left text-xs sm:text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(playerData, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}

        {!loading && !error && !playerData && (
          <p className="text-sm text-gray-400">No player data found.</p>
        )}
      </div>
      </main>
    </>
  );
}

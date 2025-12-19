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
  const [selectedHero, setSelectedHero] = useState<string | null>(null);
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

  const apiVersion = process.env.NEXT_PUBLIC_MARVEL_RIVALS_API_VERSION || "v1";

  const fetchPlayerData = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/${apiVersion}/player/${username}`);
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
      const res = await fetch(`/api/${apiVersion}/player/${username}/update`);
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

  // Calculate KDA based on filters
  const calculateKDA = () => {
    let filteredHeroes = heroes;

    // Filter by selected hero
    if (selectedHero) {
      filteredHeroes = filteredHeroes.filter(
        (h: any) => h.hero_name?.toLowerCase() === selectedHero.toLowerCase()
      );
    }
    // Additionally filter by selected role (cumulative)
    if (selectedRole) {
      const { HERO_ROLES } = require('@/app/components/heroRoles');
      filteredHeroes = filteredHeroes.filter(
        (h: any) => HERO_ROLES[h.hero_name?.toLowerCase()] === selectedRole
      );
    }

    if (filteredHeroes.length === 0) {
      return { kda: 0, kills: 0, deaths: 0, assists: 0, matches: 0, wins: 0, mvp: 0, svp: 0, playTimeSeconds: 0 };
    }

    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalMatches = 0;
    let totalWins = 0;
    let totalPlayTime = 0;
    let totalMvp = 0;
    let totalSvp = 0;

    filteredHeroes.forEach((hero: any) => {
      const kills = Number(hero.kills) || 0;
      const deaths = Number(hero.deaths) || 0;
      const assists = Number(hero.assists) || 0;
      const matches = Number(hero.matches) || 0;
      const wins = Number(hero.wins) || 0;
      const playTime = Number(hero.play_time) || 0;
      const mvp = Number(hero.mvp) || 0;
      const svp = Number(hero.svp) || 0;

      totalKills += kills;
      totalDeaths += deaths;
      totalAssists += assists;
      totalMatches += matches;
      totalWins += wins;
      totalPlayTime += playTime;
      totalMvp += mvp;
      totalSvp += svp;
    });

    const avgKills = totalMatches > 0 ? totalKills / totalMatches : 0;
    const avgDeaths = totalMatches > 0 ? totalDeaths / totalMatches : 0;
    const avgAssists = totalMatches > 0 ? totalAssists / totalMatches : 0;
    const kda = avgDeaths > 0 ? (avgKills + avgAssists) / avgDeaths : avgKills + avgAssists;

    return {
      kda: kda,
      kills: avgKills,
      deaths: avgDeaths,
      assists: avgAssists,
      matches: totalMatches,
      wins: totalWins,
      playTimeSeconds: totalPlayTime,
      mvp: totalMvp,
      svp: totalSvp,
    };
  };

  const kdaStats = calculateKDA();
  
  // Format play time from seconds to minutes:seconds
  const formatPlayTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine banner source
  const bannerPath = playerData?.player?.icon?.banner as string | undefined;
  const bannerUrl = apiVersion === "v2" && bannerPath
    ? bannerPath.startsWith("http")
      ? bannerPath
      : `https://marvelrivalsapi.com/rivals${bannerPath}`
    : "/images/banners/default_banner.jpg";

  return (
    <>
      <LoadingScreen isVisible={!playerData} />
      <main className="min-h-screen bg-gray-900 text-white">
        {/* Banner section with background image and divider overlay */}
        <div className="relative overflow-hidden" style={{ minHeight: '350px' }}>
          {/* Banner image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          >
            {/* Fallback color if image fails to load */}
            <div className="absolute inset-0 bg-green-900" style={{ zIndex: -1 }}></div>
          </div>
          
          {/* Banner content */}
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-16 sm:py-20 relative z-10">
            {/* Banner content will go here */}
          </div>

          {/* Divider SVG overlay at bottom of banner */}
          <div className="absolute bottom-0 left-0 w-full" style={{ height: '280px', marginBottom: '-1px' }}>
            <svg
              className="absolute bottom-0 left-0 w-full h-full"
              viewBox="0 0 1200 280"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: 'block' }}
            >
              {/* Fill the area below the divider with page background color */}
              <path
                d="M0,120 L400,20 L380,70 L1200,10 L1200,280 L0,280 Z"
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

          {/* Player info at bottom of banner */}
          <div className="absolute bottom-0 right-0 p-6 z-20">
            <div className="text-right flex flex-col items-end gap-3">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-white break-all">{displayName}</h1>
                {iconUrl && (
                  <img
                    src={iconUrl}
                    alt={`${displayName} player icon`}
                    className="h-16 w-16 object-contain"
                    loading="lazy"
                  />
                )}
              </div>
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

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-12 pt-6">
        {loading && <p className="text-sm text-gray-300">Loading player data...</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}

        {!loading && !error && playerData && (
          <>
            {/* KDA Display */}
            <div className="mb-6 p-6 bg-gray-800 border border-gray-700 rounded-md relative">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="text-center">
                  <h3 className="text-sm text-gray-400 mb-1">KDA Ratio</h3>
                  <p className="text-4xl font-bold text-cyan-400">
                    {kdaStats.kda.toFixed(2)}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gray-600"></div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-400 mb-1">Average K/D/A</h3>
                  <p className="text-2xl font-semibold text-white">
                    {kdaStats.kills.toFixed(1)} / {kdaStats.deaths.toFixed(1)} / {kdaStats.assists.toFixed(1)}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gray-600"></div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-400 mb-1">Wins / Matches</h3>
                  <p className="text-2xl font-semibold text-white">
                    {kdaStats.wins} / {kdaStats.matches}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gray-600"></div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-400 mb-1">MVP : SVP</h3>
                  <p className="text-2xl font-semibold text-white">
                    {kdaStats.mvp} : {kdaStats.svp}
                  </p>
                </div>
                <div className="hidden sm:block w-px h-12 bg-gray-600"></div>
                <div className="text-center">
                  <h3 className="text-sm text-gray-400 mb-1">Play Time</h3>
                  <p className="text-2xl font-semibold text-white">
                    {formatPlayTime(kdaStats.playTimeSeconds)}
                  </p>
                </div>
              </div>
              {(selectedRole || selectedHero) && (
                <div className="absolute top-4 right-4">
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-gray-400 flex flex-wrap items-center gap-2">
                      <span>Filtered by:</span>
                      {selectedRole && (
                        <span className="text-purple-400 font-medium">Role: {selectedRole}</span>
                      )}
                      {selectedHero && (
                        <span className="text-purple-400 font-medium">Hero: {selectedHero}</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedHero(null);
                        setSelectedRole(null);
                      }}
                      className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-cyan-400 hover:text-cyan-300 rounded border border-gray-600 hover:border-cyan-500 transition-all"
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-[260px]">
                <HeroRolePieChart
                  heroes={heroes}
                  selectedRole={selectedRole}
                  onSelectRole={(role) => {
                    // Set role; if selected hero doesn't match new role, clear hero filter
                    setSelectedRole(role);
                    if (role && selectedHero) {
                      const { HERO_ROLES } = require('@/app/components/heroRoles');
                      const heroRole = HERO_ROLES[selectedHero.toLowerCase()];
                      if (heroRole && heroRole !== role) {
                        setSelectedHero(null);
                      }
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-[260px]">
                <HeroPlayedPieChart
                  heroes={heroes}
                  filterRole={selectedRole}
                  selectedHero={selectedHero}
                  onSelectHero={(hero) => {
                    // Do not clear role selection; filters are cumulative
                    setSelectedHero(hero);
                  }}
                />
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

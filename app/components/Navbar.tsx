"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) return;
    router.push(`/player/${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="w-full border-b border-gray-800 bg-black/70 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <button
          onClick={() => router.push("/")}
          className="text-lg font-semibold tracking-wide text-cyan-300 hover:text-cyan-200 transition-colors"
        >
          Marvel Rivals Trainer
        </button>

        <div className="ml-auto w-full max-w-sm">
          <form className="flex items-center gap-2" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Jump to player"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              type="submit"
              className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition-colors border border-cyan-400"
            >
              Go
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

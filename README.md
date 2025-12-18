# Marvel Rivals Dashboard

A modern web dashboard for tracking and analyzing **Marvel Rivals** player statistics. This application allows you to search for players, view their ranked and unranked hero statistics, analyze hero roles, and track match history.

## Features

- 🎮 **Player Search**: Look up any Marvel Rivals player by username
- 📊 **Hero Statistics**: View detailed stats for each hero played (ranked and unranked)
- 🎯 **Role Analysis**: Visualize hero distribution by role (Vanguard, Duelist, Strategist)
- 📈 **Hero Popularity**: See which heroes you play most with interactive charts
- 🔄 **Live Updates**: Refresh player statistics with rate limiting (30-minute cooldown)
- ⚡ **Smart Caching**: Session-based caching for faster subsequent loads
- 🎨 **Modern UI**: Built with Tailwind CSS and React with smooth animations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **API**: marvelrivalsapi npm package

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.17 or later
- **npm** or **yarn** package manager
- An API key from https://marvelrivalsapi.com/

## Installation

1. **Clone the repository** (or extract the project files):
   ```bash
   cd marvel-rivals-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and replace the placeholder with your actual API key:
     ```dotenv
     MARVEL_RIVALS_API_KEY=your_actual_api_key_here
     ```

## Local Development

### Running the Development Server

Start the development server with:

```bash
npm run dev
```

The application will be available at http://localhost:3000

#### Network Access

To access the dev server from other machines on your network, the dev script already binds to `0.0.0.0`. Access it using your machine's IP address or hostname (e.g., `http://<your-ip>:3000`).

For local-only development:

```bash
npm run dev:local
```

### Hot Module Replacement (HMR)

HMR is enabled by default for fast development refresh. WSL/Docker users are covered by polling-based file watching.

## Usage

1. **Search for a player** on the home page
2. **View statistics** for ranked/unranked heroes
3. **Filter by role** and explore charts
4. **Toggle Ranked/Unranked** view
5. **Update Player** to refresh data (cooldown applies)

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── page.tsx                 # Home page with player search
├── player/
│   └── [player]/
│       └── page.tsx         # Player stats page
├── api/
│   └── player/
│       ├── [player]/
│       │   ├── route.ts     # Get player stats
│       │   ├── match-history/route.ts
│       │   └── update/route.ts
│       └── heroes/route.js
├── components/
│   ├── HeroRolePieChart.tsx
│   ├── HeroPlayedPieChart.tsx
│   ├── LoadingScreen.tsx
│   ├── Navbar.tsx
│   ├── PieChart.tsx
│   └── pieChartUtils.ts
└── globals.css
```

## Environment Variables

```dotenv
MARVEL_RIVALS_API_KEY=your_api_key_here
# OPTIONAL: HMR/network tweaks
# NEXT_PUBLIC_VERCEL_URL=localhost:3000
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=1
```

## API Endpoints

- GET `/api/player/[username]` — Fetch player statistics
- POST `/api/player/[username]/update` — Force refresh
- GET `/api/player/heroes` — List heroes

## Roadmap

- Match history visualization
- Team comparison
- Leaderboards
- Export as image/PDF

## License

This project is provided as-is for personal use.

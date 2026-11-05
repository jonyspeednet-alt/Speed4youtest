# Speed4You Portal — React Edition

Speed4You is an entertainment streaming platform and catalog portal built for streaming movies, TV series, live TV channels, and managing media libraries with rich metadata, personal watchlists, watch progress tracking, and an administrative control center.

## Stack & Architecture

- **Framework**: React 18 / 19 SPA
- **Bundler & Dev Server**: Vite (listening on port 3000, host `0.0.0.0`)
- **Routing**: React Router 6/7 with lazy loading and route error boundaries
- **Server State & Caching**: TanStack React Query
- **Styling**: Speed4You Dark UI Design System with responsive grid, glassmorphism surfaces, and brand orange accents
- **Data Layer**: In-memory and browser localStorage persistence store with graceful API fallback for offline or standalone operation

## Features

- **Hero Carousel & Spotlight Band**: Auto-rotating featured media with backdrop artwork, rating badges, genre tags, and quick-play actions
- **Browsing & Discovery**: Dedicated Movies, TV Series, Bangla Cinema, Hindi Hits, and Hollywood rails
- **Media Detail Pages**: Comprehensive title details, synopsis, duration, cast, director, and season/episode selector
- **Video Player**: Seamless video streaming player with playback controls, progress synchronization, and issue reporting
- **Live TV**: Stream channels across Sports, Movies, News, and Documentary categories
- **Watchlist & Progress**: Personalized watchlist and "Continue Watching" rail synced with local storage
- **Search**: Real-time search with instant suggestions, query history, and trending queries
- **Admin Control Center**:
  - Catalog dashboard and statistics
  - Content library with CRUD operations (Add, Edit, Delete, Publish, Unpublish)
  - Media scanner simulator and health monitor
  - Duplicate detection and catalog maintenance
  - User management and search analytics

## Development

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build
```

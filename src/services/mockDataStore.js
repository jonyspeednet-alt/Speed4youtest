// Comprehensive mock database and fallback request router for Speed4You Portal
// Ensures 100% self-sufficient operation in standalone / Vite environment

import { readStorage, writeStorage } from '../utils/storage';

const INITIAL_MOVIES = [
  {
    id: 1001,
    slug: 'the-journey-begins',
    title: 'The Journey Begins',
    type: 'movie',
    status: 'published',
    genre: 'Action',
    year: 2024,
    language: 'English',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&auto=format&fit=crop&q=80',
    rating: 8.4,
    duration: 142,
    description: 'An epic adventure film following a rogue commander on an expedition beyond the frontier of human exploration.',
    featured: true,
    featuredOrder: 1,
    trendingScore: 98,
    viewCount: 14200,
    quality: '4K HDR',
    releasedAt: '2024-03-15T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon',
  },
  {
    id: 1002,
    slug: 'heart-of-gold',
    title: 'Heart of Gold',
    type: 'movie',
    status: 'published',
    genre: 'Drama',
    year: 2023,
    language: 'English',
    poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1400&auto=format&fit=crop&q=80',
    rating: 8.1,
    duration: 128,
    description: 'A touching story about love, loss, and resilience across three generations in post-war Europe.',
    featured: true,
    featuredOrder: 2,
    trendingScore: 89,
    viewCount: 9800,
    quality: '1080p',
    releasedAt: '2023-11-10T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    director: 'Sam Mendes',
    cast: 'Olivia Colman, Colin Firth, Toby Jones',
  },
  {
    id: 1003,
    slug: 'laugh-track',
    title: 'Laugh Track',
    type: 'movie',
    status: 'published',
    genre: 'Comedy',
    year: 2024,
    language: 'English',
    poster: 'https://images.unsplash.com/photo-1495997622626-f1fbb8e068aa?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1495997622626-f1fbb8e068aa?w=1400&auto=format&fit=crop&q=80',
    rating: 7.3,
    duration: 95,
    description: 'A hilarious take on sitcom writers accidentally becoming the stars of their own unscripted mayhem.',
    featured: false,
    trendingScore: 78,
    viewCount: 6500,
    quality: '1080p',
    releasedAt: '2024-01-20T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 1004,
    slug: 'midnight-terror',
    title: 'Midnight Terror',
    type: 'movie',
    status: 'published',
    genre: 'Horror',
    year: 2024,
    language: 'English',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&auto=format&fit=crop&q=80',
    rating: 7.6,
    duration: 105,
    description: 'A secluded research team uncovers an ancient frequency that wakes an entity beneath the permafrost.',
    featured: false,
    trendingScore: 82,
    viewCount: 11200,
    quality: '4K',
    releasedAt: '2024-02-14T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 1005,
    slug: 'hawa-2022',
    title: 'Hawa (হাওয়া)',
    type: 'movie',
    status: 'published',
    genre: 'Thriller',
    year: 2022,
    language: 'Bengali',
    poster: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1400&auto=format&fit=crop&q=80',
    rating: 8.8,
    duration: 131,
    description: 'A group of fishermen in the deep Bay of Bengal catch an enigmatic young woman in their net, sparking mystery and superstition.',
    featured: true,
    featuredOrder: 3,
    trendingScore: 96,
    viewCount: 28400,
    quality: '1080p FHD',
    releasedAt: '2022-07-29T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    director: 'Mejbaur Rahman Sumon',
    cast: 'Chanchal Chowdhury, Nazifa Tushi, Sariful Razz',
  },
  {
    id: 1006,
    slug: 'surongo-2023',
    title: 'Surongo (সুড়ঙ্গ)',
    type: 'movie',
    status: 'published',
    genre: 'Crime',
    year: 2023,
    language: 'Bengali',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80',
    rating: 8.3,
    duration: 150,
    description: 'Driven by greed and desperation, an electrician constructs a daring tunnel into a bank vault.',
    featured: false,
    trendingScore: 91,
    viewCount: 22100,
    quality: '1080p',
    releasedAt: '2023-06-29T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    director: 'Raihan Rafi',
    cast: 'Afran Nisho, Toma Mirza, Mostafa Monwar',
  },
  {
    id: 1007,
    slug: 'jawan-2023',
    title: 'Jawan',
    type: 'movie',
    status: 'published',
    genre: 'Action',
    year: 2023,
    language: 'Hindi',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&auto=format&fit=crop&q=80',
    rating: 7.9,
    duration: 169,
    description: 'A high-octane action thriller highlighting one man’s emotional journey to rectify wrongs in society.',
    featured: true,
    featuredOrder: 4,
    trendingScore: 94,
    viewCount: 35000,
    quality: '4K HDR',
    releasedAt: '2023-09-07T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    director: 'Atlee',
    cast: 'Shah Rukh Khan, Nayanthara, Vijay Sethupathi',
  },
  {
    id: 1008,
    slug: '12th-fail-2023',
    title: '12th Fail',
    type: 'movie',
    status: 'published',
    genre: 'Biography',
    year: 2023,
    language: 'Hindi',
    poster: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&auto=format&fit=crop&q=80',
    rating: 9.1,
    duration: 147,
    description: 'Based on the inspiring real-life journey of Manoj Kumar Sharma who overcame poverty to become an IPS officer.',
    featured: false,
    trendingScore: 97,
    viewCount: 41200,
    quality: '1080p',
    releasedAt: '2023-10-27T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    director: 'Vidhu Vinod Chopra',
    cast: 'Vikrant Massey, Medha Shankr, Anant V Joshi',
  },
  {
    id: 1009,
    slug: 'interstellar-2014',
    title: 'Interstellar',
    type: 'movie',
    status: 'published',
    genre: 'Sci-Fi',
    year: 2014,
    language: 'English',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80',
    rating: 8.7,
    duration: 169,
    description: 'When Earth becomes uninhabitable, a team of ex-NASA astronauts travels through a wormhole in search of a new home.',
    featured: false,
    trendingScore: 92,
    viewCount: 38000,
    quality: '4K Ultra HD',
    releasedAt: '2014-11-07T00:00:00Z',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
];

const INITIAL_SERIES = [
  {
    id: 2001,
    slug: 'tech-titans',
    title: 'Tech Titans',
    type: 'series',
    status: 'published',
    genre: 'Thriller',
    year: 2024,
    language: 'English',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=80',
    rating: 8.6,
    description: 'Follow the ruthless rise and boardroom espionage of ambitious tech entrepreneurs in Silicon Valley.',
    featured: true,
    featuredOrder: 5,
    trendingScore: 98,
    viewCount: 19500,
    quality: '4K',
    releasedAt: '2024-01-15T00:00:00Z',
    seasons: [
      {
        id: 1,
        number: 1,
        title: 'Season 1: Genesis',
        episodes: Array.from({ length: 8 }, (_, i) => ({
          id: 200101 + i,
          number: i + 1,
          title: `S01E0${i + 1} — ${['The Seed Round', 'Algorithmic Drift', 'Term Sheets', 'Dark Mode', 'Zero Day', 'Pivot', 'Acquisition', 'The IPO'][i]}`,
          duration: 48 + (i % 5),
          overview: 'The founding team battles investor demands and internal leaks.',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        })),
      },
      {
        id: 2,
        number: 2,
        title: 'Season 2: Scale',
        episodes: Array.from({ length: 8 }, (_, i) => ({
          id: 200111 + i,
          number: i + 1,
          title: `S02E0${i + 1} — ${['Hostile Takeover', 'Quantum Leap', 'Data Sovereignty', 'Whistleblower', 'The Board Vote', 'Antitrust', 'Deepfake', 'New Horizon'][i]}`,
          duration: 50 + (i % 4),
          overview: 'Global expansion triggers geopolitical fallout and federal scrutiny.',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        })),
      },
    ],
  },
  {
    id: 2002,
    slug: 'mystery-island',
    title: 'Mystery Island',
    type: 'series',
    status: 'published',
    genre: 'Adventure',
    year: 2023,
    language: 'English',
    poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&auto=format&fit=crop&q=80',
    rating: 8.3,
    description: 'A team of oceanographers discovers an unmapped archipelago hiding secrets of a lost civilization.',
    featured: false,
    trendingScore: 86,
    viewCount: 14300,
    quality: '1080p',
    releasedAt: '2023-08-12T00:00:00Z',
    seasons: [
      {
        id: 1,
        number: 1,
        title: 'Season 1',
        episodes: Array.from({ length: 6 }, (_, i) => ({
          id: 200201 + i,
          number: i + 1,
          title: `Episode ${i + 1}: Expedition Day ${i * 4 + 1}`,
          duration: 44,
          overview: 'Strange magnetic anomalies disrupt instruments as the crew heads inland.',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        })),
      },
    ],
  },
  {
    id: 2003,
    slug: 'karagar-2022',
    title: 'Karagar (কারাগার)',
    type: 'series',
    status: 'published',
    genre: 'Mystery',
    year: 2022,
    language: 'Bengali',
    poster: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1400&auto=format&fit=crop&q=80',
    rating: 9.0,
    description: 'In cell number 50 of Akashnagar Central Jail, closed for 50 years, a mysterious prisoner appears out of thin air claiming to be 250 years old.',
    featured: true,
    featuredOrder: 6,
    trendingScore: 99,
    viewCount: 52000,
    quality: '1080p FHD',
    releasedAt: '2022-08-19T00:00:00Z',
    seasons: [
      {
        id: 1,
        number: 1,
        title: 'Part 1',
        episodes: Array.from({ length: 7 }, (_, i) => ({
          id: 200301 + i,
          number: i + 1,
          title: `Karagar Part 1 Episode ${i + 1}`,
          duration: 35 + i * 2,
          overview: 'The jailer confronts the unknown inmate whose knowledge spans centuries.',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        })),
      },
      {
        id: 2,
        number: 2,
        title: 'Part 2',
        episodes: Array.from({ length: 8 }, (_, i) => ({
          id: 200311 + i,
          number: i + 1,
          title: `Karagar Part 2 Episode ${i + 1}`,
          duration: 38 + i,
          overview: 'The truth behind the Mir Jafar lineage and secret revolution begins to unravel.',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        })),
      },
    ],
  },
  {
    id: 2004,
    slug: 'sacred-games',
    title: 'Sacred Games',
    type: 'series',
    status: 'published',
    genre: 'Crime',
    year: 2019,
    language: 'Hindi',
    poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1400&auto=format&fit=crop&q=80',
    rating: 8.5,
    description: 'A troubled police officer receives an anonymous tip about a gangster mastermind with 25 days to save Mumbai from catastrophe.',
    featured: false,
    trendingScore: 91,
    viewCount: 31000,
    quality: '4K',
    releasedAt: '2018-07-06T00:00:00Z',
    seasons: [
      {
        id: 1,
        number: 1,
        title: 'Season 1',
        episodes: Array.from({ length: 8 }, (_, i) => ({
          id: 200401 + i,
          number: i + 1,
          title: `Episode ${i + 1} — ${['Ashwathama', 'Halahala', 'Atapi Vatapi', 'Brahmahatya', 'Sarama', 'Pretakalpa', 'Rudra', 'Yayati'][i]}`,
          duration: 52,
          overview: 'Inspector Sartaj Singh races against the clock in the underworld.',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        })),
      },
    ],
  },
];

export const MOCK_CHANNELS = [
  { id: 'ch1', name: 'Speed4You Sports HD', category: 'Sports', logo: '⚽', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', quality: '1080p 60fps' },
  { id: 'ch2', name: 'Speed4You Movies HD', category: 'Movies', logo: '🎬', streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p' },
  { id: 'ch3', name: 'Speed4You News 24/7', category: 'News', logo: '📰', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', quality: '720p' },
  { id: 'ch4', name: 'Discovery Nature World', category: 'Documentary', logo: '🌍', streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', quality: '1080p' },
  { id: 'ch5', name: 'BTV National HD', category: 'National', logo: '📺', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', quality: '1080p' },
  { id: 'ch6', name: 'HBO Premier Cinema', category: 'Movies', logo: '🍿', streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '4K' },
];

class MockStore {
  constructor() {
    this.initStore();
  }

  initStore() {
    const saved = readStorage('s4y_catalog');
    if (saved && Array.isArray(saved) && saved.length > 0) {
      this.items = saved;
    } else {
      this.items = [...INITIAL_MOVIES, ...INITIAL_SERIES];
      this.saveCatalog();
    }

    if (!readStorage('s4y_watchlist')) {
      writeStorage('s4y_watchlist', [1001, 1005, 2003]);
    }
    if (!readStorage('s4y_progress')) {
      writeStorage('s4y_progress', {
        'movie:1001': { contentType: 'movie', contentId: 1001, position: 2450, duration: 8520, updatedAt: Date.now() - 3600000 },
        'series:2003': { contentType: 'series', contentId: 2003, seasonId: 1, episodeId: 200301, position: 1200, duration: 2200, updatedAt: Date.now() - 7200000 },
      });
    }
  }

  saveCatalog() {
    writeStorage('s4y_catalog', this.items);
  }

  toCard(item) {
    if (!item) return null;
    return {
      id: item.id,
      slug: item.slug || String(item.id),
      title: item.title,
      type: item.type,
      year: item.year,
      genre: item.genre,
      poster: item.poster,
      backdrop: item.backdrop,
      rating: item.rating,
      description: item.description,
      duration: item.duration,
      seasonsCount: item.seasons?.length || 0,
      quality: item.quality || 'HD',
      language: item.language,
      isNew: item.year >= 2024,
      releasedAt: item.releasedAt || `${item.year}-01-01T00:00:00Z`,
      trendingScore: item.trendingScore || 50,
      viewCount: item.viewCount || 100,
    };
  }

  getPublished() {
    return this.items.filter(i => i.status === 'published');
  }

  getHomepage(limit = 10) {
    const published = this.getPublished();
    const sortedLatest = [...published].sort((a, b) => (b.year || 0) - (a.year || 0) || b.id - a.id);
    const sortedTrending = [...published].sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
    const sortedPopular = [...published].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    const sortedRating = [...published].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const featured = published.filter(i => i.featured).map(this.toCard);
    const latest = sortedLatest.slice(0, limit).map(this.toCard);
    const popular = sortedPopular.slice(0, limit).map(this.toCard);
    const trending = sortedTrending.slice(0, limit).map(this.toCard);
    const movies = published.filter(i => i.type === 'movie').slice(0, limit).map(this.toCard);
    const series = published.filter(i => i.type === 'series').slice(0, limit).map(this.toCard);
    const banglaCinema = published.filter(i => i.language === 'Bengali').slice(0, limit).map(this.toCard);
    const hindiHits = published.filter(i => i.language === 'Hindi').slice(0, limit).map(this.toCard);
    const hollywood = published.filter(i => i.language === 'English').slice(0, limit).map(this.toCard);
    const actionMovies = published.filter(i => (i.genre || '').toLowerCase().includes('action')).slice(0, limit).map(this.toCard);
    const topRated = sortedRating.slice(0, limit).map(this.toCard);

    return {
      featured: featured.length ? featured : latest.slice(0, 4),
      latest,
      popular,
      trending,
      movies,
      series,
      banglaCinema,
      hindiHits,
      hollywood,
      actionMovies,
      topRated,
    };
  }

  browse(params = {}) {
    let result = this.getPublished();
    const type = params.type;
    const genre = params.genre;
    const language = params.language;
    const year = params.year;
    const q = params.q || params.search;
    const sort = params.sort || 'latest';
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 24);

    if (type && type !== 'all') {
      result = result.filter(i => i.type === type);
    }
    if (genre && genre !== 'All') {
      result = result.filter(i => (i.genre || '').toLowerCase().includes(genre.toLowerCase()));
    }
    if (language && language !== 'All') {
      result = result.filter(i => (i.language || '').toLowerCase() === language.toLowerCase());
    }
    if (year && year !== 'All') {
      result = result.filter(i => String(i.year) === String(year));
    }
    if (q) {
      const query = q.toLowerCase();
      result = result.filter(i => 
        (i.title || '').toLowerCase().includes(query) ||
        (i.description || '').toLowerCase().includes(query) ||
        (i.genre || '').toLowerCase().includes(query) ||
        (i.cast || '').toLowerCase().includes(query)
      );
    }

    if (sort === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'popular') {
      result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sort === 'trending') {
      result.sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0));
    } else if (sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => (b.year || 0) - (a.year || 0) || b.id - a.id);
    }

    const total = result.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const items = result.slice(startIndex, startIndex + limit).map(this.toCard);
    const nextPage = page < totalPages ? page + 1 : undefined;

    return {
      items,
      total,
      page,
      totalPages,
      nextPage,
    };
  }

  getItemByIdOrSlug(type, idOrSlug) {
    return this.items.find(i => 
      (!type || i.type === type) &&
      (String(i.id) === String(idOrSlug) || i.slug === String(idOrSlug))
    );
  }

  getWatchlist() {
    const list = readStorage('s4y_watchlist') || [];
    const items = this.items.filter(i => list.includes(i.id)).map(this.toCard);
    return { items, total: items.length };
  }

  addToWatchlist(contentType, contentId) {
    const id = Number(contentId);
    let list = readStorage('s4y_watchlist') || [];
    if (!list.includes(id)) {
      list.push(id);
      writeStorage('s4y_watchlist', list);
    }
    return { ok: true, inWatchlist: true };
  }

  removeFromWatchlist(contentId) {
    const id = Number(contentId);
    let list = readStorage('s4y_watchlist') || [];
    list = list.filter(item => item !== id);
    writeStorage('s4y_watchlist', list);
    return { ok: true, inWatchlist: false };
  }

  checkWatchlist(contentType, contentId) {
    const id = Number(contentId);
    const list = readStorage('s4y_watchlist') || [];
    return { inWatchlist: list.includes(id) };
  }

  getProgress() {
    const progressMap = readStorage('s4y_progress') || {};
    return Object.values(progressMap);
  }

  getContinueWatching() {
    const progressMap = readStorage('s4y_progress') || {};
    const list = Object.values(progressMap)
      .filter(p => p.position > 10 && (p.duration ? p.position < p.duration * 0.95 : true))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    return list.map(p => {
      const item = this.items.find(i => i.id === Number(p.contentId));
      return {
        ...p,
        item: item ? this.toCard(item) : null,
      };
    }).filter(p => p.item !== null);
  }

  updateProgress(contentType, contentId, position, duration) {
    const progressMap = readStorage('s4y_progress') || {};
    const key = `${contentType}:${contentId}`;
    progressMap[key] = {
      contentType,
      contentId: Number(contentId),
      position: Number(position),
      duration: Number(duration),
      updatedAt: Date.now(),
    };
    writeStorage('s4y_progress', progressMap);
    return { ok: true };
  }

  trackView(contentId, amount = 1) {
    const item = this.items.find(i => String(i.id) === String(contentId));
    if (item) {
      item.viewCount = (item.viewCount || 0) + Number(amount);
      item.trendingScore = Math.min(100, (item.trendingScore || 50) + 1);
      this.saveCatalog();
    }
    return { ok: true };
  }

  // Admin capabilities
  getAdminStats() {
    const total = this.items.length;
    const movies = this.items.filter(i => i.type === 'movie').length;
    const series = this.items.filter(i => i.type === 'series').length;
    const drafts = this.items.filter(i => i.status === 'draft').length;
    const published = this.items.filter(i => i.status === 'published').length;

    return {
      total,
      movies,
      series,
      drafts,
      published,
      storageUsed: '48.2 GB',
      activeUsers: 1420 + Math.floor(Math.random() * 50),
      scannerStatus: 'idle',
      lastScanAt: '2026-11-04T18:00:00Z',
    };
  }

  createContent(data) {
    const id = Date.now();
    const newItem = {
      id,
      slug: (data.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: 'published',
      viewCount: 1,
      trendingScore: 50,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.items.unshift(newItem);
    this.saveCatalog();
    return newItem;
  }

  updateContent(id, data) {
    const idx = this.items.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) {
      this.items[idx] = { ...this.items[idx], ...data, updatedAt: new Date().toISOString() };
      this.saveCatalog();
      return this.items[idx];
    }
    return null;
  }

  deleteContent(id) {
    this.items = this.items.filter(i => String(i.id) !== String(id));
    this.saveCatalog();
    return { ok: true };
  }
}

export const mockStore = new MockStore();

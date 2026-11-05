import { readStorage, writeStorage, removeStorage } from '../utils/storage';
import { mockStore, MOCK_CHANNELS } from './mockDataStore';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

class ApiError extends Error {
  constructor(message, { status = 500, code = 'REQUEST_FAILED', details = null, requestId = '' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

function parseApiErrorPayload(rawText, status) {
  if (!rawText) {
    return {
      message: `Request failed (${status})`,
      code: 'REQUEST_FAILED',
      details: null,
      requestId: '',
    };
  }

  try {
    const parsed = JSON.parse(rawText);
    if (parsed?.error && typeof parsed.error === 'object') {
      return {
        message: parsed.error.message || `Request failed (${status})`,
        code: parsed.error.code || 'REQUEST_FAILED',
        details: parsed.error.details || null,
        requestId: parsed.requestId || '',
      };
    }

    return {
      message: parsed?.error || parsed?.message || `Request failed (${status})`,
      code: 'REQUEST_FAILED',
      details: null,
      requestId: '',
    };
  } catch {
    return {
      message: rawText || `Request failed (${status})`,
      code: 'REQUEST_FAILED',
      details: null,
      requestId: '',
    };
  }
}

function clearStoredSession() {
  removeStorage('token');
  removeStorage('user');
}

function redirectToLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  const appBasePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const pathname = window.location.pathname;
  const routePath = appBasePath && pathname.startsWith(appBasePath)
    ? pathname.slice(appBasePath.length) || '/'
    : pathname;
  const nextPath = `${routePath}${window.location.search}${window.location.hash}`;
  const loginPath = `${appBasePath}/login`.replace(/\/{2,}/g, '/');
  const loginUrl = new URL(loginPath, window.location.origin);
  if (nextPath && nextPath !== '/login') {
    loginUrl.searchParams.set('next', nextPath);
  }
  window.location.replace(loginUrl.toString());
}

function dispatchMock(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const url = new URL(`http://local${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`);
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  const params = Object.fromEntries(searchParams.entries());

  let body = {};
  if (options.body) {
    try {
      body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    } catch {
      body = {};
    }
  }

  // Auth endpoints
  if (pathname === '/auth/admin-login' || pathname === '/auth/login') {
    const user = { username: body.username || 'admin', role: 'admin' };
    writeStorage('token', 's4y-demo-token');
    writeStorage('user', user);
    return { token: 's4y-demo-token', user };
  }
  if (pathname === '/auth/verify' || pathname === '/auth/refresh') {
    return { ok: true, user: readStorage('user') || { username: 'admin', role: 'admin' } };
  }
  if (pathname === '/auth/logout') {
    removeStorage('token');
    removeStorage('user');
    return { ok: true };
  }

  // Content endpoints
  if (pathname === '/content/homepage') {
    return mockStore.getHomepage(Number(params.limit || 10));
  }
  if (pathname === '/content/browse') {
    return mockStore.browse(params);
  }
  if (pathname === '/content/featured') {
    return mockStore.getPublished().filter(i => i.featured).map(item => mockStore.toCard(item));
  }
  if (pathname === '/content/latest') {
    return mockStore.getPublished().slice(0, Number(params.limit || 10)).map(item => mockStore.toCard(item));
  }
  if (pathname === '/content/popular') {
    return mockStore.getPublished().slice(0, Number(params.limit || 10)).map(item => mockStore.toCard(item));
  }
  if (pathname === '/content/trending') {
    return mockStore.getPublished().slice(0, Number(params.limit || 10)).map(item => mockStore.toCard(item));
  }
  if (pathname === '/content/recommendations' || pathname === '/content/local-trending') {
    return mockStore.getPublished().slice(0, Number(params.limit || 10)).map(item => mockStore.toCard(item));
  }
  if (pathname === '/content/online-count') {
    return { count: 1482 + Math.floor(Math.sin(Date.now() / 10000) * 15) };
  }
  const viewCountMatch = pathname.match(/^\/content\/(\d+)\/view$/);
  if (viewCountMatch) {
    return mockStore.trackView(viewCountMatch[1], body.amount || 1);
  }

  // Movies endpoints
  if (pathname === '/movies') {
    return mockStore.browse({ ...params, type: 'movie' });
  }
  const movieMatch = pathname.match(/^\/movies\/(.+)$/);
  if (movieMatch) {
    const idOrSlug = movieMatch[1];
    const movie = mockStore.getItemByIdOrSlug('movie', idOrSlug);
    if (!movie) throw new ApiError('Movie not found', { status: 404 });
    return movie;
  }

  // Series endpoints
  if (pathname === '/series') {
    return mockStore.browse({ ...params, type: 'series' });
  }
  const seriesSeasonsMatch = pathname.match(/^\/series\/(.+)\/seasons$/);
  if (seriesSeasonsMatch) {
    const idOrSlug = seriesSeasonsMatch[1];
    const series = mockStore.getItemByIdOrSlug('series', idOrSlug);
    return series?.seasons || [];
  }
  const seriesEpisodesMatch = pathname.match(/^\/series\/(.+)\/seasons\/(\d+)\/episodes$/);
  if (seriesEpisodesMatch) {
    const idOrSlug = seriesEpisodesMatch[1];
    const seasonId = Number(seriesEpisodesMatch[2]);
    const series = mockStore.getItemByIdOrSlug('series', idOrSlug);
    const season = series?.seasons?.find(s => s.id === seasonId || s.number === seasonId);
    return season?.episodes || [];
  }
  const seriesMatch = pathname.match(/^\/series\/(.+)$/);
  if (seriesMatch) {
    const idOrSlug = seriesMatch[1];
    const series = mockStore.getItemByIdOrSlug('series', idOrSlug);
    if (!series) throw new ApiError('Series not found', { status: 404 });
    return series;
  }

  // Player streams
  const playerMatch = pathname.match(/^\/player\/(movie|series)\/(.+)$/);
  if (playerMatch) {
    const [, type, id] = playerMatch;
    const item = mockStore.getItemByIdOrSlug(type, id);
    return {
      streamUrl: item?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      title: item?.title || 'Video Stream',
      quality: item?.quality || '1080p',
      item: item ? mockStore.toCard(item) : null,
    };
  }

  // Watchlist
  if (pathname === '/watchlist') {
    if (method === 'POST') {
      return mockStore.addToWatchlist(body.contentType, body.contentId);
    }
    return mockStore.getWatchlist();
  }
  const watchlistRemoveMatch = pathname.match(/^\/watchlist\/(.+)$/);
  if (watchlistRemoveMatch && method === 'DELETE') {
    return mockStore.removeFromWatchlist(watchlistRemoveMatch[1]);
  }
  if (pathname === '/watchlist/check') {
    return mockStore.checkWatchlist(params.contentType, params.contentId);
  }

  // Progress & Continue watching
  if (pathname === '/progress') {
    if (method === 'POST') {
      return mockStore.updateProgress(body.contentType, body.contentId, body.position, body.duration);
    }
    return mockStore.getProgress();
  }
  if (pathname === '/progress/continue-watching') {
    return mockStore.getContinueWatching();
  }
  if (pathname.startsWith('/progress/')) {
    const parts = pathname.split('/');
    const [, , pType, pId] = parts;
    const key = `${pType}:${pId}`;
    const all = readStorage('s4y_progress') || {};
    return all[key] || null;
  }

  // Search
  if (pathname === '/search') {
    return mockStore.browse({ ...params, q: params.q || params.query });
  }
  if (pathname === '/search/suggestions') {
    const q = (params.q || '').toLowerCase();
    const suggestions = mockStore.getPublished()
      .filter(i => (i.title || '').toLowerCase().includes(q))
      .slice(0, 5)
      .map(i => ({ id: i.id, title: i.title, type: i.type }));
    return suggestions;
  }
  if (pathname === '/search/recent') {
    return ['Hawa', 'Karagar', 'Interstellar', 'Tech Titans'];
  }
  if (pathname === '/search/trending') {
    return ['Oppenheimer', '12th Fail', 'Surongo', 'Jawan', 'Mystery Island'];
  }

  // TV
  if (pathname === '/tv/channels') {
    return MOCK_CHANNELS;
  }

  // Admin routes
  if (pathname === '/admin/dashboard' || pathname === '/admin/stats') {
    return mockStore.getAdminStats();
  }
  if (pathname === '/admin/content' || pathname === '/admin/movies' || pathname === '/admin/series') {
    if (method === 'POST') {
      return mockStore.createContent(body);
    }
    return mockStore.browse(params);
  }
  const adminContentDetail = pathname.match(/^\/admin\/content\/(\d+)$/);
  if (adminContentDetail) {
    const id = adminContentDetail[1];
    if (method === 'PUT') return mockStore.updateContent(id, body);
    if (method === 'DELETE') return mockStore.deleteContent(id);
    return mockStore.getItemByIdOrSlug(null, id);
  }
  if (pathname.includes('/admin/scanner')) {
    return {
      status: 'idle',
      totalRoots: 4,
      healthyRoots: 4,
      brokenRoots: 0,
      roots: [
        { id: 1, label: '/media/movies/english', type: 'movie', exists: true, estimatedCandidates: 450 },
        { id: 2, label: '/media/series/bengali', type: 'series', exists: true, estimatedCandidates: 120 },
        { id: 3, label: '/media/movies/hindi', type: 'movie', exists: true, estimatedCandidates: 380 },
        { id: 4, label: '/media/series/english', type: 'series', exists: true, estimatedCandidates: 210 },
      ],
      recentRuns: [
        { id: 101, startedAt: '2026-11-04T12:00:00Z', status: 'completed', itemsFound: 1160 },
      ],
      currentJob: null,
    };
  }
  if (pathname.includes('/admin/duplicates')) {
    return { duplicates: [], count: 0, items: [] };
  }
  if (pathname === '/admin/users') {
    return [{ id: 1, username: 'admin', role: 'admin', createdAt: '2024-01-01' }];
  }
  if (pathname === '/admin/search-analytics') {
    return { topQueries: [{ query: 'Hawa', count: 412 }, { query: 'Karagar', count: 380 }, { query: 'Action', count: 290 }], totalSearches: 4180 };
  }
  if (pathname.startsWith('/admin/media')) {
    return { jobs: [], backups: [], settings: { autoFix: true } };
  }

  return { ok: true };
}

async function requestApi(endpoint, options = {}) {
  // If no external API base is configured, use the built-in mock store immediately
  if (!API_BASE) {
    try {
      return await dispatchMock(endpoint, options);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err?.message || 'Mock request failed', { status: 500 });
    }
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const token = readStorage('token') || '';

  let guestUserId = '';
  if (!token) {
    guestUserId = readStorage('guest_user_id');
    if (!guestUserId) {
      const randomUuid = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      guestUserId = 'guest:' + randomUuid;
      writeStorage('guest_user_id', guestUserId);
    }
  }

  const method = (options.method || 'GET').toUpperCase();
  const endpointUrl = new URL(`${API_BASE}/api${endpoint}`, window.location.origin);

  // Only add cache-busting timestamp for mutations or when explicitly requested
  if ((method !== 'GET' || options.bustCache === true) && options.bustCache !== false) {
    endpointUrl.searchParams.set('_ts', String(Date.now()));
  }

  const config = {
    cache: options.cache || 'default',
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && !(options.headers || {}).Authorization ? { Authorization: `Bearer ${token}` } : {}),
      ...(!token && guestUserId ? { 'X-User-ID': guestUserId } : {}),
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(endpointUrl.toString(), config);

    if (!response.ok) {
      // If external server returned 404 or 502/503, fallback to mock store
      if (response.status === 404 || response.status >= 500) {
        return dispatchMock(endpoint, options);
      }

      const errorText = await response.text().catch(() => '');
      const parsed = parseApiErrorPayload(errorText, response.status);
      if (response.status === 401) {
        clearStoredSession();
        if (!String(endpoint || '').startsWith('/auth/')) {
          redirectToLogin();
        }
      }
      throw new ApiError(parsed.message, {
        status: response.status,
        code: parsed.code,
        details: parsed.details,
        requestId: parsed.requestId,
      });
    }

    if (response.status === 204) {
      return null;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return text ? { data: text } : null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (networkErr) {
    if (networkErr instanceof ApiError) throw networkErr;
    // Fallback to client mock store if network request fails
    return dispatchMock(endpoint, options);
  }
}

function apiClient(endpoint, options = {}) {
  // Bound public catalog reads, including body download. Never time out
  // scanner jobs, uploads or other mutations using this short deadline.
  const isCatalogRead = (!options.method || options.method.toUpperCase() === 'GET') &&
    /^\/(content|movies|series)(\/|\?|$)/.test(endpoint);
  if (!isCatalogRead) return requestApi(endpoint, options);
  const controller = typeof AbortController === 'function' && !options.signal ? new AbortController() : null;
  let timer;
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new ApiError('The server is taking too long. Please try again.', { status: 408, code: 'TIMEOUT' }));
      if (controller) controller.abort();
    }, 20000);
  });
  return Promise.race([
    requestApi(endpoint, controller ? { ...options, signal: controller.signal } : options),
    deadline,
  ]).finally(() => clearTimeout(timer));
}

export default apiClient;
export { ApiError };

function getAuthHeader() {
  const token = readStorage('token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const moviesService = {
  getAll: (params) => apiClient(`/movies?${new URLSearchParams(params)}`),
  getById: (id) => apiClient(`/movies/${id}`),
};

export const seriesService = {
  getAll: (params) => apiClient(`/series?${new URLSearchParams(params)}`),
  getById: (id) => apiClient(`/series/${id}`),
  getSeasons: (id) => apiClient(`/series/${id}/seasons`),
  getEpisodes: (id, seasonId) => apiClient(`/series/${id}/seasons/${seasonId}/episodes`),
};

export const progressService = {
  get: () => apiClient('/progress', { headers: getAuthHeader(), bustCache: true }),
  update: (contentType, contentId, position, duration) => apiClient('/progress', {
    method: 'POST',
    body: JSON.stringify({ contentType, contentId, position, duration }),
    headers: getAuthHeader(),
  }),
  getFor: (contentType, contentId) => apiClient(`/progress/${contentType}/${contentId}`, {
    headers: getAuthHeader(),
    bustCache: true,
  }),
  markComplete: (contentType, contentId) => apiClient('/progress/complete', {
    method: 'POST',
    body: JSON.stringify({ contentType, contentId }),
    headers: getAuthHeader(),
  }),
  getContinueWatching: () => apiClient('/progress/continue-watching', {
    headers: getAuthHeader(),
    bustCache: true,
  }),
};

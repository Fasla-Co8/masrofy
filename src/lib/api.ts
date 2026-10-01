let currentGetToken: (() => Promise<string | null>) | null = null;
let isDemoSession = false;

export function setAuthTokenProvider(provider: () => Promise<string | null>, isDemo = false) {
  currentGetToken = provider;
  isDemoSession = isDemo;
}

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  
  if (isDemoSession) {
    headers.set('Authorization', 'Bearer demo-session-token');
    headers.set('x-demo-mode', 'true');
  } else if (currentGetToken) {
    try {
      const token = await currentGetToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    } catch (err) {
      console.warn('Could not get auth token:', err);
    }
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errMsg = `Request failed: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      errMsg = errorJson.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return response.json();
}

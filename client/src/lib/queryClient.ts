import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};

  // Add Telegram WebApp authentication headers when available
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const webApp = window.Telegram.WebApp;
    if (webApp.initData) {
      headers['X-Telegram-Init-Data'] = webApp.initData;
    }
    const user = webApp.initDataUnsafe?.user;
    if (user) {
      headers['x-telegram-id'] = String(user.id);
      if (user.first_name) headers['x-telegram-firstname'] = user.first_name;
      if (user.last_name) headers['x-telegram-lastname'] = user.last_name;
      if (user.username) headers['x-telegram-username'] = user.username;
    }
  }

  // Dev fallback: use Vite env var when running in development and no Telegram data
  try {
    // Vite exposes `import.meta.env` in client builds
    const devId = (import.meta as any).env?.VITE_DEV_TELEGRAM_ID;
    const isDev = (import.meta as any).env?.DEV;
    if (!headers['x-telegram-id'] && isDev && devId) {
      headers['x-telegram-id'] = String(devId);
      headers['x-telegram-firstname'] = headers['x-telegram-firstname'] || 'Dev';
    }
  } catch (e) {
    // ignore in non-browser or non-vite environments
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: HeadersInit = {};
    
    // Add Telegram WebApp initData for authentication
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      if (webApp.initData) headers['X-Telegram-Init-Data'] = webApp.initData;
      const user = webApp.initDataUnsafe?.user;
      if (user) {
        headers['x-telegram-id'] = String(user.id);
        if (user.first_name) headers['x-telegram-firstname'] = user.first_name;
        if (user.last_name) headers['x-telegram-lastname'] = user.last_name;
        if (user.username) headers['x-telegram-username'] = user.username;
      }
    }

    // Dev fallback for queries as well
    try {
      const devId = (import.meta as any).env?.VITE_DEV_TELEGRAM_ID;
      const isDev = (import.meta as any).env?.DEV;
      if (!headers['x-telegram-id'] && isDev && devId) {
        headers['x-telegram-id'] = String(devId);
        headers['x-telegram-firstname'] = headers['x-telegram-firstname'] || 'Dev';
      }
    } catch (e) {
      // ignore
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

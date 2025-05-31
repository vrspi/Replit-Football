import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { config } from "../config";

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
  const fullUrl = `${config.apiBaseUrl}${url}`;
  console.log(`API Request: ${method} ${fullUrl}`);
  
  if (data) {
    console.log('Request data:', JSON.stringify(data));
  }
  
  try {
    // Get auth token from localStorage for all requests
    const token = localStorage.getItem('auth_token');
    
    // Prepare headers with authentication if token exists
    const headers: Record<string, string> = {};
    
    if (data) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      console.log('Including auth token in request');
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('No auth token available for request');
    }
    
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`Response status: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      let errorText;
      try {
        const errorData = await res.json();
        console.error('Error response:', errorData);
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await res.text();
      }
      throw new Error(`${res.status}: ${errorText}`);
    }
    
    return res;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get auth token from localStorage for all query requests
    const token = localStorage.getItem('auth_token');
    
    // Prepare request options with authentication token if available
    const requestOptions: RequestInit = {
      credentials: "include",
      headers: {}
    };
    
    // Add auth token if available
    if (token) {
      requestOptions.headers = {
        'Authorization': `Bearer ${token}`
      };
      console.log('Including auth token in React Query request');
    }
    
    const res = await fetch(`${config.apiBaseUrl}${queryKey[0]}` as string, requestOptions);

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

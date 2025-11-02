import { QueryClient } from "@tanstack/react-query";

async function throwError(response: Response) {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    throw new Error(data.message || "An error occurred");
  }
  throw new Error(await response.text());
}

export const defaultFetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    await throwError(response);
  }
  return response.json();
};

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    await throwError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        return defaultFetcher(url);
      },
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

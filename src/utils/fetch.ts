import pino from 'pino';

const logger = pino({ name: 'fetch-wrapper' }, pino.destination({ dest: 2, sync: false }));

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { timeout = 30000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : retryDelay * (attempt + 1);
          logger.warn(`Rate limited. Retrying after ${delay}ms`);
          await sleep(delay);
          continue;
        }

        if (response.status >= 500 && attempt < retries) {
          const delay = retryDelay * (attempt + 1);
          logger.warn(`Server error ${response.status}. Retrying after ${delay}ms`);
          await sleep(delay);
          continue;
        }

        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response,
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.name === 'AbortError') {
        throw new FetchError(`Request timeout after ${timeout}ms`);
      }

      if (attempt < retries) {
        const delay = retryDelay * (attempt + 1);
        logger.warn(`Request failed: ${error}. Retrying after ${delay}ms`);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new FetchError('Unknown error');
}

export async function fetchJSON<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options?.headers,
    },
  });

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new FetchError('Invalid JSON response');
  }
}
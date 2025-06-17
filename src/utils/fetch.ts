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
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchWithRetry(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = 30000, retries = 3, retryDelay = 1000, ...fetchOptions } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      logger.debug(`Making request to: ${url}`);
      logger.debug(`Request options: ${JSON.stringify(fetchOptions)}`);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : retryDelay * (attempt + 1);
          logger.warn(`Rate limited. Retrying after ${String(delay)}ms`);
          await sleep(delay);
          continue;
        }

        if (response.status >= 500 && attempt < retries) {
          const delay = retryDelay * (attempt + 1);
          logger.warn(`Server error ${String(response.status)}. Retrying after ${String(delay)}ms`);
          await sleep(delay);
          continue;
        }

        // Try to get more details from the response for debugging
        let errorDetails = '';
        try {
          const text = await response.text();
          if (text) {
            errorDetails = ` - ${text}`;
          }
        } catch {
          // Ignore if we can't read the body
        }

        throw new FetchError(
          `HTTP ${String(response.status)}: ${response.statusText}${errorDetails}`,
          response.status,
          response,
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error && error.name === 'AbortError') {
        throw new FetchError(`Request timeout after ${String(timeout)}ms`);
      }

      if (attempt < retries) {
        const delay = retryDelay * (attempt + 1);
        logger.warn(`Request failed: ${String(error)}. Retrying after ${String(delay)}ms`);
        await sleep(delay);
        continue;
      }
    }
  }

  throw lastError || new FetchError('Unknown error');
}

export async function fetchJSON<T>(url: string, options?: FetchOptions): Promise<T> {
  const mergedHeaders: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'marvel-rivals-mcp/0.0.5 (https://github.com/AImaginationLab/marvel-rivals-mcp)',
  };

  if (options?.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        mergedHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        mergedHeaders[key] = value;
      });
    } else {
      Object.assign(mergedHeaders, options.headers);
    }
  }

  const fetchOptions: FetchOptions = options ? { ...options } : {};
  fetchOptions.headers = mergedHeaders;
  const response = await fetchWithRetry(url, fetchOptions);

  try {
    return (await response.json()) as T;
  } catch {
    throw new FetchError('Invalid JSON response');
  }
}

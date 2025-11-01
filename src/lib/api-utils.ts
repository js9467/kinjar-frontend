// Utility functions for handling API retries and better error handling

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Check if error is retryable (5xx errors, network errors, timeouts)
      const errorMessage = lastError.message.toLowerCase();
      const isRetryable = 
        errorMessage.includes('502') ||
        errorMessage.includes('503') ||
        errorMessage.includes('504') ||
        errorMessage.includes('bad gateway') ||
        errorMessage.includes('service unavailable') ||
        errorMessage.includes('gateway timeout') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('network error') ||
        lastError.name === 'AbortError';

      if (!isRetryable) {
        throw lastError;
      }

      console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options);
    
    // Throw error for non-ok responses
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  }, retryOptions);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function isNetworkError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('connection') ||
    message.includes('cors') ||
    message.includes('timeout')
  );
}

export function isServerError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('internal server error') ||
    message.includes('bad gateway') ||
    message.includes('service unavailable') ||
    message.includes('gateway timeout')
  );
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  
  if (isNetworkError(error)) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }
  
  if (isServerError(error)) {
    return 'Server is temporarily unavailable. Please try again in a few moments.';
  }
  
  if (message.includes('timeout') || message.includes('AbortError')) {
    return 'Request timed out. Please try again.';
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Authentication required. Please log in and try again.';
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  // Return original message for other errors
  return message;
}
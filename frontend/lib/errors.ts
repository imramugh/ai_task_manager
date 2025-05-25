/**
 * Custom error classes for better error handling
 */

export class APIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'APIError';
  }

  /**
   * Check if error is due to authentication failure
   */
  isAuthError(): boolean {
    return this.status === 401 || this.code === 'UNAUTHORIZED';
  }

  /**
   * Check if error is due to validation failure
   */
  isValidationError(): boolean {
    return this.status === 422 || this.code === 'VALIDATION_ERROR';
  }

  /**
   * Check if error is due to resource not found
   */
  isNotFoundError(): boolean {
    return this.status === 404 || this.code === 'NOT_FOUND';
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isAuthError()) {
      return 'Please log in to continue';
    }
    if (this.isValidationError() && this.field) {
      return `Invalid ${this.field}: ${this.message}`;
    }
    if (this.isNotFoundError()) {
      return 'The requested resource was not found';
    }
    return this.message || 'An unexpected error occurred';
  }
}

/**
 * Type guard to check if an error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}
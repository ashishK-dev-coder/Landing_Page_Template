export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details?: unknown
  ) {
    super(message, 422, "VALIDATION_ERROR");
  }
}

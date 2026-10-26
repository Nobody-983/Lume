export class ApiError extends Error {
  constructor(status, code, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class YouCamError extends Error {
  constructor(code, message, status = 502, details = null) {
    super(message);
    this.name = 'YouCamError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

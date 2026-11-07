// An error that should be sent to the client with a specific status code.
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

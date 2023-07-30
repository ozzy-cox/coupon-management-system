export class HTTPError extends Error {
  statusCode: number
  constructor(message: string, statusCode: number) {
    super()
    this.statusCode = statusCode
  }
}

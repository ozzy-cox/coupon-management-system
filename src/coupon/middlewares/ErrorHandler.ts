/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express'
import { HTTPError } from '../helpers/HTTPError'

export const errorHandler = (error: HTTPError, req: Request, res: Response, next: NextFunction) => {
  res.status(error?.statusCode || 500)
  res.json({
    error: {
      code: error?.statusCode,
      message: error.message
    }
  })
}

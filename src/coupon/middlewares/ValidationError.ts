import { NextFunction, Request, Response } from 'express'
import { FieldValidationError, validationResult } from 'express-validator'

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors: { [key: string]: string }[] = []
  errors.array().map((err) => extractedErrors.push({ [(err as FieldValidationError).path]: err.msg }))

  return res.status(422).json({
    errors: extractedErrors
  })
}

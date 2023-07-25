import express, { Express, NextFunction, Request, Response } from 'express'
import cors from 'cors'
import { Context } from './context'
import { uploadCoupons } from './coupon/controllers/CouponController'
import { mockContext } from './mockContext'

export const app: Express = express()

const contextMiddleware = (context: Context) => (req: Request, res: Response, next: NextFunction) => {
  req.context = context
  next()
}

const context = await mockContext()

app.use(cors())
app.use(contextMiddleware(context))
app.use(express.urlencoded({ extended: false }))

app.use(express.json())

app.use('/upload', uploadCoupons)

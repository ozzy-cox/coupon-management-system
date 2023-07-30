import { app } from './app'

const port = 8000
export const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

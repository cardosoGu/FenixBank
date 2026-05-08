import express, { Request, Response, Application  } from 'express'
import responser from 'responser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'


const app: Application = express()

// Project Libs configs

app.use(express.json())
app.use(responser.default || responser)
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())

// Routes config
app.get('/ping', (req: Request, res: Response) => {
    req.headers
    res.send_ok("Pong! 🏓")
})

// Middlewares Config

export default app

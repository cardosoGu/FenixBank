import express, { Application, response, request } from 'express'
import responser from 'responser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './docs/swagger.ts'
import authRoutes from './src/features/auth/AuthRoute.ts'
import bankRoutes from './src/features/bank/BankRoutes.ts'
const app: Application = express()


// Project Libs configs

app.use(express.json())
app.use(cookieParser())
app.use(responser.default)
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


// Routes config

app.get('/distribute/prod', (req: request, res: response) => {
    req.body
    res.status(200).send("pong")
})

app.use('/api/auth', authRoutes)
app.use('/api/bank', bankRoutes)

// Middlewares Config


export default app

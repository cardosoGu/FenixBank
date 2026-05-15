import express, { Application } from 'express'
import responser from 'responser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './src/docs/swagger.ts'
import authRoutes from './src/features/auth/AuthRoute.ts'
import bankRoutes from './src/features/bank/BankRoutes.ts'
const app: Application = express()


// Project Libs configs

app.use(express.json())
app.use(cookieParser())
app.use(cookieParser())
app.use(responser.default)
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


// Routes config

app.use('/', authRoutes)
app.use('/', bankRoutes)

// Middlewares Config


export default app

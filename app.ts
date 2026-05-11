import express, { Application } from 'express'
import responser from 'responser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'
import authRoutes from './src/features/auth/AuthRoute.ts'

const app: Application = express()

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FenixBank API',
            version: '1.0.0',
            description: 'Documentacao da API do FenixBank'
        }
    },
    apis: ['./app.ts']
})

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

app.use('/api/auth', authRoutes)

// Middlewares Config


export default app

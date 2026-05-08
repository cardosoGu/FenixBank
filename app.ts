import express, { Request, Response, Application } from 'express'
import responser from 'responser'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

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
app.use(responser.default || responser)
app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


// Routes config


app.get('/ping', (req: Request, res: Response) => {
    req.headers
    res.send_ok("Pong! 🏓")
})

// Middlewares Config


export default app

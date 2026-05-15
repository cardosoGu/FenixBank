import swaggerJSDoc from 'swagger-jsdoc';
import { env } from '../../config/Env.ts';

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'FenixBank API',
            version: '1.0.0',
            description: 'OpenAPI specification for the FenixBank REST API.',
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Invalid credentials',
                        },
                        data: {
                            nullable: true,
                        },
                    },
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'cpf', 'password', 'pixKeys'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Maria Silva',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'maria@fenixbank.com',
                        },
                        cpf: {
                            type: 'string',
                            example: '181.990.300-11',
                        },
                        password: {
                            type: 'string',
                            example: 'StrongPass123',
                        },
                        pixKeys: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            example: ['maria@fenixbank.com'],
                        },
                        balance: {
                            type: 'number',
                            example: 250,
                        },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'maria@fenixbank.com',
                        },
                        password: {
                            type: 'string',
                            example: 'StrongPass123',
                        },
                    },
                },
                TransferRequest: {
                    type: 'object',
                    required: ['pixKey', 'amount'],
                    properties: {
                        pixKey: {
                            type: 'string',
                            example: 'receiver@fenixbank.com',
                        },
                        amount: {
                            type: 'number',
                            example: 50,
                        },
                    },
                },
                AmountRequest: {
                    type: 'object',
                    required: ['amount'],
                    properties: {
                        amount: {
                            type: 'number',
                            example: 100,
                        },
                    },
                },
                AddPixKeyRequest: {
                    type: 'object',
                    required: ['newPixKey'],
                    properties: {
                        newPixKey: {
                            type: 'string',
                            example: 'new.key@fenixbank.com',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/features/**/*.ts'],
});

import rateLimit from 'express-rate-limit'

export const authRateLimiting = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    statusCode: 429,
    message: {
        status: 'TOO_MANY_REQUESTS',
        code: 429,
        success: false,
        message: 'too many requests. try again in 15 minutes.',
    }
})

export const bankOperationsRateLimiting = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    statusCode: 429,
    message: {
        status: 'TOO_MANY_REQUESTS',
        code: 429,
        success: false,
        message: 'too many requests. try again soon.',
    }
})

import { NextFunction, Request, Response } from 'express'
import requestCheck from 'request-check'
import is from "jsr:@zarco/isness"

/**
 * Middlewares to verify if user is'nt logged or if user is logged
 *
 */

class AuthMiddlewareClass {

    validateRegister = async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, cpf, password } = req.body

        const rc = requestCheck.default()

        rc.addRule('name', {
            validator: (nome: string) => is.string(nome) && nome.trim().length >= 2,
            message: 'Nome inválido'
        })

        rc.addRule('email', {
            validator: (email: string) => is.email(email),
            message: 'Email inválido'
    })

        rc.addRule('cpf', {
        validator: (cpf: string) => is.cpf(cpf),
            message: 'CPF inválido'
        })

        rc.addRule('password', {
            validator: (password: string) => is.string(password) && password.length >= 6 ,
            message: 'Senha deve ter no mínimo 6 caracteres'
        })

const errors = rc.check({ name }, { email }, { cpf }, { password })

if (errors) {
    return res.status(400).json({
        success: false,
        message: 'Erro de validação',
        errors
    })
}

next()
    }


}

export const authMiddleware = new AuthMiddlewareClass()

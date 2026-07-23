import { BaseRules } from "../../base/BaseRules.ts";
import is from "@zarco/isness";

export class AuthRules extends BaseRules {

    register(data: Record<string, unknown>) {
        this.addRule('name', {
            validator: (value: unknown) => (is.name(value))
            , message: 'Name is required'
        })
        this.addRule('email', {
            validator: (value: unknown) => is.email(value)
            , message: 'Invalid email'
        })
        this.addRule('cpf', {
            validator: (value: unknown) => is.cpf(value)
            , message: 'Invalid CPF'
        })
        this.addRule('password', {
            validator: (value: unknown) => is.string(value) && (value as string).length >= 8,
            message: 'Password must be at least 8 characters long'
        })
        this.addRule('pixKeys', {
            validator: (value: unknown) => is.array(value) && (value as string[]).every((v) => is.string(v) && v.trim().length > 0),
            message: 'Pix keys must be a non-empty array of strings'
        })
        this.addRule('balance', {
            validator: (value: unknown) => is.number(value) && (value as number) >= 0 && (value as number) <= 1000,
            message: 'Invalid balance, must be less than or equal to 1000'
        })
        return this.run({ name: data.name, email: data.email, cpf: data.cpf, password: data.password, pixKeys: data.pixKeys, balance: data.balance })
    }

    login(data: Record<string, unknown>) {
        this.addRule('email', { validator: (value: unknown) => is.email(value), message: 'Invalid email' })
        this.addRule('password', {
            validator: (value: unknown) => is.string(value) && (value as string).length >= 8,
            message: 'Password must be at least 8 characters long'
        })
        return this.run({ email: data.email, password: data.password })
    }

}

import { BaseRules } from "../../base/BaseRules.ts";
import is from '@zarco/isness'

export class BankRules extends BaseRules {
    transfer(data: Record<string, unknown>) {
        this.addRule('amount', {
            validator: (value: unknown) => is.number(value) && (value as number) > 0,
            message: 'Amount must be a positive number'
        })
        this.addRule('pixKey', {
            validator: (value: unknown) => is.string(value) && (value as string).trim() !== '',
            message: 'the Pix key must be a non-empty string'
        })
        return this.run(data)
    }

    deposit(data: Record<string, unknown>) {
        this.addRule('amount', {
            validator: (value: unknown) => is.number(value) && (value as number) > 0 && (value as number) <= 10000,
            message: 'Amount must be a valid number'
        })
        return this.run(data)
    }
    withdraw(data: Record<string, unknown>) {
        this.addRule('amount', {
            validator: (value: unknown) => is.number(value) && (value as number) > 0,
            message: 'Amount must be a positive number'
        })
        return this.run(data)
    }
    addPixKey(data: Record<string, unknown>) {
        this.addRule('newPixKey', {
            validator: (value: unknown) => is.string(value) && (value as string).trim().length > 0,
            message: 'the Pix key must be a non-empty string'
        })
        return this.run(data)
    }

}

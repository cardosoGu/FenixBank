import { BaseRules } from "../../base/BaseRules.ts";
import is from 'jsr:@zarco/isness'

export class BankRules extends BaseRules {
    transfer(data: Record<string, unknown>) {
        this.addRule('amount', {
            validator: (value: unknown) => is.number(value) && (value as number) > 0,
            message: 'Amount must be a positive number'
        })
        this.addRule('toAccount', {
            validator: (value: unknown) => is.string(value) && (value as string).trim() !== '',
            message: 'the Pix key must be a non-empty string'
        })
        return this.run(data)
    }

    deposit(data: Record<string, unknown>) {
        this.addRule('amount', {
            validator: (value: unknown) => is.number(value) && (value as number) > 0 && (value as number) <= 500,
            message: 'Amount must be a positive number'
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

}

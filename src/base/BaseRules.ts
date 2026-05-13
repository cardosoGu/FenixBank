import rc from 'request-check';

type Rule = {
    validator: (value: unknown) => boolean,
    message: string
}

type validationResult = {
    success: boolean,
    errors?: { field: string, message: string }[]
}

export class BaseRules {

    protected rules: Record<string, Rule> = {}

    // add validation rule for a field
    addRule(field: string, rule: Rule): this {
        this.rules[field] = rule
        return this
    }

    //run validation and return result
    protected run(data: Record<string, unknown>): validationResult {
        const errors: { field: string, message: string }[] = []

        for (const [field, rule] of Object.entries(this.rules)) {
            if (!rule.validator(data[field])) {
                errors.push({ field, message: rule.message })
            }
        }

        this.rules = {}

        if (errors.length > 0) return { success: false, errors }
        return { success: true }
    }
}

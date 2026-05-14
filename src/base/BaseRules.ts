import rc from 'request-check';
import throwlhos from "throwlhos";

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

        if (errors.length > 0) {
            throw throwlhos.default.err_badRequest("Validation failed!", errors)
        }
        return { success: true }
    }
}

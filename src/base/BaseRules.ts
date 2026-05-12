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

    private rules: Record<string, Rule> = {}

    // add validation rule for a field
    addRule(field: string, rule: Rule): this {
        this.rules[field] = rule
        return this
    }

    //run validation and return result
    protected run(data: Record<string, unknown>): validationResult {
        const checker = rc.default();

        // add rules to request-check
        for (const [field, rule] of Object.entries(this.rules)) {
            checker.addRule(field, rule)
        }
        // format body for request-check
        const entries = Object.entries(data).map((([k, v]) => [[k], v]))

        // match formatted data to rules
        const errors = checker.check(...entries)

        // clear rules after validation
        this.rules = {}

        if (errors) return { success: false, errors }
        return { success: true }
    }
}

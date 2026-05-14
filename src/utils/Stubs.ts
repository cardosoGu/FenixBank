export function MockResponser() {
    return {
        payload: null as any,
        cookies: [] as any[],

        called: {
            cookie: false,
            clearCookie: false,

            send_ok: false,
            send_created: false,
            send_badRequest: false,
            send_unauthorized: false,
            send_forbidden: false,
            send_notFound: false,
            send_internalServerError: false,
        },

        cookie(name: string, value: unknown, options?: unknown) {
            this.called.cookie = true;

            this.cookies.push({
                name,
                value,
                options,
            });

            return this;
        },

        clearCookie(name: string) {
            this.called.clearCookie = true;

            return this;
        },
        send_ok(message: string, data?: unknown) {
            this.called.send_ok = true;

            this.payload = {
                success: true,
                message,
                data,
                code: 200,
                status: "OK",
            };

            return this.payload;
        },

        send_created(message: string, data?: unknown) {
            this.called.send_created = true;

            this.payload = {
                success: true,
                message,
                data,
                code: 201,
                status: "CREATED",
            };

            return this.payload;
        },

        send_badRequest(message: string, errors?: unknown) {
            this.called.send_badRequest = true;

            this.payload = {
                success: false,
                errors,
                message,
                code: 400,
                status: "BAD_REQUEST",
            };

            return this.payload;
        },

        send_unauthorized(message: string, errors?: unknown) {
            this.called.send_unauthorized = true;

            this.payload = {
                success: false,
                errors,
                message,
                code: 401,
                status: "UNAUTHORIZED",
            };

            return this.payload;
        },

        send_forbidden(message: string, errors?: unknown) {
            this.called.send_forbidden = true;

            this.payload = {
                success: false,
                errors,
                message,
                code: 403,
                status: "FORBIDDEN",
            };

            return this.payload;
        },

        send_notFound(message: string, errors?: unknown) {
            this.called.send_notFound = true;

            this.payload = {
                success: false,
                errors,
                message,
                code: 404,
                status: "NOT_FOUND",
            };

            return this.payload;
        },

        send_internalServerError(message: string, errors?: unknown) {
            this.called.send_internalServerError = true;

            this.payload = {
                success: false,
                errors,
                message,
                code: 500,
                status: "INTERNAL_SERVER_ERROR",
            };

            return this.payload;
        },
    };
}

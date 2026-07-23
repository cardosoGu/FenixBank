import { assertEquals, assert, assertExists } from "@std/assert";
import { AuthController } from "./AuthController.ts";
import { AuthRules } from "./AuthRules.ts";
import { MockResponser } from "../../utils/Stubs.ts";
import { Request } from "express";
import { MockAuthService } from "./mocks/MockAuthService.ts";

// --- MOCK HELPERS ---

function controllerMock() {
    const authRules = new AuthRules()
    const authService = new MockAuthService()
    const authController = new AuthController(authService, authRules)

    return authController
}
// --- SUÍTE DE TESTES ---

Deno.test({
    name: 'Register - Should register successfully and return access token and set HTTPOnly cookie',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            headers: {
                'user-agent': 'Mozilla/5.0'
            },
            body: {
                name: "mocked name",
                email: "mocked@example.com",
                password: "mockedpassword",
                cpf: "181.990.300-11",
                pixKeys: ["mockedpixkey1"],
                balance: 500,
            }
        } as unknown as Request

        await authController.register(request, res)

        assert(res.called.send_created, "should called send_created");
        assertEquals(res.payload.code, 201);
        assertExists(res.payload.data.accessToken, "should have returned an access token");
        assert(res.called.cookie, "should have set an HTTPOnly cookie");
    }
})

Deno.test({
    name: 'Register - Should fail when trying to register with an email that is already in use',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            headers: {
                'user-agent': 'Mozilla/5.0'
            },
            body: {
                name: "mocked name",
                email: "pedro.oliveira@example.com",
                password: "mockedpassword",
                cpf: "181.990.300-11",
                pixKeys: ["mockedpixkey1"],
                balance: 500,
            }
        } as unknown as Request

        await authController.register(request, res)



        assert(res.called.send_badRequest, "should called err_badRequest");
        assertEquals(res.payload.code, 400);
        assertEquals(res.payload.message, "Email already in use!");
    }
})

Deno.test({
    name: 'Login - Should login successfully return access token and set HTTPOnly cookie',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            headers: {
                'user-agent': 'Mozilla/5.0'
            },
            body: {
                email: "pedro.oliveira@example.com",
                password: "password-3",
            }
        } as unknown as Request

        await authController.login(request, res)



        assert(res.called.send_ok, "should called send_ok");
        assertEquals(res.payload.code, 200);
        assertExists(res.payload.data.accessToken, "should have returned an access token");
        assert(res.called.cookie, "should have set an HTTPOnly cookie");
    }
})
Deno.test({
    name: 'Login - Should fail when trying to login with invalid credentials',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            headers: {
                'user-agent': 'Mozilla/5.0'
            },
            body: {
                email: "pedro.oliveira@example.com",
                password: "IncorrectPassword",
            }
        } as unknown as Request

        await authController.login(request, res)

        assert(res.called.send_unauthorized, "should called err_unauthorized");
        assertEquals(res.payload.code, 401);
        assertEquals(res.payload.message, "Invalid credentials!");
    }
})

Deno.test({
    name: 'Me - Should return user data when authenticated',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: '507f1f77bcf86cd799439011'
            }
        } as unknown as Request

        await authController.me(request, res)

        assert(res.called.send_ok, "should called send_ok");
        assertEquals(res.payload.code, 200);
        assertExists(res.payload.data.user, "should have returned user data");
    }
})

Deno.test({
    name: 'Me - Should return user not found',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: '000000000000000000000000' // Non-existent user ID
            }
        } as unknown as Request

        await authController.me(request, res)

        assert(res.called.send_notFound, "should called send_notFound");
        assertEquals(res.payload.code, 404);
        assertEquals(res.payload.message, "User not found!");
    }
})


Deno.test({
    name: 'Refresh - Should refresh token successfully and set new HTTPOnly cookie',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            headers: {
                'user-agent': 'Mozilla/5.0'
            },
            cookies: {
                'refreshToken': 'hashed_refresh_token_mock_1'
            },
        } as unknown as Request

        await authController.refresh(request, res)
        assert(res.called.send_ok, "should called send_ok");
        assertEquals(res.payload.code, 200);
        assertExists(res.payload.data.accessToken, "should have returned an access token");
        assert(res.called.cookie, "should have set a new HTTPOnly cookie");
    }
})


Deno.test({
    name: 'Refresh - Should fail to refresh token with invalid refresh token and clear cookie',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            headers: {
                'user-agent': 'Mozilla/5.0'
            },
            cookies: {
                'refreshToken': 'hashed_refresh_token_mock_invalid'
            },
        } as unknown as Request

        await authController.refresh(request, res)
        assert(res.called.send_unauthorized, "should called err_unauthorized");
        assert(res.called.clearCookie, "should have cleared the cookie");
        assertEquals(res.payload.code, 401);
        assertEquals(res.payload.message, "Invalid refresh token!");
    }
})

Deno.test({
    name: 'logout - Should logout successfully and clear HTTPOnly cookie',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: '507f1f77bcf86cd799439012'
            },
            cookies: {
                'refreshToken': 'hashed_refresh_token_mock_2'
            },
        } as Request

        await authController.logout(request, res)

        assert(res.called.send_ok, "should called send_ok");
        assert(res.called.clearCookie, "should have cleared the cookie");
        assertEquals(res.payload.code, 200);
        assertEquals(res.payload.message, "User logged out successfully!");
    }
})
Deno.test({
    name: 'logout - Should logout fail with invalid refresh token',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: '507f1f77bcf86cd799439012'
            },
            cookies: {
                'refreshToken': 'hashed_refresh_token_mock_invalid'
            },
        } as Request

        await authController.logout(request, res)

        assert(res.called.send_notFound, "should called send_notFound");
        assertEquals(res.payload.code, 404);
        assertEquals(res.payload.message, "Session not found!");
    }
})

Deno.test({
    name: 'logout - Should logoutAll successfully and clear HTTPOnly cookie',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: '507f1f77bcf86cd799439012'
            },
            cookies: {
                'refreshToken': 'hashed_refresh_token_mock_2'
            },
        } as Request

        await authController.logoutAll(request, res)

        assert(res.called.send_ok, "should called send_ok");
        assert(res.called.clearCookie, "should have cleared the cookie");
        assertEquals(res.payload.code, 200);
        assertEquals(res.payload.message, "User logged out successfully!");
    }
})
Deno.test({
    name: 'logout - Should logoutAll fail with invalid refresh token',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: '507f1f77bcf86cd799439012'
            },
            cookies: {
                'refreshToken': 'hashed_refresh_token_mock_invalid'
            },
        } as Request

        await authController.logoutAll(request, res)

        assert(res.called.send_notFound, "should called send_notFound");
        assertEquals(res.payload.code, 404);
        assertEquals(res.payload.message, "Session not found!");
    }
})
Deno.test({
    name: 'sessions - Should return user sessions successfully',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: '507f1f77bcf86cd799439012'
            },
            cookies: {
                'refreshToken': 'hashed_refresh_token_mock_invalid'
            },
        } as Request

        await authController.sessions(request, res)

        assert(res.called.send_ok, "should called send_ok");
        assertEquals(res.payload.code, 200);
    }
})
Deno.test({
    name: 'sessions - Should return not found with invalid user id',
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
        const authController = controllerMock()

        const res = MockResponser()

        const request = {
            user: {
                userId: '000000000000000000000000'
            }
        } as Request

        await authController.sessions(request, res)

        assert(res.called.send_notFound, "should called send_notFound");
        assertEquals(res.payload.code, 404);
        assertEquals(res.payload.message, "User not found!");
    }
})

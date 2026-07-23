import { assertEquals } from "@std/assert";
import { jwtService } from "./jwt.ts";

Deno.test("JWTService - should generate and verify access token", () => {
    const userId = "507f1f77bcf86cd799439011";

    const token = jwtService.generateAccessToken(userId);
    const payload = jwtService.verifyAccessToken(token);

    assertEquals(payload.sub, userId);
});

Deno.test("JWTService - should generate and verify refresh token", () => {
    const userId = "507f1f77bcf86cd799439012";

    const token = jwtService.generateRefreshToken(userId);
    const payload = jwtService.verifyRefreshToken(token);

    assertEquals(payload.sub, userId);
});

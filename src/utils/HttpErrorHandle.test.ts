// deno-lint-ignore no-import-prefix
import { assert } from "https://deno.land/std@0.220.0/assert/mod.ts";
import { Response } from "express";
import { handleHttpError } from "./HttpErrorHandle.ts";
import { MockResponser } from "./Stubs.ts";

Deno.test("handleHttpError - should map known status codes", () => {
    const cases = [
        { error: { code: 400, message: "bad" }, field: "send_badRequest" },
        { error: { code: 401, message: "unauthorized" }, field: "send_unauthorized" },
        { error: { code: 403, message: "forbidden" }, field: "send_forbidden" },
        { error: { code: 404, message: "not found" }, field: "send_notFound" },
    ] as const;

    for (const testCase of cases) {
        const res = MockResponser();
        handleHttpError(res as unknown as Response, testCase.error);
        assert(res.called[testCase.field], `should call ${testCase.field}`);
    }
});

Deno.test("handleHttpError - should call send_conflict when available", () => {
    const res = MockResponser() as unknown as {
        called: Record<string, boolean>;
        send_conflict: (message: string, data?: unknown) => unknown;
        payload: unknown;
    };

    res.send_conflict = () => {
        res.called.send_conflict = true;
        return null;
    };

    handleHttpError(res as unknown as Response, { code: 409, message: "conflict" });
    assert(res.called.send_conflict, "should call send_conflict for 409 errors");
});

Deno.test("handleHttpError - should fallback to send_internalServerError", () => {
    const res = MockResponser();
    handleHttpError(res as unknown as Response, { message: "boom" });

    assert(
        res.called.send_internalServerError,
        "should fallback to internal server error",
    );
});

Deno.test("handleHttpError - should fallback to send_internalServerError when 409 has no send_conflict", () => {
    const res = MockResponser() as unknown as {
        called: Record<string, boolean>;
        send_conflict?: (message: string, data?: unknown) => unknown;
    };
    delete res.send_conflict;

    handleHttpError(res as unknown as Response, { code: 409, message: "conflict" });
    assert(
        res.called.send_internalServerError,
        "should fallback to internal server error when send_conflict does not exist",
    );
});

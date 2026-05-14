import { Response } from "express";

export function handleHttpError(res: Response, error: unknown) {
const typedError = error as {
    code?: number;
    statusCode?: number;
    message?: string;
    data?: unknown;
    errors?: unknown;
};
  const statusCode = Number(typedError.code ?? typedError.statusCode ?? 500);
  const message = typedError.message ?? "Internal server error";

  if (statusCode === 400) {
    return res.send_badRequest(message, typedError.data ?? typedError.errors);
  }

  if (statusCode === 401) {
    return res.send_unauthorized(message);
  }

  if (statusCode === 403) {
    return res.send_forbidden(message);
  }

  if (statusCode === 404) {
    return res.send_notFound(message);
  }

  if (statusCode === 409) {
    if (res.send_conflict) {
      return res.send_conflict(message, typedError.data);
    }
  }

  return res.send_internalServerError(message, typedError.data ?? typedError);
}

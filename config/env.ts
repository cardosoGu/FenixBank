import "@std/dotenv/load";
import { z } from 'zod'
import throwlhos from "throwlhos";

//Exporting and Validating environment variables using zod
const envSchema = z.object({
  DATABASE_URL: z.string().nonempty("DATABASE_URL is required"),
  DB_NAME: z.string().nonempty("DB_NAME is required"),
  PORT: z.string().default("3000"),
  JWT_ACCESS_SECRET: z.string().nonempty("JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().nonempty("JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().nonempty("JWT_ACCESS_EXPIRES_IN is required"),
  JWT_REFRESH_EXPIRES_IN: z.string().nonempty("JWT_REFRESH_EXPIRES_IN is required"),
});


const parsed = envSchema.safeParse(Deno.env.toObject());

if (!parsed.success) {
  throwlhos.default.err_internalServerError("Environment variable validation failed:", parsed.error.format());
  Deno.exit(1);
}

export const env = parsed.data

import { z } from 'zod'

if (Deno.env.get("DENO_DEPLOYMENT_ID") === undefined) {
  await import("@std/dotenv/load");
}

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
  throw new Error(
    `Environment variable validation failed: ${JSON.stringify(parsed.error.format())}`,
  );
}

export const env = parsed.data

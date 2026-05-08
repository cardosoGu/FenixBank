import "@std/dotenv/load";
import { z } from 'zod'

//Exporting and Validating environment variables using zod
const envSchema = z.object({
  DATABASE_URL: z.string().nonempty("DATABASE_URL is required"),
  DB_NAME: z.string().nonempty("DB_NAME is required"),
  PORT: z.string().default("3000"),
});

const parsed = envSchema.safeParse(Deno.env.toObject());

if (!parsed.success) {
  console.error("Environment variable validation failed:", parsed.error.format());
  Deno.exit(1);
}

export const env = parsed.data

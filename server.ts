import app from './app.ts'
import { env } from './config/Env.ts'
import { DBConnection } from "./config/Db.ts";
import throwlhos from 'throwlhos'

async function main() {
  try {
    // Connect to the database
    await DBConnection();

    // Start the server
    await app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT} 🚀`)
      console.log(`https://localhost:${env.PORT}/`)
      console.log(`https://localhost:${env.PORT}/api-docs`)
    })


  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw throwlhos.default.err_internalServerError(`❌ Error starting the server |: ${message}`);
  }
}
main()

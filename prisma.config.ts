import 'dotenv/config'
import { defineConfig, env } from "prisma/config";

const dbUrl = env('DATABASE_URL');

if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'tsx prisma/seed.ts',
    },
    datasource: {
        url: dbUrl
    }
});
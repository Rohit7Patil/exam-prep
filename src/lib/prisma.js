import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

// Append connection_limit=1 to prevent serverless connection exhaustion on Vercel 
// if it isn't already specified by the user's environment variable.
const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;
  if (url && !url.includes("connection_limit")) {
    url += (url.includes("?") ? "&" : "?") + "connection_limit=1";
  }
  return url;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

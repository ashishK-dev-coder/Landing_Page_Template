import { Prisma } from "@prisma/client";

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDatabaseConfigError(): string | null {
  if (!isDatabaseConfigured()) {
    return "DATABASE_URL is missing. Add it to your .env file (see .env.example).";
  }
  return null;
}

export function isPrismaConnectionError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error &&
      (error.message.includes("DATABASE_URL") ||
        error.message.includes("Can't reach database") ||
        error.message.includes("P1001")))
  );
}

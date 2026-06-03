import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ValidationError } from "@/lib/errors";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error instanceof ValidationError ? error.details : undefined,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: error.flatten(),
        },
      },
      { status: 422 }
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      success: false,
      error: { message: "Internal server error", code: "INTERNAL_ERROR" },
    },
    { status: 500 }
  );
}

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError("Invalid JSON body", 400);
  }
}

export async function handleRoute(handler: () => Promise<NextResponse>) {
  try {
    return await handler();
  } catch (error) {
    return jsonError(error);
  }
}

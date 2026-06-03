import { NextResponse } from "next/server";
import { setAdminSession, validateAdminPassword } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password || "");

    if (!validateAdminPassword(password)) {
      return NextResponse.json({ message: "Invalid password." }, { status: 401 });
    }

    await setAdminSession();
    return NextResponse.json({ message: "Logged in." });
  } catch {
    return NextResponse.json({ message: "Invalid login request." }, { status: 400 });
  }
}

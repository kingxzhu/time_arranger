import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correctPassword = process.env.AUTH_PASSWORD || "佛心";

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth", "authenticated", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ success: false, error: "密码错误" }, { status: 401 });
}

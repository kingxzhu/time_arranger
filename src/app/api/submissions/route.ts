import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthenticated(request: NextRequest): boolean {
  return request.cookies.get("auth")?.value === "authenticated";
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    submissions.map((s) => ({
      ...s,
      slots: JSON.parse(s.slots),
    }))
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { name, slots } = await request.json();

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "请输入姓名" }, { status: 400 });
  }

  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return NextResponse.json({ error: "请选择至少一个时间段" }, { status: 400 });
  }

  const submission = await prisma.submission.upsert({
    where: { name: name.trim() },
    update: { slots: JSON.stringify(slots) },
    create: { name: name.trim(), slots: JSON.stringify(slots) },
  });

  return NextResponse.json({
    ...submission,
    slots: JSON.parse(submission.slots),
  });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name) {
    return NextResponse.json({ error: "请提供姓名" }, { status: 400 });
  }

  await prisma.submission.deleteMany({ where: { name } });
  return NextResponse.json({ success: true });
}

import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await params;
  const { isRead } = await req.json();

  const submission = await prisma.contactSubmission.update({
    where: { id },
    data: { isRead },
  });
  return NextResponse.json(submission);
}

export async function DELETE(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await params;
  await prisma.contactSubmission.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

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
  const { title, slug, content, published } = await req.json();

  const blog = await prisma.blog.update({
    where: { id },
    data: { title, slug, content, published },
  });
  return NextResponse.json(blog);
}

export async function DELETE(req, { params }) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await params;
  await prisma.blog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

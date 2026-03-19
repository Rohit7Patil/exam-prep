import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/getAuthUser";
import { requireAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { username: true } } },
  });
  return NextResponse.json(blogs);
}

export async function POST(req) {
  const { user, response } = await getAuthUser();
  if (!user) return response;

  const forbidden = await requireAdmin(user);
  if (forbidden) return forbidden;

  const { title, slug, content, published } = await req.json();

  const blog = await prisma.blog.create({
    data: {
      title,
      slug,
      content,
      published,
      authorId: user.id,
    },
  });
  return NextResponse.json(blog);
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import BlogShareButton from "@/components/BlogShareButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({ where: { slug } });
  if (!blog) return { title: "Blog Not Found" };
  return { title: `${blog.title} | ExamPrep India` };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!blog || !blog.published) return notFound();

  return (
    <main className="min-h-screen bg-background py-12 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Link 
          href="/blogs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>

        <article>
          <div className="mb-8">
            <h1 className="text-4xl font-black sm:text-5xl mb-6 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground py-6 border-y border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {blog.author?.username?.[0]?.toUpperCase() || "A"}
                </div>
                <span className="font-medium text-foreground">{blog.author?.username || "Admin"}</span>
              </div>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <BlogShareButton title={blog.title} />
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {/* Simple Markdown-like rendering for content */}
            {blog.content.split('\n').map((para, i) => (
              <p key={i} className="mb-4 text-lg leading-relaxed text-foreground/90">
                {para}
              </p>
            ))}
          </div>
        </article>
      </div>
    </main>
  );
}

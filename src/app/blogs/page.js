import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, User, ArrowRight, FileText } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({
    where: { published: true },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-black sm:text-5xl">Latest Updates</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Stay informed with the latest developments in the exam space in India. 
            From policy changes to preparation strategies.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No blogs yet</h3>
            <p className="text-muted-foreground">Check back later for fresh updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link 
                key={blog.id} 
                href={`/blogs/${blog.slug}`}
                className="group flex flex-col bg-card border border-border/50 rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {blog.author.username}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-6">
                    {blog.content.replace(/[#*`]/g, '').substring(0, 150)}...
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between text-sm font-medium text-primary bg-muted/20">
                  Read More
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

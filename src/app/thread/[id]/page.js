import { posts } from "@/data/mockData";
import PostCard from "@/components/PostCard";
import Editor from "@/components/Editor";

export default async function ThreadPage({ params }) {
  const { id } = await params;

  const threadPosts = posts.filter(
    (p) => p.threadId === id
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Thread</h1>

      {threadPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <Editor />
    </div>
  );
}

export default function PostCard({ post }) {
  return (
    <div className="border p-4 rounded">
      <p className="mb-2">{post.content}</p>
      <span className="text-xs text-gray-500">
        Posted by {post.author}
      </span>
    </div>
  );
}

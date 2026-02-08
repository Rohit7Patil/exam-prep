export default function Editor() {
  return (
    <div className="border rounded p-4">
      <textarea
        className="w-full border p-2 rounded"
        rows={4}
        placeholder="Write your reply..."
      />
      <button className="mt-2 px-4 py-2 bg-black text-white rounded">
        Post Reply
      </button>
    </div>
  );
}

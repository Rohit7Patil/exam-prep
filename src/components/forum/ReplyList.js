import ReplyItem from "./ReplyItem";

export default function ReplyList({ replies }) {
  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} />
      ))}
    </div>
  );
}

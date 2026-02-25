import ReplyItem from "./ReplyItem";

export default function ReplyList({ replies, userVotes = {} }) {
  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <ReplyItem key={reply.id} reply={reply} userVotes={userVotes} />
      ))}
    </div>
  );
}

import ReplyItem from "./ReplyItem";

export default function ReplyList({ replies, userVotes = {} }) {
  return (
    <div className="divide-y divide-border/30">
      {replies.map((reply) => (
        <div key={reply.id} className="py-3 first:pt-0">
          <ReplyItem reply={reply} userVotes={userVotes} />
        </div>
      ))}
    </div>
  );
}

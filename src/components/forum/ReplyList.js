import ReplyItem from "./ReplyItem";

export default function ReplyList({ replies, userVotes = {}, currentUserId, isAdmin, threadAuthorId }) {
  return (
    <div className="divide-y divide-border/30">
      {replies.map((reply) => (
        <div key={reply.id} className="py-3 first:pt-0">
          <ReplyItem
            reply={reply}
            userVotes={userVotes}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            threadAuthorId={threadAuthorId}
          />
        </div>
      ))}
    </div>
  );
}

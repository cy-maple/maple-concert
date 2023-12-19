import "./index.less";
function ChatBubble({
  text,
  isUser,
  date,
}: {
  text: string;
  isUser: boolean;
  date: string;
}) {
  return isUser ? (
    <div className="chat-bubble-right">
      <div>
        <div className="chat-bubble-right-left">{text}</div>
        <div className="date">{date}</div>
      </div>
      <div className="chat-bubble-right-right"></div>
    </div>
  ) : (
    <div className="chat-bubble-left">
      <div className="chat-bubble-left-left"></div>
      <div>
        <div className="chat-bubble-left-right">{text}</div>
        <div className="date">{date}</div>
      </div>
    </div>
  );
}

export default ChatBubble;

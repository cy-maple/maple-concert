import "./index.less";
import { Avatar } from "antd";
import ChatBubble from "../chat-bubble";
import ColorHash from "@/utils/color-hash";
interface ChatData {
  user: string;
  text?: string;
  record?: Blob;
  date: string;
  type: string;
}

function ChatContent({
  chatData,
  user,
}: {
  chatData: ChatData[];
  user: string;
}) {
  const colorHash = new ColorHash();
  return (
    <div className="chat-content">
      {chatData.map((item, index) => {
        if (item.user === user) {
          return (
            <div className="chat-row chat-right" key={index}>
              <Avatar
                style={{
                  backgroundColor: colorHash.hex(item.user),
                  verticalAlign: "middle",
                  marginLeft: "10px",
                }}
                size="large"
              >
                {item.user}
              </Avatar>
              <ChatBubble
                type={item.type}
                text={item.text}
                record={item.record}
                isUser={item.user === user}
                date={item.date}
              />
            </div>
          );
        } else {
          return (
            <div className="chat-row chat-left" key={index}>
              <Avatar
                style={{
                  backgroundColor: colorHash.hex(item.user),
                  verticalAlign: "middle",
                  marginRight: "10px",
                }}
                size="large"
              >
                {item.user}
              </Avatar>
              <ChatBubble
                type={item.type}
                text={item.text}
                record={item.record}
                isUser={item.user === user}
                date={item.date}
              />
            </div>
          );
        }
      })}
    </div>
  );
}

export default ChatContent;
export type { ChatData };

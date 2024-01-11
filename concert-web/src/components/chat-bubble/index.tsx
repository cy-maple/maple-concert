import "./index.less";
import { useState, useEffect, useRef } from "react";
import { PlayCircleTwoTone } from "@ant-design/icons";
function ChatBubble({
  type,
  text,
  record,
  isUser,
  date,
}: {
  type: string;
  text?: string;
  record?: Blob;
  isUser: boolean;
  date: string;
}) {
  const [audioUrl, setAudioUrl] = useState("");
  const audio = useRef(null);
  useEffect(() => {
    audio.current.play();
  }, [audioUrl]);
  const playRecord = () => {
    // 将object转化为arrayBuffer
    let arybuf = record;
    if (!(record instanceof ArrayBuffer)) {
      arybuf = new Uint8Array(record.data).buffer;
    }
    console.log(arybuf);
    const blob = new Blob([arybuf], { type: "audio/webm;codecs=opus" });
    setAudioUrl(URL.createObjectURL(blob));
  };
  return (
    <div>
      {isUser ? (
        <div className="chat-bubble-right">
          <div>
            <div className="chat-bubble-right-left">
              {type === "text" ? (
                text
              ) : (
                <div onClick={playRecord}>
                  <PlayCircleTwoTone />
                </div>
              )}
            </div>
            <div className="date">{date}</div>
          </div>
          <div className="chat-bubble-right-right"></div>
          <audio src={audioUrl}>xxx</audio>
        </div>
      ) : (
        <div className="chat-bubble-left">
          <div className="chat-bubble-left-left"></div>
          <div>
            <div className="chat-bubble-left-right">
              {type === "text" ? (
                text
              ) : (
                <div onClick={playRecord}>
                  <PlayCircleTwoTone />
                </div>
              )}
            </div>
            <div className="date">{date}</div>
          </div>
        </div>
      )}
      <audio ref={audio} src={audioUrl}></audio>
    </div>
  );
}

export default ChatBubble;

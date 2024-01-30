import "./index.less";
import { useState, useEffect, useRef } from "react";
import { PlayCircleTwoTone, PauseCircleTwoTone } from "@ant-design/icons";
function ChatBubble({
  type,
  text,
  record,
  isUser,
  recordTime,
  date,
}: {
  type: string;
  text?: string;
  record?: Blob;
  recordTime?: number;
  isUser: boolean;
  date: string;
}) {
  // 语音解析与播放
  // 语音资源地址
  const [audioUrl, setAudioUrl] = useState("");
  // 播放状态
  const [isPlay, setIsPlay] = useState(false);
  const isPlayRef = useRef(false);
  // 播放完毕状态
  const isPlayOver = useRef(true);
  const audio = useRef(null);
  useEffect(() => {
    audio.current.play();
  }, [audioUrl]);
  const playRecord = () => {
    if (isPlayRef.current) {
      setIsPlay(false);
      isPlayRef.current = false;
      return;
    }
    // 将object转化为arrayBuffer
    let arybuf = record;
    if (!(record instanceof ArrayBuffer)) {
      console.log(arybuf);
      arybuf = new Uint8Array(record.data).buffer;
    }
    const blob = new Blob([arybuf], { type: "audio/webm;codecs=opus" });
    setAudioUrl(URL.createObjectURL(blob));
    setIsPlay(true);
    isPlayRef.current = true;
    requestAnimationFrame(animate);
  };
  // 播放动画
  const [seconds, setSeconds] = useState(recordTime);
  const previousTimeRef = useRef(0);
  const secondsRef = useRef(recordTime);
  const animate = (time) => {
    if (!isPlayOver.current) {
      const deltaTime = time - previousTimeRef.current;
      if (deltaTime > 1000) {
        setSeconds((prevSeconds) => prevSeconds - 1);
        secondsRef.current = secondsRef.current - 1;
        previousTimeRef.current = time;
      }
    } else {
      previousTimeRef.current = time;
      isPlayOver.current = false;
    }
    if (secondsRef.current > 0 && isPlayRef.current) {
      requestAnimationFrame(animate);
    } else {
      setIsPlay(false);
      isPlayRef.current = false;
      if (secondsRef.current <= 0) {
        secondsRef.current = recordTime;
        isPlayOver.current = true;
        setSeconds(recordTime);
      }
    }
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
                <div onClick={playRecord} style={{ display: "flex" }}>
                  {isPlay ? <PauseCircleTwoTone /> : <PlayCircleTwoTone />}
                  <div style={{ marginLeft: "10px" }}>{seconds}s</div>
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
                <div onClick={playRecord} style={{ display: "flex" }}>
                  {isPlay ? <PauseCircleTwoTone /> : <PlayCircleTwoTone />}
                  <div style={{ marginLeft: "10px" }}>{seconds}s</div>
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

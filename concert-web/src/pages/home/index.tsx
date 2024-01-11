import "./index.less";
import {
  ThunderboltFilled,
  DeleteOutlined,
  HistoryOutlined,
  AudioFilled,
} from "@ant-design/icons";
import getDate from "@/utils/date";
import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ChatContent, { ChatData } from "@/components/chat-content";
import SettingBox from "@/components/setting-box";
import SettingButton from "@/components/setting-button";
import { Avatar, Button } from "antd";
import ColorHash from "@/utils/color-hash";
import RecordRTC from "recordrtc";
let socket = null;
function Home() {
  // message列表
  const [chatData, setChatData] = useState([]);
  // 获取user和room
  const location = useLocation();
  const room = location.state.room;
  const user = location.state.user;
  // 设置room背景色
  const color = new ColorHash().hex(room);
  const input = useRef(null);
  const messageView = useRef(null);
  // meeasgeView移动到底部
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messageView.current.scrollTop =
        messageView.current.scrollHeight - messageView.current.clientHeight;
    });
  };
  // 语音事件
  const [recorder, setRecorder] = useState(null);
  // const [audioUrl, setAudioUrl] = useState("");
  const [isrecording, setIsRecording] = useState(false);
  const startRecording = async () => {
    console.log("start record");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recordRTC = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/webm; codecs=opus",
      bitsPerSecend: 12000,
      sampleRate: 8000,
    });
    recordRTC.startRecording();
    setRecorder(recordRTC);
    setIsRecording(true);
  };
  const stopRecording = () => {
    recorder.stopRecording(() => {
      console.log("stop record");
      const audioBlob = recorder.getBlob();
      // const audioUrl = URL.createObjectURL(audioBlob);
      // setAudioUrl(audioUrl);
      setIsRecording(false);
      pushRecord(audioBlob);
    });
  };
  // 消息清空
  const deleteMessage = () => {
    input.current.value = "";
  };
  const [pusher, setPusher] = useState(null);
  // 定时发送
  const pushiIterval = () => {
    if (pusher) {
      clearInterval(pusher);
      setPusher(null);
      return;
    }
    let msg = 0;
    setPusher(
      setInterval(() => {
        msg++;
        const message: ChatData = {
          user: user,
          type: "text",
          text: String(msg),
          date: getDate(),
        };
        socket.emit("chat", room, message, false);
      }, 1000)
    );
  };
  // 语音发送
  const pushRecord = (rcd) => {
    const record: ChatData = {
      user: user,
      type: "record",
      record: rcd,
      text: "record",
      date: getDate(),
    };
    socket.emit("chat", room, record);
  };
  // 消息发送
  const pushMessage = () => {
    if (input.current.value === "") {
      return;
    }
    const message: ChatData = {
      user: user,
      type: "text",
      text: input.current.value,
      date: getDate(),
    };
    deleteMessage();
    socket.emit("chat", room, message);
  };
  // 消息批量发送
  const batchPushMessage = (num) => {
    let count = 1;
    const batchPushInterval = setInterval(() => {
      const message: ChatData = {
        user: user,
        type: "text",
        text: String(count),
        date: getDate(),
      };
      socket.emit("chat", room, message, false);
      count++;
      if (count > num) {
        clearInterval(batchPushInterval);
      }
    }, 0);
  };
  useEffect(() => {
    // 连接socket
    socket = io("http://localhost:3000", {
      query: {
        room: room,
        user: user,
      },
    });
    socket.on("chat", (msg) => {
      setChatData((msgArr) => [...msgArr, msg]);
    });

    // 获取历史消息
    socket.on("init", (msgArr) => {
      setChatData(msgArr);
    });

    //绑定回车事件
    const enterDown = (e) => {
      if (e.key === "Enter" || e.keycode === 13) {
        pushMessage();
      }
    };
    input.current.addEventListener("keyup", enterDown);
    return () => {
      input.current.removeEventListener("keyup", enterDown);
    };
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [chatData]);
  const peerConnections = {};
  // 在线视频
  useEffect(() => {
    const localVideo = document.querySelector("#localVideo");
    // const remoteVideo = document.querySelector("#remoteVideo");
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideo.srcObject = stream;
        // socket.emit("online-video", room, user);
        // socket.on("online-video", (user) => {
        //   const peerConnection = new RTCPeerConnection();
        //   peerConnections[user] = peerConnection;

        //   stream
        //     .getTracks()
        //     .forEach((track) => peerConnection.addTrack(track, stream));
        //   peerConnection
        //     .createOffer()
        //     .then((sdp) => peerConnection.setLocalDescription(sdp))
        //     .then(() => {
        //       socket.emit("offer", peerConnection.localDescription, user);
        //     });
        //   peerConnection.ontrack = (event) => {
        //     remoteVideo.srcObject = event.stream[0];
        //   };
        // });
      });
  }, []);
  return (
    <div className="home-page">
      <div className="chat-area">
        <div className="chat-area-header">
          <Avatar
            style={{
              backgroundColor: color,
              verticalAlign: "middle",
              marginLeft: "10px",
              marginRight: "10px",
            }}
            size={60}
          >
            聊天室
          </Avatar>
          {room}
        </div>
        <div ref={messageView} className="chat-area-body">
          <ChatContent chatData={chatData} user={user} />
        </div>
        <div className="chat-area-footer">
          <div className="chat-input">
            <div className="input-box">
              <input ref={input} type="text" placeholder="Please enter..." />
            </div>
            <Button
              onClick={deleteMessage}
              shape="circle"
              size="middle"
              style={{ backgroundColor: "#ddd", marginLeft: "8px" }}
              icon={<DeleteOutlined style={{ color: "#000" }} />}
            ></Button>
            <Button
              onClick={pushiIterval}
              shape="circle"
              size="middle"
              style={{ backgroundColor: "#ddd", marginLeft: "8px" }}
              icon={<HistoryOutlined style={{ color: "#000" }} />}
            ></Button>
            <Button
              onClick={isrecording ? stopRecording : startRecording}
              shape="circle"
              size="middle"
              style={{ backgroundColor: "#ddd", marginLeft: "8px" }}
              icon={<AudioFilled style={{ color: "#000" }} />}
            ></Button>
            <Button
              onClick={pushMessage}
              shape="circle"
              size="middle"
              style={{ backgroundColor: "#4bb150", marginLeft: "8px" }}
              icon={<ThunderboltFilled style={{ color: "#fff" }} />}
            ></Button>
          </div>
        </div>
      </div>
      <div className="setting-area">
        <div className="setting-area-title">测试操作</div>
        <SettingBox color="#f0feed" title="房间消息发送">
          <div className="setting-area-opts">
            <div className="setting-area-opts-row">
              <div className="setting-area-opt">
                <SettingButton
                  onClick={() => batchPushMessage(10)}
                  text="批量10条"
                />
              </div>
              <div className="setting-area-opt">
                <SettingButton
                  onClick={() => batchPushMessage(100)}
                  text="批量100条"
                />
              </div>
              <div className="setting-area-opt">
                <SettingButton
                  onClick={() => batchPushMessage(1000)}
                  text="1000条"
                />
              </div>
            </div>
          </div>
        </SettingBox>
        <SettingBox color="#f0feed" title="房间消息发送">
          <video autoPlay muted id="localVideo"></video>
          <video autoPlay muted id="remoteVideo"></video>
        </SettingBox>
      </div>
    </div>
  );
}

export default Home;

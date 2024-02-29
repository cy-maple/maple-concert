import "./index.less";
import {
  ThunderboltFilled,
  DeleteOutlined,
  HistoryOutlined,
  AudioFilled,
} from "@ant-design/icons";
import getDate from "@/utils/date";
import serverURL from "@/service/url";
import { io } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ChatContent, { ChatData } from "@/components/chat-content";
import SettingBox from "@/components/setting-box";
import SettingButton from "@/components/setting-button";
import MaskLayer from "@/components/mask-layer";
import UserList from "@/components/user-list";
import { Avatar, Button } from "antd";
import ColorHash from "@/utils/color-hash";
import RecordRTC from "recordrtc";
let socket = null;
function Home() {
  // 房间用户列表
  const [roomUserList, setRoomUserList] = useState([]);
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
  const startTime = useRef(new Date());
  const endTime = useRef(new Date());
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recordRTC = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/webm; codecs=opus",
      bitsPerSecend: 12000,
      sampleRate: 8000,
    });
    recordRTC.startRecording();
    console.log("start record");
    startTime.current = new Date();
    setRecorder(recordRTC);
    setIsRecording(true);
  };
  const stopRecording = () => {
    recorder.stopRecording(() => {
      endTime.current = new Date();
      const duration = Math.ceil(
        (endTime.current.getTime() - startTime.current.getTime()) / 1000
      );
      const audioBlob = recorder.getBlob();
      // setAudioUrl(audioUrl);
      setIsRecording(false);
      pushRecord(audioBlob, duration);
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
  const pushRecord = (rcd, tim) => {
    const record: ChatData = {
      user: user,
      type: "record",
      record: rcd,
      recordTime: tim,
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
    socket = io(serverURL, {
      query: {
        room: room,
        user: user,
      },
    });
    socket.on("chat", (msg) => {
      setChatData((msgArr) => [...msgArr, msg]);
    });

    // 获取消息列表
    socket.on("initMessageList", (msgArr) => {
      setChatData(msgArr);
    });

    // 获取用户列表
    socket.on("initUserList", (userArr) => {
      setRoomUserList(userArr);
    });

    // 更新用户列表
    socket.on("enterUser", (user) => {
      setRoomUserList((userArr) => [...userArr, user]);
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
  // 在线视频
  let peerConnection = null;
  let localstream = null;
  // 加入在线视频
  const joinVideoConnect = () => {
    // 创建显示本地与远程视频的video
    const localVideo = document.querySelector("#localVideo");
    const remoteVideo = document.querySelector("#remoteVideo");
    // 申请浏览器音频视频权限
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localstream = stream;
        // localVideo展示本地视频流
        localVideo.srcObject = stream;
        // 创建RTCPeerConnection
        peerConnection = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" }, // 谷歌的公共服务
            {
              urls: "turn:121.56.215.24:3478",
              credential: "maple",
              username: "cyf",
            },
          ],
        });
        // 将本地媒体流的轨道添加进RTCPeerConnection
        stream
          .getTracks()
          .forEach((track) => peerConnection.addTrack(track, stream));
        // SDP协商完成，接受到远程轨道时的hook
        peerConnection.ontrack = (event) => {
          remoteVideo.srcObject = event.streams[0];
        };
        // 创建offer，发起连接
        peerConnection
          .createOffer()
          .then((offer) => {
            return peerConnection.setLocalDescription(offer);
          })
          .then(() => {
            socket.emit("offer", peerConnection.localDescription);
          });
        // 收到offer，回复answer
        socket.on("offer", (offer) => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          peerConnection
            .createAnswer()
            .then((answer) => {
              return peerConnection.setLocalDescription(answer);
            })
            .then(() => {
              socket.emit("answer", peerConnection.localDescription);
            });
        });
        // 收到answer
        socket.on("answer", (answer) => {
          peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });
        // 发送ICE候选
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("candidate", event.candidate);
          }
        };
        // 接受ICE候选
        socket.on("candidate", (candidate) => {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });
      })
      .catch((error) => {
        console.log("获取本地流失败", error);
      });
  };
  // 退出在线视频
  const leaveVideoConnect = () => {
    localstream.getTracks().forEach((track) => {
      track.stop();
    });
    localstream = null;
    peerConnection.close();
    peerConnection = null;
  };
  // 选择视频对象
  const selectVideoUser = () => {
    console.log(roomUserList);
  };
  // 在线用户列表操作
  const [isShowUserList, setIsShowUserList] = useState(false);
  const changeIsShowUserList = () => {
    setIsShowUserList((state) => !state);
  };
  return (
    <>
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
          <div className="setting-area-title">房间操作</div>
          <div className="setting-area-body">
            <SettingBox color="#f0feed" title="">
              <div className="setting-area-opts">
                <div className="setting-area-opts-row">
                  <div className="setting-area-opt">
                    <SettingButton
                      onClick={() => changeIsShowUserList()}
                      text={`房间在线人数：${roomUserList.length}`}
                    />
                  </div>
                </div>
              </div>
            </SettingBox>
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
            <SettingBox color="#f0feed" title="在线视频操作">
              <div className="setting-area-opts">
                <div className="setting-area-opts-row">
                  <div className="setting-area-opt">
                    <SettingButton
                      onClick={() => joinVideoConnect()}
                      text="加入视频"
                    />
                  </div>
                  <div className="setting-area-opt">
                    <SettingButton
                      onClick={() => leaveVideoConnect()}
                      text="退出视频"
                    />
                  </div>

                  <div className="setting-area-opt">
                    <SettingButton
                      onClick={() => selectVideoUser()}
                      text="当前在线"
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
      </div>
      {isShowUserList && (
        <MaskLayer>
          <UserList
            userList={roomUserList}
            closeUserList={changeIsShowUserList}
          ></UserList>
        </MaskLayer>
      )}
    </>
  );
}

export default Home;

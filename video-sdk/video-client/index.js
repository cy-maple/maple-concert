import { io } from "socket.io-client";
// 发起连接请求
class EasyVideo {
  constructor(args) {
    this.url = args.url;
    this.room = args.room;
    this.user = args.user;
    this.ICEconfig = args.ICEconfig;
    this.localVideo = args.localVideo;
    this.remoteVideo = args.remoteVideo;
    this.isJoinVideo = false;
    this.peerConnections = {};
    this.roomVideoUserList = [];
    this.localstream = null;
  }
  getUserList() {
    return this.roomVideoUserList;
  }
  initSocket() {
    this.socket = io(this.url, {
      query: {
        room: this.room,
        user: this.user,
      },
    });
    this.socket.on("initVideoUserList", (userArr) => {
      this.roomVideoUserList = userArr;
      console.log(this.roomVideoUserList);
    });
    // 更新peerConnection
    this.socket.on("joinVideo", (user) => {
      if (this.isJoinVideo) {
        this.createPeerConnection(user);
        setTimeout(() => {
          this.createOffer(user);
        }, 3000);
      }
    });
  }
  createOffer(remoteUser) {
    // 创建offer，发起连接
    console.log("创建offer完成", this.user);
    this.peerConnections[remoteUser]
      .createOffer()
      .then((offer) => {
        return this.peerConnections[remoteUser].setLocalDescription(offer);
      })
      .then(() => {
        this.socket.emit(
          "offer",
          this.user,
          remoteUser,
          this.peerConnections[remoteUser].localDescription
        );
      });
    // 发送ICE候选
    this.peerConnections[remoteUser].onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("candidate", this.user, remoteUser, event.candidate);
      }
      return this.peerConnections;
    };
  }
  createPeerConnection(remoteUser) {
    this.peerConnections[remoteUser] = new RTCPeerConnection({
      iceServers: this.ICEconfig,
    });
    // 将本地媒体流的轨道添加进RTCPeerConnection
    this.localstream.getTracks().forEach((track) => {
      this.peerConnections[remoteUser].addTrack(track, this.localstream);
    });
    // SDP协商完成，接受到远程轨道时的hook
    this.peerConnections[remoteUser].ontrack = (event) => {
      this.remoteVideo[remoteUser].srcObject = event.streams[0];
    };
  }
  initPeerConnection() {
    for (const user of this.roomVideoUserList) {
      if (user !== this.user) {
        this.createPeerConnection(user);
      }
    }
  }
  joinVideo() {
    if (this.isJoinVideo) {
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.localstream = stream;
        // localVideo展示本地视频流
        this.localVideo.srcObject = stream;
        this.isJoinVideo = true;
        this.socket.emit("joinVideo", this.user);
        // 初始化peerConnection
        this.initPeerConnection();
        // 收到offer，回复answer
        this.socket.on("offer", (sendUser, receUser, offer) => {
          if (receUser !== this.user) {
            return;
          }
          console.log("收到offer", offer);
          this.peerConnections[sendUser].setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          this.peerConnections[sendUser]
            .createAnswer()
            .then((answer) => {
              return this.peerConnections[sendUser].setLocalDescription(answer);
            })
            .then(() => {
              this.socket.emit(
                "answer",
                this.user,
                sendUser,
                this.peerConnections[sendUser].localDescription
              );
            });
        });
        // 收到answer
        this.socket.on("answer", (sendUser, receUser, answer) => {
          if (receUser !== this.user) {
            return;
          }
          console.log("收到answer", answer);
          this.peerConnections[sendUser].setRemoteDescription(
            new RTCSessionDescription(answer)
          );
        });
        // 接受ICE候选
        this.socket.on("candidate", (sendUser, receUser, candidate) => {
          if (receUser !== this.user) {
            return;
          }
          this.peerConnections[sendUser].addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        });
      })
      .catch((error) => {
        console.log("获取本地流失败", error);
      });
  }
}

export default EasyVideo;

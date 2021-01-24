const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
let store = {}

const socket = io.connect("/")

const createRoom = () => {
  store.createRoom = document.getElementById("createRoom").value;
  socket.emit("socketRoom", { createRoom: store.createRoom })
}

const joinRoom = () => {
  store.joinRoom = document.getElementById("joinRoom").value;
  socket.emit("joinRoom", { joinRoom: store.joinRoom })
}

const config = {
  iceServers: [
    {
      "urls": "stun:stun.l.google.com:19302",
    },
  ]
}

const peerConnection = new RTCPeerConnection(config)

const shareVideo = async () => {
  try {

    const getLocalStream = await getMediaStream(),
      getTrack = extractTrack(getLocalStream);
    store['localStream'] = getLocalStream
    if(getTrack.length > 0){
      getTrack.forEach((data)=>{
        peerConnection.addTrack(data, getLocalStream)
      })
    }

    peerConnection.onicecandidate = sendIceCandidate
    peerConnection.ontrack = (event) => {
      console.log("localStream")
      console.log(event)
      addVideoStream(myVideo, event.streams[0])
    }

    let createOffer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(createOffer)
    socket.emit("createOffer", { offer: peerConnection.localDescription })

    socket.on("sendIceCandidate", async (data) => {
      try {
        if (data.candidate)
          peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
      }
      catch (err) {
        console.log(err)
      }
    })

  }
  catch (err) {
    console.log(err)
  }
}

const shareCall = async () => {

  let getVoice = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
  let addTrack = extractTrack(getVoice)

  if(store.localStream){
    store.localStream.addTrack(addTrack[0])
  }

  peerConnection.addTrack(addTrack[0],store.localStream)

  peerConnection.onnegotiationneeded = async() =>{
    try{
      peerConnection.onicecandidate = sendIceCandidate
      let creatingOffer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(creatingOffer)
      socket.emit("createOffer", { offer: {negotiation: true, data: peerConnection.localDescription} })
    }
    catch(err){
      console.log(err)
    }
  }

}

socket.on("sendAnswer", async (data) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
})

socket.on("roomJoined", () => {
  let onIceCandidate = []
  socket.on("sendIceCandidate", (data) => { if (data.candidate) onIceCandidate.push(data.candidate) })

  socket.on("sendOffer", async (data) => {

    if(data.offer.negotiation){
      let getVoice = await navigator.mediaDevices.getUserMedia({audio: true, video: false})
      let addTrack = extractTrack(getVoice)
      if(store.remoteStream){
        store.remoteStream.addTrack(addTrack[0])
      }
      peerConnection.addTrack(addTrack[0],store.remoteStream)
    }
    else {
      const getLocalStream = await getMediaStream(),
        getTrack = extractTrack(getLocalStream)
      store['remoteStream'] = getLocalStream

      if (getTrack.length > 0) {
        getTrack.forEach((data) => {
          peerConnection.addTrack(data, getLocalStream)
        })
      }
    }

    peerConnection.onicecandidate = sendIceCandidate
    peerConnection.ontrack = (event) => {
      console.log("remoteStream")
      console.log(event)
      addVideoStream(myVideo, event.streams[0])
    }

    if(data.offer.negotiation){
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer.data))
    }else{
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
    }

    if (onIceCandidate.length > 0) {
      onIceCandidate.forEach((data) => {
        peerConnection.addIceCandidate(new RTCIceCandidate(data))
      })
    }

    let createAnswer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(createAnswer)

    socket.emit("createAnswer", { answer: peerConnection.localDescription })
  })

})

async function getMediaStream() {
  let getDisplay = await navigator.mediaDevices.getDisplayMedia({ audio: false, video: true })
  return getDisplay
}

function extractTrack(track) {
  let extractingTrack = track.getTracks()
  return extractingTrack
}

async function sendIceCandidate(event) {
  if (event.candidate) {
    socket.emit("candidate", { candidate: event.candidate })
  }
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}

import { Box, Button } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import SingleChat from "./SingleChat";
import io from "socket.io-client"; // Import socket.io-client

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, user } = ChatState();
  const navigate = useNavigate();

  // Video call state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize socket
  const socket = useRef(null);

  // Function to get user media (camera and microphone)
  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices", error);
    }
  };

  useEffect(() => {
    // Initialize socket connection
    socket.current = io("http://localhost:8080", {
      withCredentials: true, // Use cookies for authentication if necessary
    });

    // Cleanup socket connection on unmount
    return () => {
      socket.current.disconnect();
    };
  }, []);

  // Function to create a peer connection
  const createPeerConnection = (userId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302", // Google's public STUN server
        },
      ],
    });

    // Add local stream to the peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Handle incoming ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current.emit("ice-candidate", event.candidate, userId);
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    setPeerConnection(pc);
    return pc;
  };

  // Function to handle call initiation
  const initiateCall = async (recipientId) => {
    // Get user media only when a video call is initiated
    await getUserMedia();

    const pc = createPeerConnection(recipientId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send the offer to the recipient
    socket.current.emit("video-call-offer", offer, recipientId);
    setIsCalling(true);
  };

  // Function to handle receiving an offer and answering the call
  const answerCall = async (offer, callerId) => {
    const pc = createPeerConnection(callerId);

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Send the answer back to the caller
    socket.current.emit("video-call-answer", answer, callerId);
  };

  // Handle incoming video call offer
  useEffect(() => {
    socket.current.on("video-call-offer", async (offer, callerId) => {
      const userWantsToAnswer = window.confirm("Incoming call. Answer?");
      if (userWantsToAnswer) {
        await answerCall(offer, callerId);
      }
    });

    // Handle incoming video call answer
    socket.current.on("video-call-answer", (answer, callerId) => {
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // Handle ICE candidate exchange
    socket.current.on("ice-candidate", (candidate, userId) => {
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  }, [peerConnection]);

  // Function to end the call
  const endCall = () => {
    if (peerConnection) {
      peerConnection.close();
    }
    setPeerConnection(null);
    localStream.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
  };

  return (
    <Box
      sx={{
        display: selectedChat ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        padding: 2,
        backgroundColor: "#fff",
        width: "100%",
        height: "100%",
        minHeight: "640px",
        maxHeight: "640px",
        marginTop: "4px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          mb: 2,
        }}
      >
        {!isCalling ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => initiateCall(selectedChat.user._id)}
            sx={{ fontSize: "0.85rem" }}
          >
            Video Call
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            onClick={endCall}
            sx={{ fontSize: "0.85rem" }}
          >
            End Call
          </Button>
        )}
      </Box>

      {/* Local Video */}
      {localStream && (
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{
            width: "180px",
            height: "140px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        />
      )}

      {/* Remote Video */}
      {remoteStream && (
        <video
          ref={remoteVideoRef}
          autoPlay
          style={{
            width: "360px",
            height: "270px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        />
      )}

      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;

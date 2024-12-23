import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import socket from "./videocalling/socket";
import { useNavigate } from "react-router-dom";
import SingleChat from "./SingleChat";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, user } = ChatState();
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleIncomingCall = ({ senderId, roomId }) => {
      setIncomingCall({ senderId, roomId });
    };

    socket.on("incoming video call", handleIncomingCall);

    return () => {
      socket.off("incoming video call", handleIncomingCall);
    };
  }, []);

  const handleAcceptCall = () => {
    if (incomingCall) {
      navigate(`/video-call/${incomingCall.roomId}`);
      setIncomingCall(null);
    }
  };

  const handleRejectCall = () => {
    setIncomingCall(null);
  };

  const handleVideoCall = () => {
    if (!selectedChat || !user) return;

    const recipientId = selectedChat.users.find((u) => u._id !== user._id)._id;

    socket.emit("video call request", {
      senderId: user._id,
      recipientId,
      roomId: selectedChat._id,
    });
  };

  return (
    <Box
      sx={{
        display: selectedChat ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
        backgroundColor: "#fff",
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      {incomingCall && (
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            padding: 3,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            borderRadius: "8px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            User {incomingCall.senderId} is calling you!
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAcceptCall}
            >
              Accept
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleRejectCall}
            >
              Reject
            </Button>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          mb: 2,
        }}
      >
        <Button variant="contained" color="primary" onClick={handleVideoCall}>
          Video Call
        </Button>
      </Box>
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;

import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import socket from "./videocalling/socket"; // Ensure this is your socket instance
import { useNavigate } from "react-router-dom"; // Assuming you're using react-router-dom for navigation
import SingleChat from "./SingleChat";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat, user } = ChatState();
  const [incomingCall, setIncomingCall] = useState(null); // State to manage incoming call notifications
  const navigate = useNavigate();

  useEffect(() => {
    console.log(user._id);
    // Listen for incoming video call requests once, and keep it active
    const handleIncomingCall = ({ senderId, roomId }) => {
      console.log("Incoming call from:", senderId); // This will log when the event is triggered
      setIncomingCall({ senderId, roomId });
    };
    // Attach the listener to the socket
    socket.on("incoming video call", handleIncomingCall);

    // Clean up listener when the component is unmounted or the socket connection is no longer needed
    return () => {
      socket.off("incoming video call", handleIncomingCall);
    };
  }, []); // Empty array ensures the effect is only run once on mount

  const handleAcceptCall = () => {
    if (incomingCall) {
      navigate(`/video-call/${incomingCall.roomId}`);
      setIncomingCall(null); // Clear incoming call state after accepting
    }
  };

  const handleRejectCall = () => {
    setIncomingCall(null); // Clear incoming call state after rejecting
  };

  const handleVideoCall = () => {
    if (!selectedChat || !user) return;

    const recipientId = selectedChat.users.find((u) => u._id !== user._id)._id;

    // Emit video call request to recipient
    socket.emit("video call request", {
      senderId: user._id,
      recipientId,
      roomId: selectedChat._id, // Using chat ID as the room ID
    });

    console.log(`Video call request sent to user ${recipientId}`);
  };

  return (
    <Box
      sx={{
        display: selectedChat ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
        backgroundColor: "white",
        width: { xs: "100%", md: "68%" },
        borderRadius: "8px",
        borderWidth: 1,
        borderColor: "divider",
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

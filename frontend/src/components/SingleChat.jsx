import {
  FormControl,
  Input,
  IconButton,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useEffect, useState } from "react";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import io from "socket.io-client";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";

const ENDPOINT = "http://localhost:3000";
let socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:3000/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");

        const { data } = await axios.post(
          "http://localhost:3000/api/message",
          {
            content: newMessage,
            chatId: selectedChat,
          },
          config
        );

        socket.emit("new message", data);

        // Append the new message to the current state
        setMessages((prevMessages) => [...prevMessages, data]);
      } catch (error) {
        console.error("Error sending message", error);
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;

    return () => {
      selectedChatCompare = null;
    };
  }, [selectedChat]);

  useEffect(() => {
    const messageListener = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    };

    socket.on("message received", messageListener);

    return () => {
      socket.off("message received", messageListener);
    };
  }, [notification, fetchAgain]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    const timerLength = 3000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Typography
            variant="h6"
            sx={{
              fontSize: { base: "1.75rem", md: "1.875rem" },
              pb: 3,
              px: 2,
              width: "100%",
              fontFamily: "Work sans",
              display: "flex",
              justifyContent: { base: "space-between" },
              alignItems: "center",
            }}
          >
            <IconButton
              sx={{ display: { base: "flex", md: "none" } }}
              icon={<ArrowBack />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              p: 3,
              bgColor: "#E8E8E8",
              width: "100%",
              height: "100%",
              borderRadius: "lg",
              overflowY: "hidden",
            }}
          >
            {loading ? (
              <CircularProgress
                size={80}
                sx={{ alignSelf: "center", margin: "auto" }}
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} sx={{ mt: 3 }} required>
              {isTyping && (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              )}
              <Input
                sx={{ backgroundColor: "#E0E0E0" }}
                placeholder="Enter a message..."
                value={newMessage}
                onChange={typingHandler}
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Typography variant="h3" sx={{ pb: 3, fontFamily: "Work sans" }}>
            Click on a user to start chatting
          </Typography>
        </Box>
      )}
    </>
  );
};

export default SingleChat;

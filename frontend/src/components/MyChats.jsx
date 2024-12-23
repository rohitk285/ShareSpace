import { Add } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats = [],
    setChats,
  } = ChatState();

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        "http://localhost:3000/api/chat",
        config
      );

      if (Array.isArray(data)) {
        setChats(data);
      } else {
        console.error("Error: API returned non-array data", data);
        setChats([]);
      }
    } catch (error) {
      alert("Error: Failed to load the chats");
      setChats([]);
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <Box className="flex flex-col p-4 bg-white w-full rounded-lg">
      {/* Header */}
      <Box
        className="flex justify-between items-center pb-4 px-3 font-semibold text-xl"
        sx={{ borderBottom: "1px solid #e0e0e0", marginBottom: "10px" }}
      >
        <Typography variant="h6">Chats</Typography>
        <GroupChatModal>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            className="text-sm"
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      {/* Chat List */}
      <Box className="flex flex-col h-full rounded-lg overflow-hidden">
        {Array.isArray(chats) && chats.length > 0 ? (
          <Stack className="overflow-y-auto">
            {chats.map((chat, index) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`cursor-pointer px-3 py-2 ${
                  selectedChat === chat
                    ? "bg-gray-300 text-black"
                    : "bg-white text-black"
                }`}
                sx={{
                  borderBottom: "1px solid #e0e0e0", // Thin line between chats
                  transition: "background-color 0.2s ease",
                  display: "flex", // Ensures proper alignment
                  flexDirection: "column", // Align items vertically
                  justifyContent: "center", // Center content vertically
                  height: "60px", // Uniform height for all chat boxes
                  "&:hover": {
                    backgroundColor:
                      selectedChat === chat ? "#d6d6d6" : "#f5f5f5",
                  },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Typography>
                {chat.latestMessage && (
                  <Typography variant="body2" className="text-xs text-gray-500">
                    <b>{chat.latestMessage.sender.name}: </b>
                    {chat.latestMessage.content.length > 50
                      ? chat.latestMessage.content.substring(0, 51) + "..."
                      : chat.latestMessage.content}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;

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
  const { selectedChat, setSelectedChat, user, chats = [], setChats } = ChatState(); // Default chats to []

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("http://localhost:3000/api/chat", config);

      // Validate and set chats
      // to check if chats is a array
      if (Array.isArray(data)) {
        setChats(data);
      } else {
        console.error("Error: API returned non-array data", data);
        setChats([]); // Fallback to empty array if API response is not an array
      }
    } catch (error) {
      alert("Error: Failed to load the chats");
      setChats([]); // Fallback to empty array on error
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box className="flex flex-col p-4 bg-white w-full md:w-1/3 rounded-lg border border-gray-300">
      <Box className="flex justify-between items-center pb-4 px-3 font-semibold text-xl md:text-2xl">
        <Typography variant="h6">My Chats</Typography>
        <GroupChatModal>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            className="text-xs md:text-sm lg:text-base"
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <Box className="flex flex-col p-3 bg-gray-100 h-full rounded-lg overflow-hidden">
        {Array.isArray(chats) && chats.length > 0 ? ( // Ensure chats is an array and not empty
          <Stack className="overflow-y-auto">
            {chats.map((chat) => (
              <Box
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`cursor-pointer px-3 py-2 rounded-lg mb-2 ${
                  selectedChat === chat
                    ? "bg-teal-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                <Typography variant="body1">
                  {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                </Typography>
                {chat.latestMessage && (
                  <Typography variant="body2" className="text-xs">
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

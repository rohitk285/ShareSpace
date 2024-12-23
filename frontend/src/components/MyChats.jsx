import { Add, Search as SearchIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  Typography,
  Drawer,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { getSender } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import UserListItem from "../components/userAvatar/UserListItem";

const MyChats = ({ fetchAgain }) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loggedUser, setLoggedUser] = useState();
  const [openDrawer, setOpenDrawer] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats = [],  //default value of [] is set if chats is null
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

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "http://localhost:3000/api/chat",
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      setOpenDrawer(false);
    } catch (error) {
      toast.error("Error fetching the chat", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    }
  };

  const handleSearch = async (value) => {
    setSearch(value);
    if (!value) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:3000/api/user?search=${value}`,
        config
      );
      setSearchResult(data);
      setLoading(false);
    } catch (error) {
      toast.error("Error occurred while fetching search results", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
      setLoading(false);
    }
  };

  return (
    <>
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
              size="small"
              sx={{ padding: "5px 10px", fontSize: "0.8rem" }}
            >
              New Group Chat
            </Button>
          </GroupChatModal>
        </Box>

        <Button
          variant="text"
          onClick={() => setOpenDrawer(true)}
          className="flex items-center"
          sx={{ justifyContent: "flex-start" }}
        >
          <SearchIcon fontSize="small" />
          <span className="ml-2 hidden md:inline">Search User</span>
        </Button>

        {/* Chat List */}
        <Box className="flex flex-col h-full rounded-lg overflow-hidden">
          {Array.isArray(chats) && chats.length > 0 ? (
            <Stack className="overflow-y-auto">
              {chats.map((chat) => (
                <Box
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`cursor-pointer px-3 py-2 ${
                    selectedChat === chat
                      ? "bg-gray-300 text-black"
                      : "bg-white text-black"
                  }`}
                  sx={{
                    borderBottom: "1px solid #e0e0e0",
                    transition: "background-color 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "60px",
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
                    <Typography
                      variant="body2"
                      className="text-xs text-gray-500"
                    >
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

      <Drawer
        anchor="left"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <Box className="p-4 w-80">
          <TextField
            label="Search by name or email"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="mb-4"
          />

          {loading ? (
            <ChatLoading />
          ) : (
            searchResult?.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                handleFunction={() => accessChat(user._id)}
              />
            ))
          )}

          {loadingChat && <CircularProgress className="mx-auto" />}
        </Box>
      </Drawer>
    </>
  );
};

export default MyChats;

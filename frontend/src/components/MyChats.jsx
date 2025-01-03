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
import CryptoJS from "crypto-js";

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
    chats = [], //default value of [] is set if chats is null
    setChats,
  } = ChatState();

  // Function to decrypt a message
  const decryptMessage = (encryptedMessage) => {
    const bytes = CryptoJS.AES.decrypt(
      encryptedMessage,
      import.meta.env.VITE_SECRET_KEY
    );
    const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedMessage;
  };

  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      let { data } = await axios.get("http://localhost:8080/api/chat", config);

      if (Array.isArray(data)) {
        const decryptedChats = data.map((obj) => {
          if (obj.latestMessage && obj.latestMessage.content) {
            try {
              // Decrypt the content if it exists
              obj.latestMessage.content = decryptMessage(
                obj.latestMessage.content
              );
            } catch (decryptionError) {
              console.error(
                "Decryption failed for message:",
                obj.latestMessage.content,
                decryptionError
              );
              obj.latestMessage.content = "Error decrypting message.";
            }
          }
          return obj; // Return the updated object
        });

        setChats(decryptedChats);
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
        "http://localhost:8080/api/chat",
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
        `http://localhost:8080/api/user?search=${value}`,
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
      <Box
        className="flex flex-col p-4 bg-white w-full rounded-lg"
        sx={{
          marginTop: "4px",
          height: "100%",
          minHeight: "640px",
          maxHeight: "640px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <Box
          className="flex justify-between items-center pb-4 px-3 font-semibold text-xl"
          sx={{
            borderBottom: "1px solid #e0e0e0",
            marginBottom: "10px",
          }}
        >
          <Typography variant="h4" sx={{fontFamily: "Oswald"}}>Chats</Typography>
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
          sx={{ justifyContent: "flex-start", marginBottom: "10px" }}
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
                  <Typography variant="body1" sx={{ fontWeight: "bold", fontFamily: "Open Sans" }}>
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Typography>
                  {chat.latestMessage && (
                    <Typography
                      variant="body2"
                      className="text-sm text-gray-500"
                      sx={{fontFamily: "Mulish", fontWeight: "bold"}}
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

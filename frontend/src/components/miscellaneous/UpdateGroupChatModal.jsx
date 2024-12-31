import {
  Modal,
  Box,
  IconButton,
  Input,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { AddCircleOutline, Close } from "@mui/icons-material";
import { useState } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) return;

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(
        `http://localhost:8080/api/user?search=${search}`,
        config
      );
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      alert("Error occurred! Failed to load the search results");
    }
  };

  const handleRename = async () => {
    if (!groupChatName || !selectedChat || !selectedChat._id) return;

    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `http://localhost:8080/api/chat/rename`,
        { chatId: selectedChat._id, chatName: groupChatName },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      setRenameLoading(false);
      alert("Error occurred! " + error.response.data.message);
    }
    setGroupChatName("");
  };

  const handleAddUser = async (user1) => {
    if (!selectedChat) return;

    if (selectedChat.users.find((u) => u._id === user1._id)) {
      alert("User already in group!");
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      alert("Only admins can add someone!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `http://localhost:8080/api/chat/groupadd`,
        { chatId: selectedChat._id, userId: user1._id },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Error occurred! " + error.response.data.message);
    }
  };

  const handleRemove = async (user1) => {
    if (!selectedChat) return;

    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      alert("Only admins can remove someone!");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `http://localhost:8080/api/chat/groupremove`,
        { chatId: selectedChat._id, userId: user1._id },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Error occurred! " + error.response.data.message);
    }
  };

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)} aria-label="Open Modal">
        <AddCircleOutline />
      </IconButton>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-labelledby="group-chat-modal"
        aria-describedby="update-group-chat"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: 24,
            padding: 4,
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={() => setIsOpen(false)}
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              color: "gray",
            }}
            aria-label="Close Modal"
          >
            <Close />
          </IconButton>

          {selectedChat && selectedChat.chatName ? (
            <>
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  marginBottom: 2,
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                }}
              >
                {selectedChat.chatName}
              </Typography>

              <Box
                sx={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  marginBottom: 2,
                }}
              >
                {selectedChat.users.map((u) => (
                  <Box
                    key={u._id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      padding: "6px",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                      marginBottom: 1,
                    }}
                  >
                    <Typography variant="body2">{u.name}</Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(u)}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: "flex", marginBottom: 2 }}>
                <Input
                  fullWidth
                  placeholder="Chat Name"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRename}
                  disabled={renameloading}
                  sx={{ marginLeft: 1 }}
                >
                  {renameloading ? <CircularProgress size={24} /> : "Update"}
                </Button>
              </Box>

              <Input
                fullWidth
                placeholder="Add User to group"
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ marginBottom: 2 }}
              />

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress />
                </Box>
              ) : (
                searchResult.map((user) => (
                  <Box
                    key={user._id}
                    onClick={() => handleAddUser(user)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#f5f5f5",
                      borderRadius: "4px",
                      padding: "6px",
                      cursor: "pointer",
                      marginBottom: 1,
                      "&:hover": { backgroundColor: "#e0e0e0" },
                    }}
                  >
                    <Typography variant="body2">{user.name}</Typography>
                    <Typography variant="body2" color="primary">
                      Add
                    </Typography>
                  </Box>
                ))
              )}

              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => handleRemove(user)}
                sx={{ marginTop: 2 }}
              >
                Leave Group
              </Button>
            </>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;

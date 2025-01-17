import {
  Modal,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, chats, setChats } = ChatState();

  const handleGroup = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      alert("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

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
      alert("Error occurred! Failed to load the search results.");
    }
  };

  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers.length) {
      alert("Please fill all the fields");
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        "http://localhost:8080/api/chat/group",
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
          userId: user._id,
        },
        config
      );
      setChats([data, ...chats]);
      setIsOpen(false);
      alert("New Group Chat Created!");
    } catch (error) {
      alert("Failed to Create the Chat!");
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        aria-labelledby="group-chat-modal"
        aria-describedby="create-group-chat-modal"
      >
        <Box
          className="modal-content"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "70%", md: "50%" },
            backgroundColor: "white",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            maxHeight: "80vh", // Limit height of modal
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Typography variant="h5" align="center" sx={{ mb: 2 }}>
            Create Group Chat
          </Typography>

          {/* Scrollable content area */}
          <Box
            sx={{
              overflowY: "auto",
              flexGrow: 1, // Allows scrolling within the content area
              pr: 1, // Add padding to prevent clipping near the scrollbar
            }}
          >
            <TextField
              label="Chat Name"
              variant="outlined"
              fullWidth
              onChange={(e) => setGroupChatName(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Add Users"
              variant="outlined"
              fullWidth
              onChange={(e) => handleSearch(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", flexWrap: "wrap", mb: 2 }}>
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={u._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>

            {loading ? (
              <CircularProgress sx={{ display: "block", mx: "auto", mb: 2 }} />
            ) : (
              searchResult
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Create Chat
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default GroupChatModal;

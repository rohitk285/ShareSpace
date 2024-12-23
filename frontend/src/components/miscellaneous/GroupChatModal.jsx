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
        const { data } = await axios.get(`http://localhost:3000/api/user?search=${search}`, config);
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
          'http://localhost:3000/api/chat/group',
          {
            name: groupChatName,
            users: JSON.stringify(selectedUsers.map((u) => u._id)),
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
  
        <Modal open={isOpen} onClose={() => setIsOpen(false)} aria-labelledby="group-chat-modal" aria-describedby="create-group-chat-modal">
          <Box className="modal-content w-96 p-6 bg-white rounded-lg shadow-xl">
            <Typography variant="h5" className="text-center mb-4">
              Create Group Chat
            </Typography>
  
            <TextField
              label="Chat Name"
              variant="outlined"
              fullWidth
              className="mb-4"
              onChange={(e) => setGroupChatName(e.target.value)}
            />
  
            <TextField
              label="Add Users (e.g., John, Piyush, Jane)"
              variant="outlined"
              fullWidth
              className="mb-4"
              onChange={(e) => handleSearch(e.target.value)}
            />
  
            <Box className="flex flex-wrap mb-4">
              {selectedUsers.map((u) => (
                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
              ))}
            </Box>
  
            {loading ? (
              <CircularProgress />
            ) : (
              searchResult?.slice(0, 4).map((user) => (
                <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
              ))
            )}
  
            <Box className="flex justify-center mt-6">
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
  
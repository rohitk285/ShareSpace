import { Modal, Box, IconButton, Input, Button, CircularProgress } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material'; // Example MUI icon, replace as needed
import { useState } from 'react';
import axios from 'axios';
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../userAvatar/UserBadgeItem';
import UserListItem from '../userAvatar/UserListItem';

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState('');
  const [search, setSearch] = useState('');
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
      const { data } = await axios.get(`http://localhost:3000/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      alert('Error occurred! Failed to load the search results');
    }
  };

  const handleRename = async () => {
    if (!groupChatName || !selectedChat || !selectedChat._id) return;

    try {
      setRenameLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `http://localhost:3000/api/chat/rename`,
        { chatId: selectedChat._id, chatName: groupChatName },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      setRenameLoading(false);
      alert('Error occurred! ' + error.response.data.message);
    }
    setGroupChatName('');
  };

  const handleAddUser = async (user1) => {
    if (!selectedChat) return;

    if (selectedChat.users.find((u) => u._id === user1._id)) {
      alert('User already in group!');
      return;
    }

    if (selectedChat.groupAdmin._id !== user._id) {
      alert('Only admins can add someone!');
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `http://localhost:3000/api/chat/groupadd`,
        { chatId: selectedChat._id, userId: user1._id },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Error occurred! ' + error.response.data.message);
    }
  };

  const handleRemove = async (user1) => {
    if (!selectedChat) return;

    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      alert('Only admins can remove someone!');
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `http://localhost:3000/api/chat/groupremove`,
        { chatId: selectedChat._id, userId: user1._id },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Error occurred! ' + error.response.data.message);
    }
  };

  return (
    <>
      <IconButton onClick={() => setIsOpen(true)} aria-label="Open Modal">
        <AddCircleOutline />
      </IconButton>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} aria-labelledby="group-chat-modal" aria-describedby="update-group-chat">
        <Box className="w-96 p-4 bg-white rounded-lg shadow-lg">
          {/* Ensure selectedChat is available before accessing its properties */}
          {selectedChat && selectedChat.chatName ? (
            <>
              <Box className="text-center text-xl font-semibold mb-3">{selectedChat.chatName}</Box>

              <Box className="flex flex-col items-center">
                <div className="w-full flex flex-wrap pb-3">
                  {selectedChat.users.map((u) => (
                    <UserBadgeItem key={u._id} user={u} admin={selectedChat.groupAdmin} handleFunction={() => handleRemove(u)} />
                  ))}
                </div>

                <div className="flex w-full mb-3">
                  <Input
                    className="w-full"
                    placeholder="Chat Name"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />
                  <Button
                    className="ml-2"
                    variant="contained"
                    color="primary"
                    onClick={handleRename}
                    disabled={renameloading}
                  >
                    {renameloading ? <CircularProgress size={24} /> : 'Update'}
                  </Button>
                </div>

                <div className="w-full mb-3">
                  <Input
                    className="w-full"
                    placeholder="Add User to group"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center"><CircularProgress /></div>
                ) : (
                  searchResult.map((user) => (
                    <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />
                  ))
                )}
              </Box>

              <Box className="w-full flex justify-between mt-3">
                <Button variant="contained" color="secondary" onClick={() => handleRemove(user)}>
                  Leave Group
                </Button>
              </Box>
            </>
          ) : (
            <CircularProgress /> // Show a loading spinner while waiting for selectedChat
          )}
        </Box>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;

import { Badge, IconButton, Menu, MenuItem, MenuList, Avatar, TextField, Drawer, Box, CircularProgress, Button } from '@mui/material';
import { Notifications as BellIcon } from '@mui/icons-material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProfileModal from './ProfileModal';
import ChatLoading from '../ChatLoading';
import { ChatState } from '../../Context/ChatProvider';
import UserListItem from '../userAvatar/UserListItem';

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // State to control Menu open/close for notifications
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null); // State to control Menu open/close for profile menu

  const { setSelectedChat, user, notification, setNotification, chats, setChats } = ChatState();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast.error("Please enter something in search", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`http://localhost:3000/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast.error("Error occurred while fetching search results", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post('http://localhost:3000/api/chat', { userId }, config);

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

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget); // Open notification menu on icon click
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close notification menu
  };

  const handleProfileMenuClick = (event) => {
    setProfileMenuAnchorEl(event.currentTarget); // Open profile menu on avatar click
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null); // Close profile menu
  };

  return (
    <>
      <Box className="flex justify-between items-center bg-white p-4 border-b-4 border-gray-200"
      style={{height: '60px'}}>
        <Button variant="text" onClick={() => setOpenDrawer(true)} className="flex items-center">
          <SearchIcon />
          <span className="ml-2 hidden md:inline">Search User</span>
        </Button>

        <h1 className="text-2xl font-sans">ShareSpace</h1>

        <div className="flex items-center">
          <IconButton onClick={handleMenuClick}>
            <Badge badgeContent={notification.length} color="error">
              <BellIcon fontSize="large" />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)} // Use the state to control the open prop
            onClose={handleMenuClose}
          >
            <MenuList>
              {!notification.length && <MenuItem>No New Messages</MenuItem>}
              {notification.map((notif) => (
                <MenuItem key={notif._id} onClick={() => {
                  setSelectedChat(notif.chat);
                  setNotification(notification.filter((n) => n !== notif));
                  handleMenuClose(); // Close the menu after selection
                }} >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <IconButton onClick={handleProfileMenuClick}>
            <Avatar className="cursor-pointer" src={user.pic} alt={user.name} />
          </IconButton>

          <Menu
            anchorEl={profileMenuAnchorEl}
            open={Boolean(profileMenuAnchorEl)} // Use the state to control the open prop
            onClose={handleProfileMenuClose}
          >
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer anchor="left" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <Box className="p-4 w-80">
          <TextField
            label="Search by name or email"
            variant="outlined"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleSearch} variant="contained" color="primary" fullWidth className="mb-4">
            Go
          </Button>

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
}

export default SideDrawer;

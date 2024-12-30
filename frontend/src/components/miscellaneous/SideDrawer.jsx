import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Avatar,
  Box,
  Button,
} from "@mui/material";
import { Notifications as BellIcon } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogics";

function SideDrawer() {
  const [anchorEl, setAnchorEl] = useState(null); // Notification menu
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null); // Profile menu

  const {
    setSelectedChat,
    user,
    notification,
    setNotification
  } = ChatState();
  const navigate = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget); // Open notification menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Close notification menu
  };

  const handleProfileMenuClick = (event) => {
    setProfileMenuAnchorEl(event.currentTarget); // Open profile menu
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchorEl(null); // Close profile menu
  };

  return (
    <>
      <Box
        className="flex justify-between items-center bg-white p-4 border-b-4 border-gray-200 w-full"
        style={{ height: "60px", width: "100%" }}
      >
        <h1 className="text-2xl font-sans">ShareSpace</h1>

        <div className="flex items-center space-x-4">
          {/* Styled Buttons */}
          <Button
            onClick={() => navigate("/chats")}
            className="transition-all bg-transparent border-none hover:bg-gray-200 p-2 rounded-lg"
            style={{
              textTransform: "none",
              boxShadow: "none",
              position: "relative",
              color: "inherit",
            }}
          >
            Chats
          </Button>

          <Button
            onClick={() => navigate("/docs")}
            className="transition-all bg-transparent border-none hover:bg-gray-200 p-2 rounded-lg"
            style={{
              textTransform: "none",
              boxShadow: "none",
              position: "relative",
              color: "inherit",
            }}
          >
            Documents
          </Button>

          <Button
            onClick={() => navigate("/files")}
            className="transition-all bg-transparent border-none hover:bg-gray-200 p-2 rounded-lg"
            style={{
              textTransform: "none",
              boxShadow: "none",
              position: "relative",
              color: "inherit",
            }}
          >
            Files
          </Button>

          <IconButton onClick={handleMenuClick}>
            <Badge badgeContent={notification.length} color="error">
              <BellIcon fontSize="large" />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuList>
              {!notification.length && <MenuItem>No New Messages</MenuItem>}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                    handleMenuClose();
                  }}
                >
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
            open={Boolean(profileMenuAnchorEl)}
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
    </>
  );
}

export default SideDrawer;

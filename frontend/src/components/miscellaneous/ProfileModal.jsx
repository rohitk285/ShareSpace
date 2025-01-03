import { useState } from "react";
import { Modal, Box, Typography, IconButton, Button } from "@mui/material";
import Person from "@mui/icons-material/Person";

const ProfileModal = ({ user, children }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      {children ? (
        <span onClick={handleOpen}>{children}</span>
      ) : (
        <IconButton onClick={handleOpen}>
          <Person />
        </IconButton>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="profile-modal-title"
        aria-describedby="profile-modal-description"
      >
        <Box
          className="bg-white rounded-lg p-6 max-w-lg mx-auto mt-20"
          sx={{
            width: "80%",
            maxWidth: "600px",
            height: "auto",
            borderRadius: "16px",
            backgroundColor: "white",
          }}
        >
          <Typography
            id="profile-modal-title"
            variant="h4"
            align="center"
            sx={{
              fontFamily: "Work sans",
              fontSize: "32px",
              marginBottom: 2,
            }}
          >
            {user.name}
          </Typography>
          <Box className="flex flex-col items-center justify-between mb-4">
            <img
              className="rounded-full h-36 w-36 mb-4"
              src={user.pic}
              alt={user.name}
            />
            <Typography variant="h6" className="text-center">
              Email: {user.email}
            </Typography>
          </Box>
          <Box className="flex justify-center mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleClose}
              className="w-1/3"
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProfileModal;

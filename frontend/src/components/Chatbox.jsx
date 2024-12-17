import { Box } from '@mui/material';
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <Box
      sx={{
        display: selectedChat ? 'flex' : 'none', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: 3, 
        backgroundColor: 'white', 
        width: { xs: '100%', md: '68%' },
        borderRadius: '8px', 
        borderWidth: 1, 
        borderColor: 'divider',
      }}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;

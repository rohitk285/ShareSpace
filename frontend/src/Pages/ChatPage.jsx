import { Box, Grid } from "@mui/material";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div className="w-full h-screen">
      {user && <SideDrawer />}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          height: "91.5vh",
          padding: "10px",
          backgroundColor: "#00254d",
        }}
      >
        <Grid container spacing={2} sx={{ height: "100%" }}>
          <Grid
            item
            xs={12}
            md={3}
          >
            {user && <MyChats fetchAgain={fetchAgain} />}
          </Grid>
          <Grid
            item
            xs={12}
            md={9}
          >
            {user && (
              <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
            )}
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default Chatpage;

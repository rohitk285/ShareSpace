import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { Tab, Tabs, Box, Typography, Paper } from "@mui/material"; // Import Tab and Tabs from @mui/material
import { useState } from "react";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

function Homepage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));
    if (user) navigate("/chats");
  }, [navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <div className="flex flex-col items-center w-full h-full">
      <Paper
        elevation={3}
        className="flex justify-center p-4 bg-white w-full max-w-xl mt-10 rounded-lg border"
      >
        <Typography
          variant="h3"
          className="font-sans text-center"
          style={{ fontFamily: "Work Sans" }}
        >
          ShareSpace
        </Typography>
      </Paper>
      <Paper
        elevation={3}
        className="bg-white w-full max-w-xl mt-6 p-6 rounded-lg border"
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
        <div className="mt-4">
          {activeTab === 0 && (
            <TabPanel value={activeTab} index={0}>
              <Login />
            </TabPanel>
          )}
          {activeTab === 1 && (
            <TabPanel value={activeTab} index={1}>
              <Signup />
            </TabPanel>
          )}
        </div>
      </Paper>
    </div>
  );
}

export default Homepage;

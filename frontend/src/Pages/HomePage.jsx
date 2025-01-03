import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { Tab, Tabs, Box, Typography, Paper } from "@mui/material";
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
    <div className="flex flex-col items-center justify-center w-full h-screen bg-blue-50">
      <Paper
        elevation={3}
        className="flex justify-center p-6 bg-white w-full max-w-md mt-10 rounded-lg shadow-md"
      >
        <Typography
          variant="h2"
          className="font-sans text-center text-gray-800"
          style={{ fontFamily: "Bebas Neue" }}
        >
          ShareSpace
        </Typography>
      </Paper>
      <Paper
        elevation={3}
        className="bg-white w-full max-w-md mt-6 p-6 rounded-lg shadow-md"
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
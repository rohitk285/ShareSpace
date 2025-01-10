import { Avatar, Tooltip } from "@mui/material";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { useRef, useEffect } from "react";

const ScrollableChat = ({ messages, fetchOldMessages }) => {
  const { user } = ChatState();
  const scrollRef = useRef();

  // Detect if the user has scrolled to the top
  const handleScroll = () => {
    if (scrollRef.current) {
      // check if the scroll position is at the top
      if (scrollRef.current.scrollTop <= 1) {
        fetchOldMessages();
      }
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Format the timestamp in human-readable format
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12; // Convert 0 -> 12 for 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes}${ampm}`;
  };

  return (
    <div
      ref={scrollRef}
      style={{
        maxHeight: "70vh",
        overflowY: "auto",
        position: "relative", // Ensure the scrolling works correctly
      }}
    >
      <ScrollableFeed>
        {messages &&
          messages.map((m, i) => (
            <div className="flex" key={m._id} style={{ position: "relative" }}>
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) && (
                <Tooltip title={m.sender.name} arrow placement="bottom-start">
                  <Avatar
                    sx={{
                      marginTop: "7px",
                      marginRight: "8px",
                      cursor: "pointer",
                    }}
                    alt={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor:
                    m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0",
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: "15px", // Slightly smaller radius for a wider bubble
                  padding: "10px 20px", // Increased padding for better spacing
                  minWidth: "8%",
                  maxWidth: "85%", // Increased width
                  minHeight: "50px", // Increased height to prevent overlap
                  textAlign: "left", // Align text to the left
                  position: "relative",
                }}
                className="text-sm"
              >
                {m.content}
                <span
                  style={{
                    fontSize: "0.6rem", // Reduced font size for the timestamp
                    color: "#555",
                    position: "absolute",
                    bottom: "5px", // Position at the bottom inside the bubble
                    right: "10px", // Align to the right inside the bubble
                  }}
                >
                  {formatTime(m.updatedAt)}
                </span>
              </span>
            </div>
          ))}
      </ScrollableFeed>
    </div>
  );
};

export default ScrollableChat;

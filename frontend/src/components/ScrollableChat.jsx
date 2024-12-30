import { Avatar, Tooltip } from '@mui/material';
import ScrollableFeed from 'react-scrollable-feed';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider';
import { useRef, useEffect } from 'react';

const ScrollableChat = ({ messages, fetchOldMessages }) => {
  const { user } = ChatState();
  const scrollRef = useRef();

  // Detect if the user has scrolled to the top
  const handleScroll = () => {
    if (scrollRef.current) {
      if (scrollRef.current.scrollTop === 0) {
        // Trigger fetching older messages when scrolled to top
        fetchOldMessages();
      }
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div ref={scrollRef} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <ScrollableFeed>
        {messages &&
          messages.map((m, i) => (
            <div className="flex" key={m._id}>
              {(isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && (
                <Tooltip title={m.sender.name} arrow placement="bottom-start">
                  <Avatar
                    sx={{ marginTop: '7px', marginRight: '8px', cursor: 'pointer' }}
                    alt={m.sender.name}
                    src={m.sender.pic}
                  />
                </Tooltip>
              )}
              <span
                style={{
                  backgroundColor: m.sender._id === user._id ? '#BEE3F8' : '#B9F5D0',
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                  borderRadius: '20px',
                  padding: '5px 15px',
                  maxWidth: '75%',
                }}
                className="text-sm"
              >
                {m.content}
              </span>
            </div>
          ))}
      </ScrollableFeed>
    </div>
  );
};

export default ScrollableChat;

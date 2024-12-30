import React, { useState } from "react";
import VideoCall from "../components/videocalling/VideoCall";
import { v4 as uuidv4 } from "uuid";

const VideoCallPage = () => {
  const [roomId, setRoomId] = useState("");
  const [userId] = useState(() => uuidv4()); // Unique user ID
  const [inCall, setInCall] = useState(false);

  const joinRoom = () => {
    if (roomId) {
      setInCall(true);
    }
  };

  return (
    <div>
      {!inCall ? (
        <div>
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <VideoCall roomId={roomId} userId={userId} />
      )}
    </div>
  );
};

export default VideoCallPage;

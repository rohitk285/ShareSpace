import React, { useEffect, useRef, useState } from "react";
import socket from "./socket"; // Import Socket.IO connection

const VideoCall = ({ roomId, userId }) => {
  const [peers, setPeers] = useState([]);
  const userVideo = useRef();
  const peerConnections = useRef({});
  const videoGrid = useRef();

  useEffect(() => {
    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Set local stream
        if (userVideo.current) {
          userVideo.current.srcObject = stream;
        }

        // Join room
        socket.emit("join video room", { roomId, userId });

        // Listen for existing users in the room
        socket.on("user joined", (newUserId) => {
          const peer = createPeer(newUserId, socket.id, stream);
          peerConnections.current[newUserId] = peer;
        });

        // Handle receiving a signal
        socket.on("receive signal", ({ callerId, signal }) => {
          const peer = addPeer(signal, callerId, stream);
          peerConnections.current[callerId] = peer;
        });

        // Handle returned signal
        socket.on("receive returned signal", ({ signal, id }) => {
          const peer = peerConnections.current[id];
          if (peer) {
            peer.signal(signal);
          }
        });

        // Handle user leaving
        socket.on("user left", (id) => {
          if (peerConnections.current[id]) {
            peerConnections.current[id].destroy();
            delete peerConnections.current[id];
          }
          setPeers((prevPeers) => prevPeers.filter((peer) => peer.id !== id));
        });
      });

    // Cleanup on component unmount
    return () => {
      Object.values(peerConnections.current).forEach((peer) => peer.destroy());
      socket.emit("leave video room", { roomId, userId });
    };
  }, [roomId, userId]);

  // Create a peer for a new user
  const createPeer = (userToSignal, callerId, stream) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("send signal", { userToSignal, callerId, signal });
    });

    peer.on("stream", (stream) => {
      addVideoStream(stream, userToSignal);
    });

    return peer;
  };

  // Add a peer for a user who already exists
  const addPeer = (incomingSignal, callerId, stream) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("return signal", { signal, callerId });
    });

    peer.on("stream", (stream) => {
      addVideoStream(stream, callerId);
    });

    peer.signal(incomingSignal);

    return peer;
  };

  // Add a new video stream to the grid
  const addVideoStream = (stream, id) => {
    setPeers((prevPeers) => [...prevPeers, { id, stream }]);
  };

  return (
    <div>
      <div ref={videoGrid}>
        <video ref={userVideo} autoPlay playsInline muted />
        {peers.map((peer) => (
          <Video key={peer.id} peer={peer} />
        ))}
      </div>
    </div>
  );
};

// Video component to render each peer
const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.peer.on("stream", (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline />;
};

export default VideoCall;
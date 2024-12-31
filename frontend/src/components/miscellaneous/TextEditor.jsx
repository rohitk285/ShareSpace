import React, { useCallback, useEffect, useState } from "react";
import "quill/dist/quill.snow.css"; // quill editor styles
import Quill from "quill";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import DocumentNotExist from "./DocumentNotExist";
import Unauthorized from "./UnauthorizedDoc"; // Import Unauthorized component
import axios from "axios";
import './styles.css';

const saveInterval = 900;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

function TextEditor() {
  const { id: documentId } = useParams(); // helps access the id (uuid)
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const { user } = ChatState();
  const [documentExists, setDocumentExists] = useState(true); // State for checking if document exists
  const [hasAccess, setHasAccess] = useState(false); // State to track access
  const [loading, setLoading] = useState(true); // Track loading state

  // Access validation (creator or collaborator check)
  useEffect(() => {
    const validateAccess = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.post(
          "http://localhost:8080/api/document/getDocDetails",
          { docId: documentId },
          config
        );

        const collab = data.collaborators.map(collaborator => collaborator._id);
        if (data.documentType === 'public' || (data && (data.creator === user._id || collab.includes(user._id)))) {
          setHasAccess(true); // Grant access if user is creator or collaborator
        } else {
          setHasAccess(false); // Deny access if user is not creator or collaborator
        }
      } catch (err) {
        console.error("Access validation failed:", err);
        setHasAccess(false); // Deny access on error
      } finally {
        setLoading(false); // Stop loading
      }
    };

    validateAccess();
  }, [documentId, user]);

  // Socket connection setup
  useEffect(() => {
    if (hasAccess) {
      const socketConnection = io("http://localhost:8080");
      setSocket(socketConnection);

      return () => {
        socketConnection.disconnect();
      };
    }
  }, [hasAccess]);

  // Load document
  useEffect(() => {
    if (socket === null || quill === null) return;

    socket.once("load-document", (document) => {
      if (document) {
        quill.setContents(document.data);
        quill.enable(); // Enable the text editor
      } else {
        setDocumentExists(false); // Set documentExists to false if document is not found
      }
    });

    socket.emit("get-document", documentId, user);
  }, [socket, quill, documentId, user]);

  // Save document content periodically
  useEffect(() => {
    if (socket === null || quill === null) return;

    const intervalID = setInterval(() => {
      socket.emit("save-document", quill.getContents(), documentId);
    }, saveInterval);

    return () => clearInterval(intervalID);
  }, [socket, quill, documentId]);

  // Version control save every 15 minutes
  useEffect(() => {
    if (socket === null || quill === null) return;

    const versionIntervalID = setInterval(() => {
      socket.emit("version-control", quill.getContents());
    }, 15 * 60 * 1000);

    return () => clearInterval(versionIntervalID);
  }, [socket, quill]);

  // Handle real-time updates
  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleText = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handleText);

    return () => socket.off("receive-changes", handleText);
  }, [socket, quill]);

  // Emit changes to other clients
  useEffect(() => {
    if (socket === null || quill === null) return;

    const handleText = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handleText);

    return () => quill.off("text-change", handleText);
  }, [socket, quill]);

  // Initialize Quill editor
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper === null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const quillInstance = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });

    quillInstance.disable(); // Disable editor initially
    quillInstance.setText("Loading document ..."); // Placeholder text
    setQuill(quillInstance);
  }, []);

  // Render Unauthorized or TextEditor
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess) {
    return <Unauthorized />; // Show Unauthorized component if access is not granted
  }

  if (!documentExists) {
    return <DocumentNotExist />; // Show the DocumentNotExist component if the document doesn't exist
  }

  return <div className="container" ref={wrapperRef}></div>;
}

export default TextEditor;
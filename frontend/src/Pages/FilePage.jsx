import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineUpload } from "react-icons/ai";
import UploadFileModal from "../components/miscellaneous/UploadFileModal";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";

const FilePage = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]); // List of folders
  const [newFolderName, setNewFolderName] = useState(""); // Folder name for creation
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user } = ChatState();

  // Fetch files and folders from backend
  const fetchFilesAndFolders = async () => {
    try {
      if (user) {
        // console.log(user._id)
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          "http://localhost:3000/api/file/fetchFiles",
          { userId: user._id },
          config
        );
        // const { folderResponse } = await axios.post(
        //   "http://localhost:3000/api/file/fetchFiles",
        //   { userId: user._id },
        //   config
        // );
        console.log(data);
        setFiles(data);
        // setFolders(folderResponse);
      }
    } catch (err) {
      console.error("Could not fetch files or folders", err);
    }
  };

  useEffect(() => {
    fetchFilesAndFolders();
  }, [user]);

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName) {
      console.error("Folder name cannot be empty!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/folder/create",
        { name: newFolderName },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log("Folder created successfully:", response.data);
      setNewFolderName(""); // Clear folder input
      fetchFilesAndFolders(); // Refresh folder list
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  // Handle file selection for preview
  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  return (
    <div className="w-full h-screen">
      {user && <SideDrawer />}
      <h1 className="text-2xl font-bold mb-4">File Management</h1>

      {/* Create Folder Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Create New Folder</h2>
        <div className="flex items-center">
          <input
            type="text"
            placeholder="New Folder Name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="border px-4 py-2 rounded-md mr-2"
          />
          <button
            onClick={handleCreateFolder}
            className="bg-green-500 text-white px-4 py-2 rounded-md"
          >
            Create Folder
          </button>
        </div>
      </div>

      {/* Folder Listing Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Folders</h2>
        <div className="grid grid-cols-3 gap-4">
          {folders.length === 0 ? (
            <p>No folders yet. Create one!</p>
          ) : (
            folders.map((folder) => (
              <div
                key={folder._id}
                className="bg-white p-4 shadow rounded-md cursor-pointer"
              >
                <p className="font-bold">{folder.name}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* File Listing Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Files</h2>
          {/* Upload Files Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <AiOutlineUpload className="mr-2" />
            Upload Files
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {files.length === 0 ? (
            <p>No files uploaded yet. Start uploading!</p>
          ) : (
            files.map((file) => (
              <div key={file._id} className="bg-white p-4 shadow rounded-md">
                <p className="font-bold">{file.fileName}</p>

                {/* File preview logic */}
                {file.link.endsWith(".pdf") ? (
                  <iframe
                    src={file.link + "?content_disposition=inline"}
                    width="100%"
                    height="300px"
                    title="PDF Preview"
                  />
                ) : file.link.endsWith(".jpg") || file.link.endsWith(".png") ? (
                  <img
                    src={file.link + "?content_disposition=inline"}
                    alt="File Preview"
                    width="100%"
                    className="rounded-md"
                  />
                ) : (
                  <a
                    href={file.link} // The link will have content_disposition=inline
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View File
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for File Upload */}
      <UploadFileModal
        isVisible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={fetchFilesAndFolders}
      />
    </div>
  );
};

export default FilePage;

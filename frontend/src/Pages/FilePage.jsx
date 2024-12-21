import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineUpload } from "react-icons/ai";
import UploadFileModal from "../components/miscellaneous/UploadFileModal";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import ShareFileModal from "../components/miscellaneous/ShareFileModal";

const FilePage = () => {
  const [files, setFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = ChatState();

  // Fetch files and folders from backend
  const fetchFiles = async () => {
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
        setFiles(data);
      }
    } catch (err) {
      console.error("Could not fetch files or folders", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  return (
    <div className="w-full h-screen">
      {user && <SideDrawer />}
      <h1 className="text-2xl font-bold mb-4">File Management</h1>
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
        <div className="space-y-2">
          {files.length === 0 ? (
            <p>No files uploaded yet. Start uploading!</p>
          ) : (
            files.map((file) => (
              <div
                key={file._id}
                className="flex items-center justify-between bg-gray-100 p-4 rounded-md shadow"
              >
                <div className="flex items-center space-x-4">
                  {/* File Icon */}
                  {file.link.endsWith(".pdf") ? (
                    <img
                      src="/icons/pdf-icon.png" // Replace with the actual path to your PDF icon
                      alt="PDF Icon"
                      className="h-8 w-8"
                    />
                  ) : file.link.endsWith(".jpg") ||
                    file.link.endsWith(".png") ? (
                    <img
                      src="/icons/image-icon.png" // Replace with the actual path to your image icon
                      alt="Image Icon"
                      className="h-8 w-8"
                    />
                  ) : (
                    <img
                      src="/icons/file-icon.png" // Replace with the actual path to your file icon
                      alt="File Icon"
                      className="h-8 w-8"
                    />
                  )}

                  {/* File Name */}
                  <p className="font-semibold text-gray-800">{file.fileName}</p>
                </div>

                {/* File Actions */}
                <div className="flex items-center space-x-4">
                  <a
                    href={file.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View
                  </a>
                  {/* Share Button */}
                  <button
                    onClick={() => {
                      setSelectedFile(file);
                      setShowShareModal(true);
                    }}
                    className="bg-gray-300 px-2 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-400"
                  >
                    Share
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Share Modal */}
      <ShareFileModal
        isVisible={showShareModal}
        file={selectedFile}
        onClose={() => setShowShareModal(false)}
      />
      ;{/* Modal for File Upload */}
      <UploadFileModal
        isVisible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={fetchFiles}
      />
    </div>
  );
};

export default FilePage;

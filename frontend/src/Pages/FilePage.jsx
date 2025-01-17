import React, { useState, useEffect } from "react";
import axios from "axios";
import { AiOutlineUpload } from "react-icons/ai";
import UploadFileModal from "../components/miscellaneous/UploadFileModal";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import ShareFileModal from "../components/miscellaneous/ShareFileModal";
import imageIcon from "../../assets/imageIcon.png";
import pdfIcon from "../../assets/pdfIcon.png";

const FilePage = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]); // For uploaded files
  const [sharedFiles, setSharedFiles] = useState([]); // For shared files
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadedView, setIsUploadedView] = useState(true); // Toggle view state
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { user } = ChatState();

  // Fetch uploaded files from the backend
  const fetchUploadedFiles = async () => {
    try {
      if (user) {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          "http://localhost:8080/api/file/fetchUploadedFiles",
          { userId: user._id },
          config
        );
        setUploadedFiles(data);
      }
    } catch (err) {
      console.error("Could not fetch uploaded files", err);
    }
  };

  // Fetch shared files from the backend
  const fetchSharedFiles = async () => {
    try {
      if (user) {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.post(
          "http://localhost:8080/api/share-file/fetchSharedFiles",
          { userId: user._id },
          config
        );
        setSharedFiles(data);
      }
    } catch (err) {
      console.error("Could not fetch shared files", err);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsFetching(true); // Show the loading spinner
        await fetchUploadedFiles();
        await fetchSharedFiles();
        setIsFetching(false); // Hide the loading spinner
      };
      fetchData();
    }
  }, [user]);

  const deleteFile = async (fileId) => {
    setIsLoading(true);
    try {
      if (user) {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        await axios.post(
          "http://localhost:8080/api/file/deleteFile",
          { fileId: fileId },
          config
        );

        // Remove the deleted file from the state
        setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file._id !== fileId)
        );
      }
    } catch (err) {
      console.error("Could not delete file", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSharedFile = async (file) => {
    setIsLoading(true);
    try {
      if (user) {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        await axios.post(
          "http://localhost:8080/api/share-file/deleteSharedFile",
          {
            sharedFileId: file._id,
            originalFileId: file.originalFileId,
            userId: user._id,
          },
          config
        );

        // Remove the deleted file from the state
        setSharedFiles((prevFiles) =>
          prevFiles.filter((fileObj) => fileObj._id !== file._id)
        );
      }
    } catch (err) {
      console.error("Could not delete file", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 relative">
      {/* loading spinner for file fetching*/}
      {isFetching && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
          <div className="text-blue-500 text-xl font-semibold">
            Loading your files...
          </div>
        </div>
      )}

      {/* loading spinner for deletion */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-lg">Processing your request...</div>
        </div>
      )}

      {user && <SideDrawer />}

      {/* File Listing Section */}
      <div className="mb-6 px-4">
        <h1 className="font-bold text-2xl p-2 mb-4 mt-4">Your Files</h1>
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            {/* Toggle Buttons */}
            <button
              onClick={() => setIsUploadedView(true)}
              className={`px-3 py-1.5 rounded-md ${
                isUploadedView
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-800"
              } text-sm`}
            >
              Uploaded Files
            </button>
            <button
              onClick={() => setIsUploadedView(false)}
              className={`px-3 py-1.5 rounded-md ${
                !isUploadedView
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-800"
              } text-sm`}
            >
              Shared Files
            </button>
          </div>

          {/* Upload Files Button */}
          {isUploadedView && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-md flex items-center text-sm"
            >
              <AiOutlineUpload className="mr-2 text-base" />
              Upload Files
            </button>
          )}
        </div>

        {/* File Listing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {isUploadedView ? (
            // Uploaded Files View
            uploadedFiles.length === 0 ? (
              <p className="text-gray-600 text-center col-span-full text-sm">
                No files uploaded yet. Start uploading!
              </p>
            ) : (
              uploadedFiles.map((file) => (
                <div
                  key={file._id}
                  className="bg-white p-3 rounded-md shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {/* File Icon */}
                    {file.link.endsWith(".pdf") ? (
                      <img src={pdfIcon} alt="PDF Icon" className="h-8 w-8" />
                    ) : file.fileName.endsWith(".jpg") ||
                      file.fileName.endsWith(".png") ||
                      file.fileName.endsWith(".jpeg") ? (
                      <img
                        src={imageIcon}
                        alt="Image Icon"
                        className="h-8 w-8"
                      />
                    ) : (
                      <img
                        src="/icons/file-icon.png"
                        alt="File Icon"
                        className="h-8 w-8"
                      />
                    )}
                    {/* File Name */}
                    <p className="font-semibold text-gray-800 text-sm truncate">
                      {file.fileName}
                    </p>
                  </div>

                  {/* File Actions */}
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex space-x-3">
                      <a
                        href={file.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline text-sm"
                      >
                        View
                      </a>
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setShowShareModal(true);
                        }}
                        className="bg-gray-300 px-2 py-1 rounded-md text-xs text-gray-700 hover:bg-gray-400"
                      >
                        Share
                      </button>
                    </div>
                    <button
                      onClick={() => deleteFile(file._id)}
                      className="bg-gray-300 px-2 py-1 rounded-md text-xs text-gray-700 hover:bg-gray-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )
          ) : // Shared Files View
          sharedFiles.length === 0 ? (
            <p className="text-gray-600 text-center col-span-full text-sm">
              No files shared with you yet!
            </p>
          ) : (
            sharedFiles.map((file) => (
              <div
                key={file._id}
                className="bg-white p-3 rounded-md shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center space-x-3">
                  {/* File Icon */}
                  {file.link.endsWith(".pdf") ? (
                    <img
                      src="/icons/pdf-icon.png"
                      alt="PDF Icon"
                      className="h-8 w-8"
                    />
                  ) : file.link.endsWith(".jpg") ||
                    file.link.endsWith(".png") ? (
                    <img
                      src="/icons/image-icon.png"
                      alt="Image Icon"
                      className="h-8 w-8"
                    />
                  ) : (
                    <img
                      src="/icons/file-icon.png"
                      alt="File Icon"
                      className="h-8 w-8"
                    />
                  )}
                  {/* File Name */}
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {file.fileName}
                  </p>
                </div>

                {/* File Owner */}
                <p className="text-xs text-gray-600 mt-1">
                  Owner: {file.owner.email}
                </p>

                {/* File Actions */}
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex space-x-3">
                    <a
                      href={file.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline text-sm"
                    >
                      View
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      deleteSharedFile(file);
                    }}
                    className="bg-gray-300 px-2 py-1 rounded-md text-xs text-gray-700 hover:bg-gray-400"
                  >
                    Delete
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
      {/* Modal for File Upload */}
      <UploadFileModal
        isVisible={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={fetchUploadedFiles}
      />
    </div>
  );
};

export default FilePage;

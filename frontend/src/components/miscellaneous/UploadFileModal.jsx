import React, { useState } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const UploadFileModal = ({ isVisible, onClose, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null); // File object
  const [folderName, setFolderName] = useState(""); // Folder name for the file upload
  const [loading, setLoading] = useState(false);
  const { user } = ChatState();

  if (!isVisible) return null; // don't render the UploadFileModal if it's not visible

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Set the file state
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileName", selectedFile.name); // Passing the file name
    formData.append("user", user._id);

    // Log the FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3000/api/file/upload",
        formData,
        {
          headers: {
            // "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log("File uploaded successfully:", response.data);
      setLoading(false);
      onUploadComplete(); // Notify the parent component to refresh data
      onClose(); // Close the modal
    } catch (error) {
      console.error("File upload failed:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">Upload a File</h2>
        <div className="flex flex-col items-center">
          <input
            type="file"
            onChange={handleFileChange}
            className="border px-4 py-2 rounded-md mb-4 w-full"
          />
          <p className="mb-2 text-sm text-gray-600">
            Selected File: <strong>{selectedFile ? selectedFile.name : "None"}</strong>
          </p>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded-md w-full"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal;

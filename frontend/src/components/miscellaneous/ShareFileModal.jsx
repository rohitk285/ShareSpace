import React, { useState } from "react";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const ShareFileModal = ({ isVisible, file, onClose }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]); // State to track shared users
  const { user } = ChatState();

  // Add collaborator handler
  const handleShareFile = async (userId) => {
    try {
      // console.log(file._id, userId, file.owner);
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      await axios.post(
        "http://localhost:8080/api/share-file/shareFile",
        { originalFileId: file._id, fileName: file.fileName, link: file.link, userId: userId, owner: file.owner },
        config
      );

      // Mark user as shared
      setSharedUsers((prev) => [...prev, userId]);
    } catch (err) {
      console.error("Error sharing file:", err);
    }
  };

  // Handle user search
  const handleSearch = async (query) => {
    if (!query) return setSearchResults([]);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:8080/api/user?search=${query}`,
        config
      );

      setSearchResults(data);
    } catch (err) {
      console.error("Error while searching users", err);
    }
  };

  // Reset sharedUsers state when modal closes
  const handleClose = () => {
    setSharedUsers([]); // Reset shared users
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 className="text-lg font-semibold mb-4">Share File</h3>

        {/* Search Input */}
        <div className="flex items-center mb-4">
          <input
            type="email"
            placeholder="Search user by email"
            onChange={(e) => handleSearch(e.target.value)} // Update search query on change
            className="flex-grow border border-gray-300 rounded px-3 py-1 text-sm"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-gray-100 p-2 rounded">
            <h4 className="font-semibold text-sm mb-2">Search Results:</h4>
            <ul>
              {searchResults.map((result) => (
                <li
                  key={result._id}
                  className="flex justify-between items-center mb-2"
                >
                  <span>{result.email}</span>
                  <button
                    onClick={() => handleShareFile(result._id)} // Share file
                    className="text-blue-500 text-sm font-medium"
                    disabled={sharedUsers.includes(result._id)} // Disable button if already shared
                  >
                    {sharedUsers.includes(result._id) ? "Shared" : "Share"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Close Button */}
        <button onClick={handleClose} className="bg-gray-200 px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareFileModal;

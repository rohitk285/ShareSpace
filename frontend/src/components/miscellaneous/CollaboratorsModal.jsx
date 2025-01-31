import React, { useState } from "react";
import axios from "axios";

const CollaboratorsModal = ({
  isOpen,
  onClose,
  documentId,
  user,
  collaborators,
  setCollaborators,
  docCreator,
}) => {
  const [searchResults, setSearchResults] = useState([]);

  // Add collaborator handler with default access as "view"
  const handleAddCollaborator = async (userId, email) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      await axios.post(
        "http://localhost:8080/api/document/addCollaborator",
        { docId: documentId, userId, access: "view" }, // Default access is view
        config
      );

      // Update state using the updater function
      setCollaborators((prevCollaborators) => [
        ...prevCollaborators,
        { _id: userId, user: { email: email }, access: "view" },
      ]);

      // Update search results
      setSearchResults((prevResults) =>
        prevResults.filter((result) => result._id !== userId)
      );

      // You can log the new collaborator separately
      console.log("Added collaborator:", {
        _id: userId,
        email,
        access: "view",
      });
    } catch (err) {
      console.error("Error adding collaborator:", err);
    }
  };

  // Remove collaborator handler
  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      await axios.post(
        "http://localhost:8080/api/document/removeCollaborator",
        { docId: documentId, collaboratorId },
        config
      );

      setCollaborators((prevCollaborators) =>
        prevCollaborators.filter(
          (collaborator) => collaborator._id !== collaboratorId
        )
      );
    } catch (err) {
      console.error("Error removing collaborator:", err);
    }
  };

  // Update collaborator access handler
  const handleUpdateAccess = async (collaboratorId, newAccess) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      await axios.post(
        "http://localhost:8080/api/document/updateCollaboratorAccess",
        { docId: documentId, collaboratorId, access: newAccess },
        config
      );

      // Update collaborators state
      setCollaborators((prevCollaborators) =>
        prevCollaborators.map((collaborator) =>
          collaborator._id === collaboratorId
            ? { ...collaborator, access: newAccess }
            : collaborator
        )
      );
    } catch (err) {
      console.error("Error updating collaborator access:", err);
    }
  };

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

      // Filter out already existing collaborators from the search results
      const filteredResults = data.filter(
        (user) =>
          !collaborators.some((collaborator) => collaborator._id === user._id)
      );

      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Error while searching users", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h3 className="text-lg font-semibold mb-4">Collaborators</h3>
        <ul className="mb-4">
          {collaborators.length === 0 ? (
            <p>No collaborators added yet.</p>
          ) : (
            collaborators.map((collaborator) => (
              <li
                key={collaborator._id}
                className="flex justify-between items-center mb-2 border-b pb-2"
              >
                <div>
                  <span>{collaborator.user.email}</span>
                </div>
                {user._id === docCreator && (
                  <div className="flex items-center">
                    <select
                      value={collaborator.access}
                      onChange={(e) =>
                        handleUpdateAccess(collaborator._id, e.target.value)
                      }
                      className="border border-gray-300 rounded text-sm px-2 py-1 mr-2"
                    >
                      <option value="view">View Only</option>
                      <option value="edit">Editor</option>
                    </select>

                    <button
                      onClick={() => handleRemoveCollaborator(collaborator._id)}
                      className="text-red-500 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
        {user._id === docCreator && (
          <div className="flex items-center mb-4">
            <input
              type="email"
              placeholder="Enter email to add"
              onChange={(e) => handleSearch(e.target.value)} // Update search query on change
              className="flex-grow border border-gray-300 rounded px-3 py-1 text-sm"
            />
          </div>
        )}
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
                    onClick={() =>
                      handleAddCollaborator(result._id, result.email)
                    } // Add directly from search result
                    className="text-blue-500 text-sm font-medium"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default CollaboratorsModal;

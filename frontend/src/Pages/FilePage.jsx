import React, { useState, useEffect } from "react";
import axios from "axios";

const FilePage = () => {
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     async function fetchFiles() {
//       try {
//         const response = await axios.post(
//             "http://localhost:3000/api/file/fetchFiles",
//             { _id: user._id },
//             {
//               headers: {
//                 Authorization: `Bearer ${user.token}`,
//               },
//             }
//           );
//         setFiles(data);
//       } catch (err) {
//         console.error("Could not fetch files", err);
//       }
//     }
//     fetchFiles();
//   }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("folder", folderName);

    setLoading(true);
    try {
      await axios.post("/api/files/upload", formData);
      fetchFiles();
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const createFolder = async () => {
    if (!folderName) return;
    // Logic to create folder
  };

  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">File Management</h1>

      {/* Upload Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Folder Name (optional)"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="border px-4 py-2 rounded-md mr-2"
        />
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="border px-4 py-2 rounded-md"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* Create Folder */}
      <div className="mb-6">
        <button
          onClick={createFolder}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Create Folder
        </button>
      </div>

      {/* File/Folder Listing */}
      <div className="grid grid-cols-4 gap-4">
        {files.length === 0 ? (
          <p>You are not collaborating on any documents yet.</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="bg-white p-4 shadow rounded-md">
              <p className="font-bold">{file.name}</p>
              <p className="text-sm text-gray-600">{file.type}</p>
              <button className="mt-2 bg-red-500 text-white px-2 py-1 rounded">
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilePage;

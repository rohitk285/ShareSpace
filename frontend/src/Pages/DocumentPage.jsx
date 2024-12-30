import {
  Box,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import { v4 as uuidV4 } from "uuid";
import axios from "axios";
import Unauthorized from "../components/miscellaneous/UnauthorizedDoc";
import CollaboratorsModal from "../components/miscellaneous/CollaboratorsModal";

const DocumentPage = () => {
  const [docs, setDocs] = useState([]);
  const [docsCollab, setDocsCollab] = useState([]);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const { user } = ChatState();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("public");
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [openCollaboratorsModal, setOpenCollaboratorsModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [docCreator, setDocCreator] = useState(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        if (user) {
          const response = await axios.post(
            "http://localhost:3000/api/document/fetchDocuments",
            { _id: user._id },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          setDocs(response.data);
        }
      } catch (err) {
        console.error("Error while fetching docs", err);
      }
    }

    async function fetchDocsCollab() {
      try {
        if (user) {
          const response = await axios.post(
            "http://localhost:3000/api/document/fetchDocumentsCollab",
            { _id: user._id },
            {
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          // console.log(response.data);
          setDocsCollab(response.data);
        }
      } catch (err) {
        console.error("Error while fetching collab docs", err);
      }
    }

    fetchDocs();
    fetchDocsCollab();
  }, [user]);

  // Handle opening the collaborators modal
  const openCollaborators = async (docId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "http://localhost:3000/api/document/getDocDetails",
        { docId },
        config
      );
      console.log(data);
      setDocCreator(data.creator);
      setCollaborators(data.collaborators);
      setSelectedDocumentId(docId);
      setOpenCollaboratorsModal(true);
    } catch (err) {
      console.error("Error while fetching document details", err);
    }
  };

  // Handle closing the collaborators modal
  const handleCloseCollaboratorsModal = () => {
    setOpenCollaboratorsModal(false);
    setSelectedDocumentId(null);
    setCollaborators([]);
  };

  const handleCreateDocument = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) return setSearchResults([]);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:3000/api/user?search=${query}`,
        config
      );
      setSearchResults(data);
    } catch (err) {
      console.error("Error while searching users", err);
    }
  };

  const toggleCollaborator = (user) => {
    setCollaborators((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    );
  };

  async function handleCreate() {
    try {
      if (documentName.trim() !== "") {
        const newDocumentId = uuidV4();
        const documentData = {
          _id: newDocumentId,
          documentName: documentName,
          creator: user._id,
          collaborators: documentType === "private" ? collaborators : [],
          documentType: documentType,
        };
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const response = await axios.post(
          "http://localhost:3000/api/document/createDocument",
          documentData,
          config
        );
        if (response.status === 200) {
          navigate(`/documents/${newDocumentId}`);
          setOpen(false);
        } else {
          console.error("Error creating document:", response.data);
        }
      }
    } catch (err) {
      console.error("Document could not be created", err);
    }
  }

  const handleDelete = async (docId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(
        "http://localhost:3000/api/document/deleteDocument",
        { docId },
        config
      );
      setDocs((prevDocs) => prevDocs.filter((doc) => doc._id !== docId));
    } catch (err) {
      console.error("Error while deleting document", err);
    }
  };

  const checkAccess = async (docId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "http://localhost:3000/api/document/getDocDetails",
        { docId },
        config
      );
      const collab = data.collaborators.map((collaborator) => collaborator._id);
      return data &&
        (data.documentType === "public" ||
          (data && (data.creator === user._id || collab.includes(user._id))))
        ? true
        : false;
    } catch (err) {
      console.error("Error while checking access", err);
      return false;
    }
  };

  const openDocument = async (docId) => {
    const hasAccess = await checkAccess(docId);
    if (hasAccess) {
      navigate(`/documents/${docId}`);
    } else {
      setIsUnauthorized(true);
    }
  };

  if (isUnauthorized) {
    return <Unauthorized />;
  }

  return (
    <div className="w-full h-screen">
      {user && <SideDrawer />}
      <div className="p-6">
        <div className="container mx-auto flex justify-between items-center mb-8">
          <h2 className="font-semibold text-xl">Documents created by you:</h2>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateDocument}
            style={{ textTransform: "none" }}
          >
            + New Document
          </Button>
        </div>

        <Grid container spacing={2}>
          {docs.length === 0 ? (
            <p className="text-gray-500">No documents created yet.</p>
          ) : (
            docs.map((doc, index) => {
              const formattedDate = new Date(doc.createdAt).toLocaleString(
                "en-US",
                {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }
              );

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    className="p-3 bg-gray-800 text-white rounded-md flex flex-col justify-between"
                    sx={{ boxShadow: 2 }}
                  >
                    <div className="mb-2">
                      <h1 className="font-medium text-base truncate">
                        {doc.documentName}
                      </h1>
                      <p className="text-xs text-gray-400">
                        Created on: {formattedDate}
                      </p>
                      <p className="text-xs text-gray-500">ID: {doc._id}</p>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#187bd1",
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: "#166dba", // Darker blue on hover
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDocument(doc._id);
                        }}
                      >
                        Open
                      </Button>
                      <div className="flex space-x-2">
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: "#d32f2f",
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: "#ab2424", // Darker red on hover
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc._id);
                          }}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor: "#187bd1",
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: "#166dba", // Darker blue on hover
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openCollaborators(doc._id);
                          }}
                        >
                          Collaborators
                        </Button>
                      </div>
                    </div>
                  </Box>
                </Grid>
              );
            })
          )}
        </Grid>

        <div className="mt-8">
          <h2 className="font-semibold text-xl mb-4">
            Documents you are collaborating on:
          </h2>
          <Grid container spacing={2}>
            {docsCollab.length === 0 ? (
              <p className="text-gray-500">
                You are not collaborating on any documents yet.
              </p>
            ) : (
              docsCollab.map((doc, index) => {
                const formattedDate = new Date(doc.createdAt).toLocaleString(
                  "en-US",
                  {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }
                );

                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box
                      className="p-3 bg-gray-800 text-white rounded-md flex flex-col justify-between"
                      sx={{ cursor: "pointer", boxShadow: 2 }}
                      onClick={() => openDocument(doc._id)}
                    >
                      <div className="mb-2">
                        <h1 className="font-medium text-base truncate">
                          {doc.documentName}
                        </h1>
                        <p className="text-xs text-gray-400">
                          Created on: {formattedDate}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created by: {doc.creator.email}
                        </p>
                        <p className="text-xs text-gray-500">ID: {doc._id}</p>
                      </div>
                      <div className="flex justify-between">
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            backgroundColor: "#187bd1",
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: "#166dba", // Darker blue on hover
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDocument(doc._id);
                          }}
                        >
                          Open
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCollaborators(doc._id);
                          }}
                        >
                          Collaborators
                        </Button>
                      </div>
                    </Box>
                  </Grid>
                );
              })
            )}
          </Grid>
        </div>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="document-name"
            label="Document Name"
            type="text"
            fullWidth
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            variant="outlined"
          />
          <RadioGroup
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          >
            <FormControlLabel
              value="public"
              control={<Radio />}
              label="Public"
            />
            <FormControlLabel
              value="private"
              control={<Radio />}
              label="Private"
            />
          </RadioGroup>
          {documentType === "private" && (
            <div>
              <TextField
                margin="dense"
                label="Search for collaborators"
                fullWidth
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Box mt={2}>
                {searchResults.map((user) => (
                  <div key={user._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={collaborators.includes(user)}
                          onChange={() => toggleCollaborator(user)}
                        />
                      }
                      label={user.email}
                    />
                  </div>
                ))}
              </Box>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreate} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Collaborators Modal */}
      <CollaboratorsModal
        isOpen={openCollaboratorsModal}
        onClose={handleCloseCollaboratorsModal}
        documentId={selectedDocumentId}
        user={user}
        collaborators={collaborators}
        setCollaborators={setCollaborators}
        docCreator={docCreator}
      />
    </div>
  );
};

export default DocumentPage;

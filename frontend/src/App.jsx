// App.jsx
import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";  // Import BrowserRouter for routing
import Homepage from "./Pages/HomePage";
import Chatpage from "./Pages/ChatPage";
import { ChatProvider } from "./Context/ChatProvider";  // Import ChatProvider with curly braces
import VideoCallPage from "./Pages/VideoCallPage";
import DocumentPage from "./Pages/DocumentPage";
import TextEditor from "./components/miscellaneous/TextEditor";
import FilePage from "./Pages/FilePage";

function App() {
  return (
    <div className="App">
      {/* Wrap the Routes inside BrowserRouter and ChatProvider */}
      <BrowserRouter>
        <ChatProvider> {/* Wrap with ChatProvider to provide context */}
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/chats" element={<Chatpage />} />
            <Route path="/videocall" element={<VideoCallPage />} />
            <Route path="/docs" element={<DocumentPage />} />
            <Route path="/documents/:id" element={<TextEditor />} />
            <Route path="/files" element={<FilePage />} />
          </Routes>
        </ChatProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

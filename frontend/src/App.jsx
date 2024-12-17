// App.jsx
import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";  // Import BrowserRouter for routing
import Homepage from "./Pages/HomePage";
import Chatpage from "./Pages/ChatPage";
import { ChatProvider } from "./Context/ChatProvider";  // Import ChatProvider with curly braces
import VideoCallPage from "./Pages/VideoCallPage";

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
          </Routes>
        </ChatProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;


import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState("");
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("pdfmind_chats")) || [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState(null);
  const [question, setQuestion] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem("pdfmind_chats", JSON.stringify(chats));
  }, [chats]);

  const updateChat = (chatId, updates) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      )
    );
  };

  // Start a new conversation
  const newChat = () => {
    setActiveChatId(null);
    setDocumentId("");
    setMessages([]);
    setQuestion("");
    setFile(null);
  };

  // Open previous conversation
  const openChat = (chat) => {
    setActiveChatId(chat.id);
    setDocumentId(chat.documentId);
    setMessages(chat.messages || []);
    setQuestion("");
    setFile(null);
  };

  // Upload PDF
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const chatId = Date.now();

      const welcomeMessage = {
        role: "ai",
        text: `Your document "${file.name}" is ready! Ask me anything about it.`,
      };

      const newConversation = {
        id: chatId,
        title: file.name,
        documentId: data.document_id,
        messages: [welcomeMessage],
        updatedAt: new Date().toISOString(),
      };

      setChats((prev) => [newConversation, ...prev]);
      setActiveChatId(chatId);
      setDocumentId(data.document_id);
      setMessages([welcomeMessage]);
      setFile(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Send question
  const handleSend = async () => {
    if (!question.trim() || !documentId || loading || !activeChatId) {
      return;
    }

    const userQuestion = question.trim();
    const chatId = activeChatId;

    const updatedMessages = [
      ...messages,
      { role: "user", text: userQuestion },
    ];

    setMessages(updatedMessages);
    setQuestion("");

    updateChat(chatId, {
      messages: updatedMessages,
      updatedAt: new Date().toISOString(),
    });

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
          document_id: documentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const finalMessages = [
        ...updatedMessages,
        { role: "ai", text: data.answer },
      ];

      setMessages(finalMessages);

      updateChat(chatId, {
        messages: finalMessages,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessages = [
        ...updatedMessages,
        { role: "ai", text: `Error: ${error.message}` },
      ];

      setMessages(errorMessages);

      updateChat(chatId, {
        messages: errorMessages,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toDateString();

  const todayChats = chats.filter(
    (chat) => new Date(chat.updatedAt).toDateString() === today
  );

  const previousChats = chats.filter(
    (chat) => new Date(chat.updatedAt).toDateString() !== today
  );

  return (
    <div className="app-layout">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">✦</div>
          <h2>PDF<span>Mind</span></h2>
        </div>

        <button className="new-chat-btn" onClick={newChat}>
          <span>＋</span> New Chat
        </button>

        <div className="history-section">
          <div className="history-heading">
            <span>CHAT HISTORY</span>
            <span>{chats.length}</span>
          </div>

          {chats.length === 0 && (
            <p className="empty-history">
              Your conversations will appear here.
            </p>
          )}

          {todayChats.length > 0 && (
            <>
              <p className="history-label">Today</p>
              {todayChats.map((chat) => (
                <button
                  key={chat.id}
                  className={`history-item ${
                    activeChatId === chat.id ? "active" : ""
                  }`}
                  onClick={() => openChat(chat)}
                >
                  <span>◉</span>
                  <span className="history-title">{chat.title}</span>
                </button>
              ))}
            </>
          )}

          {previousChats.length > 0 && (
            <>
              <p className="history-label">Previous conversations</p>
              {previousChats.map((chat) => (
                <button
                  key={chat.id}
                  className={`history-item ${
                    activeChatId === chat.id ? "active" : ""
                  }`}
                  onClick={() => openChat(chat)}
                >
                  <span>◉</span>
                  <span className="history-title">{chat.title}</span>
                </button>
              ))}
            </>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="user-profile">
            <div className="avatar">U</div>
            <div>
              <h4>My Workspace</h4>
              <p>PDF Assistant</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-area">

        <header className="topbar">
          <div className="current-document">
            <span className="document-icon">▤</span>
            <span>
              {chats.find((chat) => chat.id === activeChatId)?.title ||
                "New Conversation"}
            </span>
          </div>

          <div className="topbar-right">
            <span className="ai-status">● AI Connected</span>
          </div>
        </header>

        <div className="workspace">

          {/* CHAT AREA */}
          <section className="chat-area">

            <div className="chat-content">

              {messages.length === 0 ? (
                <div className="welcome-screen">
                  <div className="welcome-icon">✦</div>
                  <h1>Chat with your <span>PDFs.</span></h1>
                  <p>
                    Upload a document and get instant answers powered by AI.
                  </p>

                  <div className="upload-box">
                    <div className="upload-symbol">↑</div>
                    <h3>Upload your document</h3>
                    <p>Choose a PDF to start your conversation.</p>

                    <input
                      type="file"
                      id="pdf-file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setFile(e.target.files[0])}
                    />

                    <label htmlFor="pdf-file" className="choose-file">
                      {file ? file.name : "Choose PDF"}
                    </label>

                    <button
                      className="upload-btn"
                      onClick={handleUpload}
                      disabled={!file || uploading}
                    >
                      {uploading ? "Processing..." : "Upload Document"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="messages-container">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message-row ${message.role}`}
                    >
                      <div className="message-avatar">
                        {message.role === "ai" ? "✦" : "U"}
                      </div>

                      <div className="message-body">
                        <span className="message-name">
                          {message.role === "ai" ? "PDFMind AI" : "You"}
                        </span>
                        <div className="message-bubble">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                      AI is thinking...
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* MESSAGE INPUT */}
            <div className="bottom-area">

              {messages.length > 0 && (
                <div className="upload-another">
                  <label htmlFor="replace-pdf">
                    ＋ Upload another PDF
                  </label>
                  <input
                    id="replace-pdf"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  {file && (
                    <button onClick={handleUpload} disabled={uploading}>
                      {uploading ? "Uploading..." : `Upload ${file.name}`}
                    </button>
                  )}
                </div>
              )}

              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder={
                    documentId
                      ? "Ask anything about your document..."
                      : "Upload a PDF to start chatting..."
                  }
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  disabled={!documentId || loading}
                />

                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={!documentId || !question.trim() || loading}
                >
                  ➤
                </button>
              </div>

              <p className="input-footer">
                AI can make mistakes. Verify important information with your document.
              </p>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}

export default App;

import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import avator from './img/avator.jpg'; 

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // ✅ State for Greeting Popup
  const [showGreeting, setShowGreeting] = useState(true);

  const chatEndRef = useRef(null);

  // ✅ Updated Toggle Logic
  const toggleWidget = () => {
    setOpen((prev) => {
      const newState = !prev;

      if (newState) {
        // Chat Open ho rahi hai: Greeting chupao, Home tab dikhao
        setShowGreeting(false);
        setActiveTab("home");
        setIsExpanded(false);
      } else {
        // Chat Close ho rahi hai: Greeting wapis dikhao
        setShowGreeting(true); 
        setIsExpanded(false);
        setShowEmojiPicker(false);
      }

      return newState;
    });
  };

  // ✅ Expand/Collapse Logic
  const toggleHeight = () => {
    setIsExpanded(!isExpanded);
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prev) => prev + emojiObject.emoji);
  };

  // ✅ SERVER LOGIC (FIXED: INPUT CLEARING)
  const sendMessage = async () => {
    if (!message.trim()) return;

    // 1. Message ko temp variable mein store karein
    const currentMessage = message; 

    // 2. Input ko FORAN clear karein
    setMessage(""); 
    setShowEmojiPicker(false);
    
    // 3. UI Update karein
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatLog((prev) => [...prev, { sender: "user", text: currentMessage, time: timestamp }]);
    setLoading(true);

    try {
      // ✅ Using the endpoint that works for you
      const res = await fetch("https://automate.ththeater.com/webhook/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentMessage }), // Send stored message
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      // ✅ Response Handling Logic
      let botResponse = "No response from server";
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        botResponse = data[0].output;
      } else if (data.output) {
        botResponse = data.output;
      }

      // Add Bot Message
      setChatLog((prev) => [...prev, { sender: "bot", text: botResponse, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);

    } catch (err) {
      console.error(err);
      setChatLog((prev) => [...prev, { sender: "bot", text: "Error: Unable to connect to server.", error: true }]);
    } finally {
      // setMessage(""); // <-- Yahan se hata diya hai taake wait na kare
      setLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  return (
    <>
      {/* === GREETING POPUP (Pill Shape) === */}
      {!open && showGreeting && (
        <div
          onClick={toggleWidget}
          className="fixed bottom-[30px] right-[90px] z-[9998] bg-white py-3 px-6 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] cursor-pointer hover:scale-105 transition-transform duration-300 flex items-center gap-3 animate-bounce-in origin-right"
        >
          <span className="text-[#080f1a] font-semibold text-[16px]">Chat with us</span>
          <span className="text-[22px] -mt-1">👋</span>
        </div>
      )}

      {/* === FLOATING BUTTON === */}
      <button
        onClick={toggleWidget}
        className={`fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-[60px] h-[60px] rounded-full shadow-[0_4px_14px_rgba(8,15,26,0.12)] hover:scale-105 transition-transform duration-200 ${open ? "bg-[#2546f0] text-white hidden sm:flex" : "bg-[#2546f0] text-white flex"
          }`}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>
        )}
      </button>

      {/* === MAIN WIDGET CONTAINER === */}
      {open && (
        <div
          className={`fixed z-[9999] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden font-sans flex flex-col transition-all duration-300 ease-in-out
          bottom-0 right-0 w-full rounded-none
          sm:right-6 sm:w-[380px] sm:rounded-[16px] border border-[#e5e7eb]
          /* Height Logic: Home is smaller, Chat is bigger/expandable */
          ${activeTab === 'home' ? 'sm:h-[480px] sm:bottom-[90px]' : (isExpanded ? 'sm:h-[80vh] sm:bottom-[30px]' : 'sm:h-[600px] sm:bottom-[90px]')}
          `}
        >

          {/* ================= VIEW 1: HOME SCREEN ================= */}
          {activeTab === "home" && (
            <div className="flex flex-col h-full relative">
              
              {/* Blue Section */}
              <div className="h-[60%] bg-[#2546f0] p-6 relative text-white flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    <img src={avator} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <button className="opacity-80 hover:opacity-100">
                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                  </button>
                </div>
                <div className="mt-auto mb-16">
                  <h1 className="text-[32px] font-bold leading-tight flex items-center gap-2">
                    Hi there <span className="animate-wave">👋</span>
                  </h1>
                  <p className="text-[17px] mt-2 font-medium opacity-90 leading-snug">
                    Welcome to our website. Ask us anything <span className="">🎉</span>
                  </p>
                </div>
                
                {/* Overlapping Card */}
                <div
                  onClick={() => setActiveTab("chat")}
                  className="absolute left-6 right-6 bottom-[-35px] bg-white rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] cursor-pointer hover:shadow-xl transition-all border border-gray-50 flex justify-between items-center group z-10"
                >
                  <div>
                    <h3 className="text-black font-bold text-[17px]">Chat with us</h3>
                    <p className="text-gray-500 text-[13px] mt-0.5">We typically reply within a few minutes.</p>
                  </div>
                  <div className="text-[#2546f0] transform group-hover:translate-x-1 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                  </div>
                </div>
              </div>

              {/* White Bottom Section */}
              <div className="h-[40%] bg-white flex flex-col justify-end pb-4 pt-16">
                <div className="flex justify-around items-center px-4">
                  <button className="flex flex-col items-center gap-1.5 text-[#2546f0]">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                    <span className="text-[13px] font-semibold">Home</span>
                  </button>
                  <button onClick={() => setActiveTab("chat")} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span className="text-[13px] font-medium">Chat</span>
                  </button>
                </div>
                <div className="mt-8 flex items-center justify-center gap-1.5 opacity-60">
                  <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Powered by</span>
                  <span className="text-[11px] font-bold text-gray-600">Quikr AI</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 2: CHAT INTERFACE ================= */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-full bg-white relative">
              
              {/* Header */}
              <div className="bg-white p-3 px-4 flex items-center justify-between shadow-[0_1px_0px_rgba(0,0,0,0.06)] z-20">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab("home")} className="text-gray-500 hover:text-black transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    <img src={avator} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-[15px] font-semibold text-gray-900">Hi there 👋</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <button onClick={toggleHeight} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title={isExpanded ? "Collapse" : "Expand"}>
                    {isExpanded ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
                    )}
                  </button>
                  <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white">

                <div className="flex justify-start mt-5 ">
                  <div className="p-3.5 px-4 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm bg-[#f5f7f9] text-gray-800 rounded-bl-none ">
                    Hey! David here from Transcend Home Theater, how can I help you today?
                  </div>
                </div>

                {chatLog.map((chat, i) => (
                  <div key={i} className={`flex flex-col ${chat.sender === "user" ? "items-end" : "items-start"}`}>
                    <div className={`p-3.5 px-4 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${chat.sender === "user" ? "bg-[#2546f0] text-white rounded-br-none" : "bg-[#f5f7f9] text-gray-800 rounded-bl-none"
                      } ${chat.error ? "bg-red-50 border border-red-200 text-red-600" : ""}`}>
                      {chat.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#f5f7f9] p-3 px-4 rounded-2xl rounded-bl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* INPUT AREA */}
              <div className="bg-white pb-2 relative">

                {/* EMOJI PICKER POPUP */}
                {showEmojiPicker && (
                  <div className="absolute bottom-[100%] left-0 w-full z-50 shadow-xl border-t border-gray-200">
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      width="100%"
                      height={350}
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                )}

                <hr className="border-gray-100 mb-2" />
                <div className="px-4">
                  <div className="relative">
                    <textarea
                      className="w-full pt-3 pb-2 pr-10 bg-transparent outline-none text-[15px] text-[#080f1a] placeholder-gray-400 resize-none overflow-hidden min-h-[44px] font-sans"
                      placeholder="Enter your message..."
                      rows="1"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim() || loading}
                      className={`absolute right-0 top-2.5 transition-colors ${message.trim() ? "text-[#2546f0]" : "text-gray-300"}`}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.78393 10.7733L3.47785 6.16113C2.36853 3.9425 1.81387 2.83318 2.32353 2.32353C2.83318 1.81387 3.9425 2.36853 6.16113 3.47785L19.5769 10.1857C21.138 10.9663 21.9185 11.3566 21.9185 11.9746C21.9185 12.5926 21.138 12.9829 19.5769 13.7634L6.16113 20.4713C3.9425 21.5806 2.83318 22.1353 2.32353 21.6256C1.81387 21.116 2.36853 20.0067 3.47785 17.788L5.78522 13.1733H12.6367C13.2995 13.1733 13.8367 12.636 13.8367 11.9733C13.8367 11.3105 13.2995 10.7733 12.6367 10.7733H5.78393Z" fill="currentColor"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                     
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`transition-colors p-1 ${showEmojiPicker ? "text-[#2546f0]" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"></path><path fillRule="evenodd" clipRule="evenodd" d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM15.5 11C16.33 11 17 10.33 17 9.5C17 8.67 16.33 8 15.5 8C14.67 8 14 8.67 14 9.5C14 10.33 14.67 11 15.5 11ZM8.5 11C9.33 11 10 10.33 10 9.5C10 8.67 9.33 8 8.5 8C7.67 8 7 8.67 7 9.5C7 10.33 7.67 11 8.5 11ZM12.0006 17.5C14.3306 17.5 16.3106 16.04 17.1106 14L6.89062 14C7.69063 16.04 9.67063 17.5 12.0006 17.5Z"></path></svg>
                      </button>
                    </div>
                    <div className="opacity-60 scale-90 origin-right">
                      <span className="text-[10px] text-[#647491] uppercase font-bold tracking-widest flex items-center justify-center gap-1">
                        Powered by <span>Quikr AI</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
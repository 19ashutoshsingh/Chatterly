import React, { useContext, useEffect, useState, useRef } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { Timestamp } from "firebase/firestore";
import EmojiPicker from "emoji-picker-react";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false); // New state for upload status
  const [open, setOpen] = useState(false);
  const [messageOptions, setMessageOptions] = useState(null); // Track which message has options open

  // Ref to track the message options container
  const messageOptionsRef = useRef(null);

  const sendMessage = async () => {
    try {
      if (!input.trim() && !file) return;

      let fileUrl = null;
      let fileType = null;

      // Handle file upload
      if (file) {
        setUploading(true); // Set uploading status to true
        const fileRef = ref(storage, `files/${file.name}_${Date.now()}`);
        const snapshot = await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(snapshot.ref);
        fileType = file.type;
        setUploading(false); // Reset uploading status after upload
        
        // Show success toast for file upload
        toast.success("File sent successfully!"); // Add this line
      }

      const messageData = {
        sId: userData.id,
        text: input.trim() || null,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        createdAt: Timestamp.now(),
      };

      if (fileUrl || messageData.text) {
        if (messagesId) {
          await updateDoc(doc(db, 'messages', messagesId), {
            messages: arrayUnion(messageData),
          });
        }
      }

      // Reset input and file after sending the message
      setInput("");
      setFile(null); // Reset file after sending
    } catch (error) {
      setUploading(false); // Reset uploading status on error
      toast.error(error.message);
      console.error("Error sending message:", error);
    }
  };

  // Function to delete a message
  const deleteMessage = async (msg) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this message?");
      if (!confirmDelete) return; // If the user cancels, return early

      if (messagesId) {
        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayRemove(msg),
        });

        // Close the options menu after deletion
        setMessageOptions(null); // This line ensures the delete button is hidden after deletion
        
        toast.success("Message deleted!");
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error deleting message:", error);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle emoji selection
  const handleEmoji = (e) => {
    setInput((prevInput) => prevInput + e.emoji);
    setOpen(false);
  };

  // Fetch and update messages in real-time
  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        setMessages(res.data().messages.reverse());
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId]);

  // Format the message date
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return chatUser ? (
    <div className='chat-box'>
      <div className='chat-user'>
        <img src={chatUser.avatar} alt='' />
        <p>{chatUser.name} <img className='dot' src={assets.green_dot} alt='' /></p>
        <img src={assets.help_icon} className='help' alt='' />
      </div>

      <div className='chat-msg'>
        {messages && messages.map((msg, index) => {
          const msgDate = new Date(msg.createdAt.seconds * 1000);
          const prevMsgDate = index < messages.length - 1 ? new Date(messages[index + 1].createdAt.seconds * 1000) : null;
          const showDate = !prevMsgDate || !isSameDay(msgDate, prevMsgDate);

          return (
            <React.Fragment key={index}>
              <div className={msg.sId === userData.id ? 's-msg' : 'r-msg'}>
                {/* Expand icon at the top-right corner of each message */}
                
                {msg.fileUrl && msg.fileType && (
                  <>
                    {msg.fileType.startsWith('image/') ? (
                      <img
                        src={msg.fileUrl}
                        alt="sent-img"
                        className="sent-image msg-img" onClick={() => window.open(msg.fileUrl, '_blank')}
                      />
                    ) : msg.fileType.startsWith('audio/') ? (
                      <audio controls className='audio-player'>
                        <source src={msg.fileUrl} type={msg.fileType} />
                        Your browser does not support the audio tag.
                      </audio>
                    ) : msg.fileType.startsWith('video/') ? (
                      <video controls className='video-player'>
                        <source src={msg.fileUrl} type={msg.fileType} />
                        Your browser does not support the video tag.
                      </video>
                    ) : msg.fileType === 'application/pdf' ? (
                      <div className='attached-file'>
                        <p className='attached-image'>📄</p>
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                          <p className='attached-text'>{msg.fileUrl.split('/').pop().split('?')[0].replace(/%20/g,'').split('_')[0].split('.').slice(0, -1).join('.')}</p>
                        </a>
                        <div className="message-options" ref={messageOptionsRef}>
                          <span className="expand-icon">⋮</span>
                          <div className="message-actions">
                            <p onClick={() => deleteMessage(msg)}>Delete</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='attached-file'>
                        <p className='attached-image'>📁</p>
                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                          <p className='attached-text'>Download File</p>
                        </a>
                        <div className="message-options" ref={messageOptionsRef}>
                          <span className="expand-icon">⋮</span>
                          <div className="message-actions">
                            <p onClick={() => deleteMessage(msg)}>Delete</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {msg.text && !msg.fileUrl && (
                  <p className='msg'>
                    {msg.text}
                    <div className="message-options" ref={messageOptionsRef}>
                      <span className="expand-icon">⋮</span>
                      <div className="message-actions">
                        <p onClick={() => deleteMessage(msg)}>Delete</p>
                      </div>
                    </div>
                  </p>
                )}
                
                <div>
                  <img src={msg.sId === userData.id ? userData.avatar : chatUser.avatar} alt='' />
                  <p>{new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              {showDate && <p className='chat-date'>{formatDate(msgDate)}</p>}
            </React.Fragment>
          );
        })}
      </div>

      <div className='chat-input'>
        <div className='emoji'>
          <img src="./emoji.png" alt="" onClick={() => setOpen(prev => !prev)} />
          <div className='picker'>
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>

        {/* File input for images, PDFs, or other files */}
        <input
          type="file"
          id="file"
          accept="*/*"  
          onChange={handleFileChange}
          hidden
        />
        <label htmlFor='file'>
          <img src={assets.gallery_icon} alt='Upload file' />
        </label>

        {file && (
          <div className='file-preview'>
            <p>{file.name}</p>
            {uploading ? (
              <p>Uploading...</p> // Display uploading status
            ) : (
              <button onClick={() => setFile(null)}>Remove</button> // Show Remove button when not uploading
            )}
          </div>
        )}

        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder='Send a message'
        />
        <img onClick={sendMessage} src={assets.send_button} alt='Send' />
      </div>
    </div>
  ) : (
    <div className='chat-welcome'>
      <img src={assets.logo_icon} alt='' />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;

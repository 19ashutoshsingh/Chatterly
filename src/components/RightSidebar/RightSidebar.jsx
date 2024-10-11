import React, { useContext, useEffect, useState } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { logout } from '../../config/firebase';

const RightSidebar = () => {
  const { messages, userData, chatUser } = useContext(AppContext);
  const [mediaFiles, setMediaFiles] = useState([]);

  useEffect(() => {
    if (messages) {
      const files = messages.filter(
        (msg) =>
          msg.fileUrl &&
          (msg.fileType.startsWith('image/') ||
            msg.fileType.startsWith('audio/') ||
            msg.fileType.startsWith('video/') ||
            msg.fileType === 'application/pdf')
      );
      setMediaFiles(files); // Always update `mediaFiles`, even if it's an empty array
    } else {
      setMediaFiles([]); // Reset `mediaFiles` when there are no messages
    }
  }, [messages]);

  return (
    <div className='rs'>
      <div className="menu">
        <span className="expand-icon">⋮</span>
        <div className="sub-menu">
            <p>Clear Chats</p>
            <hr />
            <p>Block User</p>
        </div>
    </div>

    {chatUser ? (
        <div className='rs-profile'>
          <img src={chatUser.avatar} alt='' />
          <h3>{chatUser.name} <img src={assets.green_dot} className='dot' alt='' /></h3>
          <p>{chatUser.bio}</p>
        </div>
      ) : (
        <div className='rs-profile'>
          <img src={assets.avatar_icon} alt='' />
          <h3>No user selected</h3>
        </div>
      )}
      <hr />

      <div className='rs-media'>
        <p>Media</p>
        <div className={mediaFiles?.length > 0 ? 'media-grid' : 'media-empty'}>
          {mediaFiles?.length > 0 ? (
            mediaFiles.map((media, index) => (
              media.fileType.startsWith('image/') ? (
                <img
                  key={index}
                  src={media.fileUrl}
                  alt="media"
                  className="media-img"
                  onClick={() => window.open(media.fileUrl, '_blank')}
                />
              ) : media.fileType === 'application/pdf' ? (
                <div key={index} className="file-placeholder">
                  <p>📄</p>
                  <a href={media.fileUrl} target="_blank" rel="noopener noreferrer">PDF</a>
                </div>
              ) : media.fileType.startsWith('audio/') ? (
                <div key={index} className="file-placeholder">
                  <p>🎵</p>
                  <a href={media.fileUrl} target="_blank" rel="noopener noreferrer">Audio</a>
                </div>
              ) : media.fileType.startsWith('video/') ? (
                <div key={index} className="file-placeholder">
                  <p>🎥</p>
                  <a href={media.fileUrl} target="_blank" rel="noopener noreferrer">Video</a>
                </div>
              ) : (
                <div key={index} className="file-placeholder">
                  <p>📁</p>
                  <a href={media.fileUrl} target="_blank" rel="noopener noreferrer">File</a>
                </div>
              )
            ))
          ) : (
            <p className='no-msg' style={{fontSize: '14px'}}>No media files shared yet.</p>
          )}
        </div>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default RightSidebar;

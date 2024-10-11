// import React, { useContext, useState } from 'react';
// import './LeftSidebar.css';
// import assets from '../../assets/assets';
// import { useNavigate } from 'react-router-dom';
// import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
// import { db } from '../../config/firebase';
// import { AppContext } from '../../context/AppContext';
// import { toast } from 'react-toastify';
// import { logout } from '../../config/firebase';

// const LeftSidebar = () => {
//     const navigate = useNavigate();
//     const { userData, chatData, setChatUser, setMessagesId, setChatData } = useContext(AppContext);
//     const [user, setUser] = useState(null);
//     const [showSearch, setShowSearch] = useState(false);
//     const [selectedChatId, setSelectedChatId] = useState(null); // New state

//     // Handle search input
//     const inputHandler = async (e) => {
//         try {
//             const input = e.target.value.trim();

//             if (input) {
//                 setShowSearch(true);

//                 const userRef = collection(db, 'users');
//                 const q = query(userRef, where('username', '==', input.toLowerCase()));
//                 const querySnap = await getDocs(q);

//                 if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
//                     let userExist = false;

//                     // Check if the user is already in the chat list
//                     chatData.forEach((chat) => {
//                         if (chat.rId === querySnap.docs[0].data().id) {
//                             userExist = true;
//                         }
//                     });

//                     if (!userExist) {
//                         setUser(querySnap.docs[0].data());
//                     } else {
//                         setUser(null); // Prevent showing the user if already exists in chat
//                     }
//                 } else {
//                     setUser(null);
//                 }
//             } else {
//                 setShowSearch(false);
//                 setUser(null);
//             }
//         } catch (error) {
//             console.error('Error fetching user:', error);
//             toast.error('Error fetching user');
//         }
//     };

//     // Add new chat between current user and searched user
//     const addChat = async () => {
//         const messagesRef = collection(db, 'messages');
//         const chatsRef = collection(db, 'chats');

//         try {
//             // Create a new message document for the chat
//             const newMessageRef = doc(messagesRef);
//             await setDoc(newMessageRef, {
//                 createdAt: serverTimestamp(),
//                 messages: [],
//             });

//             // Create the last message object
//             const lastMessage = ''; // Set this to the actual message if you have it

//             // Update the chat for the searched user
//             await updateDoc(doc(chatsRef, user.id), {
//                 chatData: arrayUnion({
//                     messageId: newMessageRef.id,
//                     lastMessage: lastMessage,
//                     rId: userData.id,
//                     updatedAt: Date.now(),
//                     messageSeen: true,
//                 }),
//             });

//             // Update the chat for the current user
//             await updateDoc(doc(chatsRef, userData.id), {
//                 chatData: arrayUnion({
//                     messageId: newMessageRef.id,
//                     lastMessage: lastMessage,
//                     rId: user.id,
//                     updatedAt: Date.now(),
//                     messageSeen: true,
//                 }),
//             });

//             // Create a new chat object to update chatData
//             const newChat = {
//                 messageId: newMessageRef.id,
//                 lastMessage: lastMessage,
//                 rId: user.id,
//                 userData: user, // This includes the user info (avatar, name)
//             };

//             // Update chatData in the context
//             setChatData((prevData) => [...prevData, newChat]); // Add the new chat to chatData

//             // Set the current chat as the selected chat
//             setMessagesId(newMessageRef.id);
//             setChatUser(user);
//             setShowSearch(false);
//             setUser(null); // Reset search state after chat is created

//         } catch (error) {
//             console.error('Error adding chat:', error);
//             toast.error('Error adding chat');
//         }
//     };

//     // Set an existing chat as active when clicking a chat item
//     const setChat = async (item) => {
//         setMessagesId(item.messageId);
//         setChatUser(item.userData);
//         setSelectedChatId(item.messageId); // Set the selected chat ID
//     };

//     return (
//         <div className="ls">
//             <div className="ls-top">
//                 <div className="ls-nav">
//                     <div className='logo-section'>
//                         <img className="logo" src={assets.logo_icon} alt="" />
//                         <h3>Chatterly</h3>
//                     </div>
//                     <div className="menu">
//                         <img src={assets.menu_icon} alt="" />
//                         <div className="sub-menu">
//                             <p onClick={() => navigate('/profile')}>Edit Profile</p>
//                             <hr />
//                             <p onClick={logout}>Logout</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="ls-search">
//                     <img src={assets.search_icon} alt="" />
//                     <input onChange={inputHandler} type="text" placeholder="Search here..." />
//                 </div>
//             </div>

//             <div className="ls-list">
//                 {showSearch && user ? (
//                     <div onClick={addChat} className="friends add-user">
//                         <img src={user.avatar} alt="" />
//                         <p>{user.name}</p>
//                     </div>
//                 ) : (
//                     chatData?.length > 0 &&
//                     chatData
//                     .sort((a, b) => b.updatedAt - a.updatedAt)
//                     .map((item, index) => {
//                         return (
//                             <div onClick={() => setChat(item)} className={`friends ${selectedChatId === item.messageId ? 'active-chat' : ''}`} key={index}>
//                                 <img src={item.userData?.avatar} alt="" />
//                                 <div>
//                                     <p>{item.userData?.name}</p>
//                                     <span>{item.lastMessage}</span>
//                                 </div>
//                             </div>
//                         );
//                     })
//                 )}
//             </div>
//         </div>
//     );
// };

// export default LeftSidebar;



import React, { useContext, useState } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { logout } from '../../config/firebase';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { userData, chatData, setChatUser, setMessagesId, setChatData } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);
    const [selectedChatId, setSelectedChatId] = useState(null);

    // Handle search input
    const inputHandler = async (e) => {
        try {
            const input = e.target.value.trim();

            if (input) {
                setShowSearch(true);

                const userRef = collection(db, 'users');
                const q = query(userRef, where('username', '==', input.toLowerCase()));
                const querySnap = await getDocs(q);

                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    let userExist = false;

                    chatData.forEach((chat) => {
                        if (chat.rId === querySnap.docs[0].data().id) {
                            userExist = true;
                        }
                    });

                    if (!userExist) {
                        setUser(querySnap.docs[0].data());
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } else {
                setShowSearch(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Error fetching user');
        }
    };

    // Add new chat between current user and searched user
    const addChat = async () => {
        const messagesRef = collection(db, 'messages');
        const chatsRef = collection(db, 'chats');

        try {
            // Create a new message document for the chat
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            const lastMessage = ''; // Placeholder for now

            // Update chat for the searched user
            await updateDoc(doc(chatsRef, user.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: lastMessage,
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true,
                }),
            });

            // Update chat for the current user
            await updateDoc(doc(chatsRef, userData.id), {
                chatData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: lastMessage,
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true,
                }),
            });

            const newChat = {
                messageId: newMessageRef.id,
                lastMessage: lastMessage,
                rId: user.id,
                userData: user,
            };

            setChatData((prevData) => [...prevData, newChat]);
            setMessagesId(newMessageRef.id);
            setChatUser(user);
            setShowSearch(false);
            setUser(null);
        } catch (error) {
            console.error('Error adding chat:', error);
            toast.error('Error adding chat');
        }
    };

    // Set an existing chat as active when clicking a chat item
    const setChat = async (item) => {
        setMessagesId(item.messageId);
        setChatUser(item.userData);
        setSelectedChatId(item.messageId);
    };

    return (
        <div className="ls">
            <div className="ls-top">
                <div className="ls-nav">
                    <div className='logo-section'>
                        <img className="logo" src={assets.logo_icon} alt="" />
                        <h3>Chatterly</h3>
                    </div>
                    <div className="menu">
                        <img src={assets.menu_icon} alt="" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p onClick={logout}>Logout</p>
                        </div>
                    </div>
                </div>

                <div className="ls-search">
                    <img src={assets.search_icon} alt="" />
                    <input onChange={inputHandler} type="text" placeholder="Search here..." />
                </div>
            </div>

            <div className="ls-list">
                {showSearch && user ? (
                    <div onClick={addChat} className="friends add-user">
                        <img src={user.avatar} alt="" />
                        <p>{user.name}</p>
                    </div>
                ) : (
                    chatData?.length > 0 &&
                    chatData
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((item, index) => {
                        return (
                            <div onClick={() => setChat(item)} className={`friends ${selectedChatId === item.messageId ? 'active-chat' : ''}`} key={index}>
                                <img src={item.userData?.avatar} alt="" />
                                <div>
                                    <p>{item.userData?.name}</p>
                                    <span>{item.lastMessage}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;

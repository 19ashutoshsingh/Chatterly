import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage
import { toast } from "react-toastify";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyC6J4nqEQ76X0ZsxnQeEuSTS04TCfXeOIg",
  authDomain: "chat-app-gs-c1b43.firebaseapp.com",
  projectId: "chat-app-gs-c1b43",
  storageBucket: "chat-app-gs-c1b43.appspot.com",
  messagingSenderId: "461534716028",
  appId: "1:461534716028:web:05b112740f8dd0f8afe9f9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Function to handle user signup
const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey there, I am using Chatterly.",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatData: []
    });
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
};

// Function to handle user login
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.log(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
};

// Function to handle user logout
const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.log(error);
    toast.error(error.code.split('/')[1].split('-').join(" "));
  }
};

// Function to upload files to Firebase Storage
const uploadFile = async (file) => {
  if (!file) {
    toast.error("No file selected.");
    return;
  }

  const fileRef = ref(storage, `chatFiles/${file.name}`);
  try {
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL; // Return the download URL of the uploaded file
  } catch (error) {
    console.error(error);
    toast.error("File upload failed.");
  }
};

// Export the necessary Firebase services
export { signup, login, logout, auth, db, storage, uploadFile }; // Export Firebase Storage here

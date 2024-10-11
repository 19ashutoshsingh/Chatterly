import React, { useContext, useEffect, useState } from 'react'
import "./ProfileUpdate.css"
import assets from '../../assets/assets'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import upload from '../../lib/upload';
import { AppContext } from '../../context/AppContext'


const ProfileUpdate = () => {

    const navigate = useNavigate()
    const [image, setImage] = useState(false)
    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [uid, setUid] = useState("")
    const [prevImg, setPrevImg] = useState("")
    const {setUserData} = useContext(AppContext)

    const profileUpdate = async (event)=>{
      event.preventDefault();
      try {
        if(!prevImg && !image){
          toast.error("Upload profile picture");
          return;
        }
        const docRef = doc(db, 'users', uid);
        if(image){
          const imgUrl = await upload(image);
          setPrevImg(imgUrl);
          await updateDoc(docRef, {
            avatar: imgUrl,
            bio: bio,
            name: name
          })
        }else{
          await updateDoc(docRef, {
            bio: bio,
            name: name
          })
        }
        const snap = await getDoc(docRef);
        setUserData(snap.data());
        toast.success('Profile updated successfully');
        navigate('/chat');
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    }

    useEffect(()=>{
      onAuthStateChanged(auth, async (user)=>{
        if(user){
          setUid(user.uid)
          const docRef = doc(db,"users",user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');
            setBio(data.bio || '');
            setPrevImg(data.avatar || '');
          }
        }
        else{
          navigate('/')
        }
      })
    }, [navigate])
    
  return (
    <div className='profile'>
      <div className='profile-container'>
        <form onSubmit={profileUpdate}>
            <h3>Profile Details</h3>
            <label htmlFor='avatar'>
                <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpeg, .jpg' hidden />
                <img src={image? URL.createObjectURL(image) : prevImg || assets.avatar_icon} atl="" />
                Upload profile image
            </label>
            <input onChange={(e)=>setName(e.target.value)} value={name} type='text' placeholder='Your name' required/>
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write profile bio'></textarea>
            <button type='submit'>Save</button>
        </form>
        <img src={image? URL.createObjectURL(image) : prevImg || assets.logo_icon} className='profile-pic' alt='' />
      </div>
    </div>
  )
}

export default ProfileUpdate

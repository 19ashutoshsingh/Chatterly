import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const upload = async (file) =>{
    if (!file) {
        console.error("No file provided for upload.");
        return;
    }

    console.log("File to be uploaded:", file);

    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now() + file.name}`)

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve,reject)=>{
        uploadTask.on('state_changed',
            (snapshot) =>{
                const progress = (snapshot.bytesTransferred/snapshot.totalBytes)*100;
                console.log('Upload progress:', progress + '%');
                // console.log(snapshot.state)
                switch (snapshot.state){
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                    default:
                        console.log('Upload state:', snapshot.state);
                }
            },
            (error)=>{
                console.error('Upload failed:', error);
                reject(error); // Reject the promise in case of an error
            },
            ()=>{
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
                    console.log('File available at:', downloadURL);
                    resolve (downloadURL)
                })
            }
        );
    })    
}

export default upload
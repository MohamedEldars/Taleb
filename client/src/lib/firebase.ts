import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Auth functions
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

export const signInWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

// User profile functions
export const createUserProfile = async (user: User, additionalData?: any) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);
  
  if (!userSnapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();
    
    try {
      await setDoc(userRef, {
        id: user.uid,
        displayName: displayName || 'طالب جديد',
        email,
        photoURL: photoURL || '',
        role: 'student',
        school: '',
        grade: '',
        subjects: [],
        points: 0,
        level: 1,
        createdAt,
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }
  
  return userRef;
};

export const getUserProfile = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userRef);
  return userSnapshot.exists() ? userSnapshot.data() : null;
};

// Posts functions
export const createPost = async (postData: {
  content: string;
  subject?: string;
  type: 'text' | 'question' | 'image' | 'pdf';
  imageUrl?: string;
  pdfUrl?: string;
  privacy: 'public' | 'class';
  authorId: string;
  authorName: string;
  authorPhoto?: string;
}) => {
  try {
    const postsRef = collection(db, 'posts');
    const newPost = {
      ...postData,
      createdAt: serverTimestamp(),
      likes: 0,
      commentsCount: 0,
      likedBy: [],
    };
    
    const docRef = await addDoc(postsRef, newPost);
    return docRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const getPosts = async () => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

export const getUserPosts = async (userId: string) => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef, 
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
};

export const likePost = async (postId: string, userId: string) => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    
    if (postSnapshot.exists()) {
      const postData = postSnapshot.data();
      const likedBy = postData.likedBy || [];
      const isLiked = likedBy.includes(userId);
      
      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          likes: Math.max(0, (postData.likes || 0) - 1),
          likedBy: likedBy.filter((id: string) => id !== userId)
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likes: (postData.likes || 0) + 1,
          likedBy: [...likedBy, userId]
        });
      }
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Comments functions
export const addComment = async (postId: string, comment: {
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
}) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const newComment = {
      ...comment,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(commentsRef, newComment);
    
    // Update post comment count
    const postRef = doc(db, 'posts', postId);
    const postSnapshot = await getDoc(postRef);
    if (postSnapshot.exists()) {
      await updateDoc(postRef, {
        commentsCount: (postSnapshot.data().commentsCount || 0) + 1
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const getComments = async (postId: string) => {
  try {
    const commentsRef = collection(db, 'posts', postId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
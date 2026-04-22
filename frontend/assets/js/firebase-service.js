// firebase-service.js
import { app, auth, db, storage } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// AUTHENTICATION FUNCTIONS
export async function adminLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function adminLogout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// NEWS FUNCTIONS
export async function addNews(data) {
  await addDoc(collection(db, "news"), data);
}

export async function getNews() {
  const snapshot = await getDocs(collection(db, "news"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteNews(id) {
  await deleteDoc(doc(db, "news", id));
}

export async function updateNews(id, data) {
  await updateDoc(doc(db, "news", id), data);
}

// PROJECTS FUNCTIONS
export async function addProject(data) {
  await addDoc(collection(db, "projects"), data);
}

export async function getProjects() {
  const snapshot = await getDocs(collection(db, "projects"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteProject(id) {
  await deleteDoc(doc(db, "projects", id));
}

export async function updateProject(id, data) {
  await updateDoc(doc(db, "projects", id), data);
}

// VOLUNTEERS FUNCTIONS
export async function addVolunteer(data) {
  await addDoc(collection(db, "volunteers"), data);
}

export async function getVolunteers() {
  const snapshot = await getDocs(collection(db, "volunteers"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteVolunteer(id) {
  await deleteDoc(doc(db, "volunteers", id));
}

// DONATIONS FUNCTIONS
export async function addDonation(data) {
  await addDoc(collection(db, "donations"), data);
}

export async function getDonations() {
  const snapshot = await getDocs(collection(db, "donations"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteDonation(id) {
  await deleteDoc(doc(db, "donations", id));
}

// CONTACT MESSAGES FUNCTIONS
export async function addContactMessage(data) {
  await addDoc(collection(db, "contacts"), data);
}

export async function getContactMessages() {
  const snapshot = await getDocs(collection(db, "contacts"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteContactMessage(id) {
  await deleteDoc(doc(db, "contacts", id));
}

// IMAGE UPLOAD FUNCTIONS
export async function uploadImage(file, folder = 'images') {
  // Sanitize filename: remove spaces and special characters
  const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const timestamp = Date.now();
  const filename = `${folder}/${timestamp}_${sanitized}`;
  const storageRef = ref(storage, filename);
  
  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteImage(downloadURL) {
  try {
    let path = downloadURL;
    if (downloadURL.startsWith('https://firebasestorage.googleapis.com/')) {
      const url = new URL(downloadURL);
      const nameParam = url.searchParams.get('name');
      if (nameParam) {
        path = decodeURIComponent(nameParam);
      }
    }
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
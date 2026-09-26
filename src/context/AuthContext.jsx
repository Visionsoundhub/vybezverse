import React, { createContext, useContext, useState, useEffect } from 'react';

// Το Firebase (548KB) φορτώνει ΜΕΤΑ το πρώτο βάψιμο της σελίδας, όχι πριν.
// Έτσι το site ανοίγει αμέσως και οι λογαριασμοί ενεργοποιούνται λίγο μετά.
let fbPromise = null;
export function loadFirebase() {
  if (!fbPromise) {
    fbPromise = Promise.all([import('../firebase'), import('firebase/auth'), import('firebase/firestore')])
      .then(([base, a, f]) => ({ auth: base.auth, db: base.db, ...a, ...f }));
  }
  return fbPromise;
}

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Trigger modal when an action requires login
  const requireLogin = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return false;
    }
    return true;
  };

  async function signup(email, password, name) {
    const { auth, db, createUserWithEmailAndPassword, updateProfile, doc, setDoc } = await loadFirebase();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update profile with name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Save to Firestore for leads
    try {
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Error saving user to DB", e);
    }

    // Force context update by re-setting user with new displayName
    setCurrentUser({ ...userCredential.user, displayName: name });
    return userCredential;
  }

  async function login(email, password) {
    const { auth, signInWithEmailAndPassword } = await loadFirebase();
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    const { auth, signOut } = await loadFirebase();
    return signOut(auth);
  }

  async function loginWithGoogle() {
    const { auth, db, GoogleAuthProvider, signInWithPopup, doc, getDoc, setDoc } = await loadFirebase();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Check if user exists in Firestore, if not create them
    try {
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          createdAt: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error("Error checking/saving Google user to DB", e);
    }
    
    return result;
  }

  useEffect(() => {
    let unsubscribe = () => {};
    let alive = true;
    const start = () => loadFirebase().then(({ auth, onAuthStateChanged }) => {
      if (!alive) return;
      unsubscribe = onAuthStateChanged(auth, user => {
        setCurrentUser(user);
        setLoading(false);
      });
    });
    // Περιμένει να ησυχάσει ο browser (ή 2,5″) πριν φέρει το Firebase
    const idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1500);
    return () => { alive = false; unsubscribe(); if (window.cancelIdleCallback) window.cancelIdleCallback(idle); else clearTimeout(idle); };
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    loginWithGoogle,
    logout,
    requireLogin,
    authLoading: loading,
    authModalOpen,
    setAuthModalOpen
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

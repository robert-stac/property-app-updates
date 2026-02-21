import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail // Added for password management
} from "firebase/auth";
import { auth, db } from "../firebase"; 
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; // Added updateDoc

interface UserProfile {
  uid: string;
  email: string;
  role: "admin" | "user";
  username: string;
  lastActive?: string; // Track activity
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  registerNewUser: (email: string, pass: string, username: string, role: "admin" | "user") => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>; // Added to interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser && db) {
        try {
          const docRef = doc(db, "users", firebaseUser.uid);
          
          // UPDATE: Stamp the current time as "lastActive" on every session start/refresh
          await updateDoc(docRef, {
            lastActive: new Date().toISOString()
          }).catch(() => {
             // If the document doesn't exist yet (first time Google login), 
             // we handle that in the login logic instead.
          });

          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              role: data.role || "user",
              username: data.username || "User",
              lastActive: data.lastActive
            });
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Firestore sync error:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!db) return;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const newProfile = {
        username: user.displayName || user.email?.split('@')[0] || "User",
        role: "user" as const,
        email: user.email || "",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      await setDoc(docRef, newProfile);
      
      setCurrentUser({
        uid: user.uid,
        email: user.email || "",
        role: "user",
        username: newProfile.username
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  const registerNewUser = async (email: string, pass: string, username: string, role: "admin" | "user") => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (!db) return;

    await setDoc(doc(db, "users", res.user.uid), {
      username,
      role,
      email,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });
  };

  // NEW: Password Reset Logic
  const resetUserPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      logout, 
      registerNewUser, 
      loginWithGoogle,
      resetUserPassword // Exported to the app
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
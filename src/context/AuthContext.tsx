import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInAnonymously
} from "firebase/auth";
import { auth, db } from "../firebase"; 
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

interface UserProfile {
  uid: string;
  email: string;
  role: "admin" | "user";
  username: string;
  lastActive?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  registerNewUser: (email: string, pass: string, username: string, role: "admin" | "user") => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  bypassLoginDev: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser && db) {
        // 1. Allow Anonymous local dev user
        if (firebaseUser.isAnonymous) {
          setCurrentUser({
            uid: firebaseUser.uid,
            email: "admin@localhost.com",
            role: "admin",
            username: "Local Admin"
          });
          setLoading(false);
          return;
        }

        try {
          // 2. Check if user is registered by UID or Email in 'users' collection
          let docRef = doc(db, "users", firebaseUser.uid);
          let docSnap = await getDoc(docRef);

          if (!docSnap.exists() && firebaseUser.email) {
            const q = query(collection(db, "users"), where("email", "==", firebaseUser.email.toLowerCase()));
            const querySnap = await getDocs(q);
            if (!querySnap.empty) {
              docSnap = querySnap.docs[0];
            }
          }

          if (docSnap.exists()) {
            const data = docSnap.data();
            await updateDoc(doc(db, "users", docSnap.id), {
              lastActive: new Date().toISOString()
            }).catch(() => {});

            setCurrentUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || data.email || "",
              role: data.role || "user",
              username: data.username || "User",
              lastActive: data.lastActive
            });
          } else {
            // UNREGISTERED ACCOUNT -> DENY ACCESS & SIGN OUT
            console.warn(`Access Denied: ${firebaseUser.email} is not registered in the system personnel directory.`);
            await signOut(auth).catch(() => {});
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Firestore verification error:", error);
          const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
          if (!isLocal) {
            setCurrentUser(null);
          }
        }
      } else {
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const devBypassDisabled = localStorage.getItem("dev_bypass_disabled") === "true";
        if (isLocal && !devBypassDisabled) {
          try {
            await signInAnonymously(auth);
            return;
          } catch (e) {
            console.warn("Dev anonymous sign in failed:", e);
            setCurrentUser({
              uid: "localhost-dev-admin",
              email: "admin@localhost.com",
              role: "admin",
              username: "Local Admin"
            });
          }
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const bypassLoginDev = async () => {
    localStorage.removeItem("dev_bypass_disabled");
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
    } catch (err) {
      console.warn("Dev anonymous sign in failed:", err);
    }
    setCurrentUser({
      uid: auth.currentUser?.uid || "localhost-dev-admin",
      email: auth.currentUser?.email || "admin@localhost.com",
      role: "admin",
      username: "Local Admin"
    });
  };

  const login = async (email: string, pass: string) => {
    localStorage.removeItem("dev_bypass_disabled");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const errMsg = String(err?.message || "");
      if (isLocal && (errMsg.includes("referer") || errMsg.includes("blocked") || err?.code === "auth/requests-from-referer-are-blocked")) {
        console.warn("Firebase Auth API key blocked for localhost referer. Auto-authenticating local admin session.");
        setCurrentUser({
          uid: "localhost-dev-admin",
          email: email || "admin@localhost.com",
          role: "admin",
          username: "Local Admin"
        });
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    localStorage.removeItem("dev_bypass_disabled");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!db) return;

    // 1. Check if UID exists in Firestore 'users'
    let docRef = doc(db, "users", user.uid);
    let docSnap = await getDoc(docRef);

    // 2. If not found by UID, check if registered by Email
    if (!docSnap.exists() && user.email) {
      const q = query(collection(db, "users"), where("email", "==", user.email.toLowerCase()));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        docSnap = querySnap.docs[0];
      }
    }

    // 3. Reject if user is NOT registered in System Personnel directory
    if (!docSnap.exists()) {
      await signOut(auth).catch(() => {});
      setCurrentUser(null);
      throw new Error(`Access Denied: ${user.email} is not registered in the System Personnel directory. Please contact an Admin.`);
    }

    const data = docSnap.data();
    setCurrentUser({
      uid: user.uid,
      email: user.email || data.email || "",
      role: data.role || "user",
      username: data.username || user.displayName || "User",
      lastActive: data.lastActive
    });
  };

  const logout = async () => {
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocal) {
      localStorage.setItem("dev_bypass_disabled", "true");
    }
    await signOut(auth).catch(() => {});
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
      resetUserPassword,
      bypassLoginDev
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
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { setCurrentUser } from '../utils/localStorage';

const AuthContext = createContext(null);

const roleKey = (uid) => `user-role-${uid}`;

async function fetchRoleFromFirestore(uid) {
    try {
        const snap = await Promise.race([
            getDoc(doc(db, 'users', uid)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
        ]);
        if (snap.exists()) return snap.data().role;
    } catch {
        // Firestore not enabled or network issue — fall through to localStorage
    }
    return null;
}

async function saveRoleToFirestore(uid, email, role) {
    try {
        await Promise.race([
            setDoc(doc(db, 'users', uid), { role, email }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
        ]);
    } catch {
        // Firestore not enabled — role is already saved in localStorage below
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(undefined);
    const [role, setRole] = useState(undefined);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setCurrentUser(firebaseUser?.uid ?? null);

            if (firebaseUser) {
                // Set role immediately from localStorage so the dashboard shows at once
                const cached = localStorage.getItem(roleKey(firebaseUser.uid)) || 'student';
                setRole(cached);

                // Sync from Firestore in the background without blocking
                fetchRoleFromFirestore(firebaseUser.uid).then(firestoreRole => {
                    if (firestoreRole && firestoreRole !== cached) {
                        setRole(firestoreRole);
                        localStorage.setItem(roleKey(firebaseUser.uid), firestoreRole);
                    }
                });
            } else {
                setRole(null);
            }
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const switchRole = (newRole) => {
        if (!user) return;
        localStorage.setItem(roleKey(user.uid), newRole);
        setRole(newRole);
        saveRoleToFirestore(user.uid, user.email, newRole);
    };

    const signup = async (email, password, selectedRole = 'student') => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Always save to localStorage immediately (instant, no network needed)
        localStorage.setItem(roleKey(cred.user.uid), selectedRole);
        setRole(selectedRole);
        // Try to also save to Firestore (won't block if it fails)
        saveRoleToFirestore(cred.user.uid, email, selectedRole);
        return cred;
    };

    const resetPassword = (email) => sendPasswordResetEmail(auth, email);

    const logout = () => signOut(auth);

    const loading = user === undefined || role === undefined;

    return (
        <AuthContext.Provider value={{ user, role, login, signup, logout, resetPassword, switchRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

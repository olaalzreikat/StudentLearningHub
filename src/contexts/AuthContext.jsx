import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { setCurrentUser } from '../utils/localStorage';

const AuthContext = createContext(null);

const roleKey = (uid) => `user-role-${uid}`;

async function fetchRoleFromFirestore(uid) {
    try {
        const snap = await Promise.race([
            getDoc(doc(db, 'users', uid)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
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
            setDoc(doc(db, 'users', uid), { role, email }, { merge: true }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
        ]);
    } catch {
        // Firestore unavailable — role is saved in localStorage
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
                // Only oalzreikat@gmail.com can ever be tutor — everyone else is always student
                if (firebaseUser.email !== 'oalzreikat@gmail.com') {
                    setRole('student');
                    localStorage.setItem(roleKey(firebaseUser.uid), 'student');
                    saveRoleToFirestore(firebaseUser.uid, firebaseUser.email, 'student');
                    return;
                }

                const cached = localStorage.getItem(roleKey(firebaseUser.uid));

                if (cached) {
                    // Cached role available — show immediately, then verify with Firestore
                    setRole(cached);
                    fetchRoleFromFirestore(firebaseUser.uid).then(firestoreRole => {
                        if (firestoreRole && firestoreRole !== cached) {
                            setRole(firestoreRole);
                            localStorage.setItem(roleKey(firebaseUser.uid), firestoreRole);
                        } else if (!firestoreRole) {
                            saveRoleToFirestore(firebaseUser.uid, firebaseUser.email, cached);
                        }
                    });
                } else {
                    fetchRoleFromFirestore(firebaseUser.uid).then(firestoreRole => {
                        const finalRole = firestoreRole || 'tutor';
                        setRole(finalRole);
                        localStorage.setItem(roleKey(firebaseUser.uid), finalRole);
                    });
                }
            } else {
                setRole(null);
            }
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const switchRole = async (newRole) => {
        if (!user) return;
        localStorage.setItem(roleKey(user.uid), newRole);
        setRole(newRole);
        await saveRoleToFirestore(user.uid, user.email, newRole);
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

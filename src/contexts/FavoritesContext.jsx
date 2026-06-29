import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

const GUEST_KEY = 'student-favorites';
const favRef = (uid) => doc(db, 'users', uid, 'data', 'favorites');

export function FavoritesProvider({ children }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState({});

    useEffect(() => {
        if (!user) {
            // Guest — read from localStorage
            try { setFavorites(JSON.parse(localStorage.getItem(GUEST_KEY) || '{}')); }
            catch { setFavorites({}); }
            return;
        }

        // Authenticated — seed instantly from localStorage cache, then open real-time listener
        try {
            const cached = localStorage.getItem(`favorites-${user.uid}`);
            if (cached) setFavorites(JSON.parse(cached));
        } catch {}

        const unsub = onSnapshot(favRef(user.uid), (snap) => {
            const data = snap.exists() ? snap.data() : {};
            setFavorites(data);
            // Keep localStorage cache in sync for instant next-load seeding
            localStorage.setItem(`favorites-${user.uid}`, JSON.stringify(data));
        }, () => {
            // Firestore unavailable — stay on cached state
        });

        return unsub;
    }, [user?.uid]);

    const toggleFavorite = async (type, id) => {
        const sid = String(id);
        const list = favorites[type] || [];
        const newList = list.includes(sid) ? list.filter(x => x !== sid) : [...list, sid];
        const updated = { ...favorites, [type]: newList };

        setFavorites(updated); // optimistic — instant UI response

        if (user) {
            try {
                await setDoc(favRef(user.uid), updated);
                localStorage.setItem(`favorites-${user.uid}`, JSON.stringify(updated));
            } catch {
                setFavorites(favorites); // rollback on Firestore error
            }
        } else {
            localStorage.setItem(GUEST_KEY, JSON.stringify(updated));
        }
    };

    const isFav = (type, id) => (favorites[type] || []).includes(String(id));

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFav }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export const useFavorites = () => useContext(FavoritesContext);

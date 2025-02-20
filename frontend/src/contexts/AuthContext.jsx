import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserInDatabase, getUserData } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function
  const signup = async (email, password, name) => {
    try {
      // First create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Then create user in database
      try {
        const dbUser = await createUserInDatabase(email, name);
        setUserProfile(dbUser);
      } catch (dbError) {
        // If database creation fails, delete the Firebase user
        await userCredential.user.delete();
        throw new Error(`Failed to create user in database: ${dbError.message}`);
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login for email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase login successful:', userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    setUserProfile(null);
    return signOut(auth);
  };

  // Fetch user profile from database
  const fetchUserProfile = async (email) => {
    try {
      console.log('Fetching user profile for email:', email);
      const userData = await getUserData(email);
      console.log('User profile fetched:', userData);
      setUserProfile(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  // Set up auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. Current user:', user);
      setCurrentUser(user);
      if (user) {
        console.log('Fetching user profile for authenticated user:', user.email);
        await fetchUserProfile(user.email);
      } else {
        console.log('No authenticated user, clearing user profile');
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
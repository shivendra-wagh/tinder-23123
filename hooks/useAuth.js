import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as Google from "expo-google-app-auth";
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signOut } from '@firebase/auth';
import { auth } from "../firebase";
// import { setStatusBarNetworkActivityIndicatorVisible } from 'expo-status-bar';

const AuthContext = createContext({})

const config = {
    androidClientId: '944471753152-i5tc5lisuifhbj1hngo8o45co02tid2s.apps.googleusercontent.com',
    iosClientId: '944471753152-oc26jcvfolpod4vni7con4np44tub4lj.apps.googleusercontent.com',
    scopes: ["profile", "email"],
    permissions: ["public_profile", "email", "gender", "location"]
};

export const AuthProvider = ({ children }) => {
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(
        () =>
        onAuthStateChanged(auth, (user) => {
            if (user) {
                //Loged in
                setUser(user);
            }   
            else{
                setUser(null);
            }

            setLoadingInitial(false)
        })
        
    ,[]);

    const signInWithGoogle = async () =>{
        setLoading(true);
        await Google.logInAsync(config).then(async(logInResult) => {
            if (logInResult.type === "success") {
                const { idToken, accessToken } = logInResult;
                const credential = GoogleAuthProvider.credential(idToken, accessToken);

                await signInWithCredential(auth, credential);
            }

            return Promise.reject();
        })
        .catch((error) => setError(error))
        .finally(() => setLoading(false));
    };

    const logout = async () =>{
        setLoading(true);

        signOut(auth).catch((error) => setError(error))
        .finally(() => setLoading(false));
    };

    const memoedValue = useMemo(
      () => ({
        user,
        loading,
        error,
        signInWithGoogle,
        logout,
    }), 
    [user, loading, error]
    );

    return (
        <AuthContext.Provider value={memoedValue}>
        
            {!loadingInitial && children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}



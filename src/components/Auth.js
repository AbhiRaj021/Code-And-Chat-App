// import React, { useState } from "react";
// import { auth, provider } from "../firebase-config";
// import { signInWithPopup } from "firebase/auth";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faGoogle } from '@fortawesome/free-brands-svg-icons';
// import "../styles/Auth.css";
// import Cookies from "universal-cookie";

// const cookies = new Cookies();    //cookies variable used to get,set an dremove cookies from your browser //cookies is reference to the instance of class Cookies provided by Cookies library

// export const Auth = (props) => {

//     const { setIsAuth } = props;
//     const [isSigningIn, setIsSigningIn] = useState(false); // use state instead of let

//     const signInWithGoogle = async () => {//asynchronous function do its task without stopping execution of other parts of a program

//         if (isSigningIn) return;
//         setIsSigningIn(true);
//         try {
//             const result = await signInWithPopup(auth, provider);   //signInWithPopup:allows a user to sign in to your application using a pop-up window with a specified authentication provider //await: to pause the execution of the code in asynchronous fun until the asynchronous operation signInWithPopup(auth,provider); is complete
//             cookies.set("auth-token", result.user.refreshToken);    //refereshToken: user can access the website without re-entering credentials everytime....unique for each user within a specific app//auth-token:name of cookie set by app...this name is same for all users of this app
//             setIsAuth(true);

//         } catch (err) {
//             if (err.code === "auth/cancelled-popup-request") {
//                 console.warn("Popup cancelled");
//             } else {
//                 console.error("Login error", err);
//             }
//         } finally {
//             setIsSigningIn(false); // allow login again after it's done
//         }
//     };

//     return (
//         <div className="auth">
//             <h2>Welcome to Code and Chat App, have fun.</h2>
//             <p>In this application, you can collaborate with your friends on a code playground and chat with everyone in the room.</p>
//             <button onClick={signInWithGoogle} disabled={isSigningIn}><FontAwesomeIcon icon={faGoogle} /> Sign In With Google</button>
//         </div>
//     );
// };

import React, { useState, useRef, useEffect } from "react";
import { auth, provider } from "../firebase-config";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import "../styles/Auth.css";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export const Auth = (props) => {
    const { setIsAuth } = props;
    const [isSigningIn, setIsSigningIn] = useState(false);
    const signInAttemptRef = useRef(false);

    // Check for redirect result when component mounts
    useEffect(() => {
        const checkRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("Redirect sign-in successful");
                    cookies.set("auth-token", result.user.refreshToken);
                    setIsAuth(true);
                }
            } catch (error) {
                console.error("Redirect result error:", error);
            }
        };

        checkRedirectResult();
    }, [setIsAuth]);

    const signInWithGoogle = async () => {
        if (isSigningIn || signInAttemptRef.current) {
            console.log("Sign-in already in progress");
            return;
        }

        setIsSigningIn(true);
        signInAttemptRef.current = true;

        try {
            console.log("Starting Google sign-in...");
            
            // Use different methods based on environment
            const isProduction = window.location.hostname !== 'localhost';
            
            if (isProduction) {
                // Use redirect for production (more reliable on mobile/hosted sites)
                console.log("Using redirect method for production...");
                await signInWithRedirect(auth, provider);
            } else {
                // Use popup for local development
                const result = await signInWithPopup(auth, provider);
                console.log("Popup sign-in successful");
                cookies.set("auth-token", result.user.refreshToken);
                setIsAuth(true);
            }

        } catch (err) {
            console.error("Sign-in error:", err);
            setIsSigningIn(false);
            signInAttemptRef.current = false;
        }
    };

    return (
        <div className="auth">
            <h2>Welcome to Code and Chat App, have fun.</h2>
            <p>In this application, you can collaborate with your friends on a code playground and chat with everyone in the room.</p>
            <button 
                onClick={signInWithGoogle} 
                disabled={isSigningIn}
                style={{ opacity: isSigningIn ? 0.6 : 1 }}
            >
                <FontAwesomeIcon icon={faGoogle} /> 
                {isSigningIn ? "Signing In..." : "Sign In With Google"}
            </button>
        </div>
    );
};
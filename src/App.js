// import { useRef, useState, useEffect } from "react";
// import "./App.css";
// import Cookies from "universal-cookie";
// import { Auth } from "./components/Auth";
// import { CodeEditor } from "./components/CodeEditor";
// import { Chat } from "./components/Chat";
// import { signOut } from "firebase/auth";
// import { auth } from "./firebase-config";

// const cookies = new Cookies();  //cookies variable used to get,set an dremove cookies from your browser //cookies is reference to the instance of class Cookies provided by Cookies library

// function App() {
//   const [isAuth, setIsAuth] = useState(cookies.get("auth-token")); //cookies.get("auth-token"):retrieve the value of a cookie with the name "auth-token" //user is authenticated or not
//   const [room, setRoom] = useState(null);

//   const roomInputRef = useRef(null); //variable created using useRef hook doesnot rerender the component when its value changed unlike state variables

//   const signUserOut = async () => {
//     await signOut(auth); //will signOut the user
//     cookies.remove("auth-token"); //will remove cookie with name auth-token name
//     setIsAuth(false);
//     setRoom(null);
//   };

//   if(!isAuth) //if auth-token has undefined or any value that is not valid....or user is not authenticated
//   {
//     return (
//       <div className="App">
//         <Auth setIsAuth={setIsAuth}/>
//       </div>
//     );
//   }
  
//     return (
//       <div className="main">
//         {room ? (
//           <div className="code-chat">
//             {" "}
//             {/*if room has set some name this div will be returned*/}
//             <CodeEditor room={room} />
//             <Chat room={room} />
//           </div>
//         ) : (
//           <div className="room">
//             {" "}
//             {/*if room has not set any name this div will be returned*/}
//             <input ref={roomInputRef} placeholder="Room Name" />{" "}
//             {/*ref attribute to create a reference to the <input> element*/}
//             <button onClick={() => setRoom(roomInputRef.current.value)}>
//               Join Room
//             </button>
//             <button onClick={() => setRoom(roomInputRef.current.value)}>
//               Create New Room
//             </button>
//           </div>
//         )}
//         <div className="sign-out">
//           <button onClick={signUserOut}>Sign Out</button>
//         </div>
//       </div>
//     );
// }

// export default App;

import { useRef, useState, useEffect } from "react";
import "./App.css";
import Cookies from "universal-cookie";
import { Auth } from "./components/Auth";
import { CodeEditor } from "./components/CodeEditor";
import { Chat } from "./components/Chat";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";

const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(null); // Start with null to show loading
  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState(null);

  const roomInputRef = useRef(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user);
      if (user) {
        // User is signed in
        const authToken = cookies.get("auth-token");
        if (!authToken) {
          // Set cookie if it doesn't exist
          cookies.set("auth-token", user.refreshToken);
        }
        setIsAuth(true);
      } else {
        // User is signed out
        cookies.remove("auth-token");
        setIsAuth(false);
        setRoom(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const signUserOut = async () => {
    try {
      await signOut(auth);
      cookies.remove("auth-token");
      setIsAuth(false);
      setRoom(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <div className="auth">
        <h2>Loading...</h2>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuth) {
    return (
      <div className="App">
        <Auth setIsAuth={setIsAuth}/>
      </div>
    );
  }
  
  // Show main app if authenticated
  return (
    <div className="main">
      {room ? (
        <div className="code-chat">
          <CodeEditor room={room} />
          <Chat room={room} />
        </div>
      ) : (
        <div className="room">
          <input ref={roomInputRef} placeholder="Room Name" />
          <button onClick={() => setRoom(roomInputRef.current.value)}>
            Join Room
          </button>
          <button onClick={() => setRoom(roomInputRef.current.value)}>
            Create New Room
          </button>
        </div>
      )}
      <div className="sign-out">
        <button onClick={signUserOut}>Sign Out</button>
      </div>
    </div>
  );
}

export default App;
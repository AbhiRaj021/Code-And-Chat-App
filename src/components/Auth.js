import { auth, provider } from "../firebase-config";
import { signInWithPopup } from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import "../styles/Auth.css";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export const Auth = (props) => {
  const { setIsAuth } = props;
  const [isSigningIn, setIsSigningIn] = React.useState(false); // use state instead of let

  const signInWithGoogle = async () => {
    if (isSigningIn) return; // stop multiple clicks
    setIsSigningIn(true); // block further attempts

    try {
      const result = await signInWithPopup(auth, provider);
      cookies.set("auth-token", result.user.refreshToken);
      setIsAuth(true);
    } catch (err) {
      if (err.code === "auth/cancelled-popup-request") {
        console.warn("Popup cancelled");
      } else {
        console.error("Login error", err);
      }
    } finally {
      setIsSigningIn(false); // allow login again after it's done
    }
  };

  return (
    <div className="auth">
      <h2>Welcome to Code and Chat App, have fun.</h2>
      <p>Collaborate and chat in real time!</p>
      <button onClick={signInWithGoogle} disabled={isSigningIn}>
        <FontAwesomeIcon icon={faGoogle} /> Sign In With Google
      </button>
    </div>
  );
};

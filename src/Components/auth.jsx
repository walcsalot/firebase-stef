import { useState } from "react";
import { auth, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up with email and password
  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message); // Show error message to the user
    }
  };

  // Sign in with email and password
  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Signed in successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message); // Show error message to the user
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Signed in with Google successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message); // Show error message to the user
    }
  };

  // Log out
  const logout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message); // Show error message to the user
    }
  };

  return (
    <div>
      <h2>Authentication</h2>
      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={signUp}>Sign Up</button>
      <button onClick={signIn}>Sign In</button>
      <button onClick={signInWithGoogle}>Sign In with Google</button>
      <button onClick={logout}>Log Out</button>

      {/* Display current user info */}
      {auth.currentUser && (
        <div>
          <h3>Current User:</h3>
          <p>Email: {auth.currentUser.email}</p>
          {auth.currentUser.photoURL && (
            <img
              src={auth.currentUser.photoURL}
              alt="Profile"
              style={{ width: "50px", borderRadius: "50%" }}
            />
          )}
        </div>
      )}
    </div>
  );
};
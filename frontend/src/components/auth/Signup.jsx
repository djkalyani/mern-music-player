import React, { useState } from "react";
import Input from "../common/Input";
import { useDispatch, useSelector } from "react-redux";
import { closeAuthModal, switchAuthMode } from "../../redux/slices/uiSlice";
import { clearError, setError, setLoading, setUser } from "../../redux/slices/authSlice";
import { CiUser } from "react-icons/ci";
import axios from "axios";
import "../../css/auth/Signup.css";

const Signup = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [base64Image, setBase64Image] = useState("");

  const handleImageChange = (e) => {
    // FIX: Changed 'filess' to 'files'
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewImage(reader.result);
      setBase64Image(reader.result);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!fullName || !email || !password) {
      dispatch(setError("Please fill all fields"));
      return;
    }

    dispatch(setLoading(true));

    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/auth/signup`, {
        name: fullName,
        email,
        password,
        avatar: base64Image ? base64Image : undefined,
      });

      const data = res.data || {};
      
      // FIX: Changed 'setser' to 'setUser'
      dispatch(
        setUser({
          user: data.user,
          token: data.token,
        })
      );

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      
      dispatch(closeAuthModal());
      console.log("Signup Successful");
    } catch (err) {
      // FIX: Improved error path for Axios
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      dispatch(setError(serverMessage || "Signup Failed. Please try again"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="signup-wrapper">
      <h3 className="signup-title">Create an Account</h3>
      <p className="signup-subtitle">Join us today by entering the details</p>
      
      <form className="signup-form" onSubmit={handleSubmit}>
        <div className="profile-image-container">
          {previewImage ? (
            <img src={previewImage} alt="avatar" className="profile-image" />
          ) : (
            <div className="profile-placeholder">
              <CiUser size={40} />
            </div>
          )}

          <label className="image-upload-icon">
            📁
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              onChange={handleImageChange} 
            />
          </label>
        </div>

        <Input
          label="Name"
          type="text"
          placeholder="Enter your name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email Id" // FIX: Corrected spelling from 'plaeholder'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password" // FIX: Corrected spelling from 'plaeholder'
          value={password}
          onChange={(e) => setPassword(e.target.value)} // FIX: Changed 'setEmail' to 'setPassword'
        />

        <span
          className="forgot-link"
          style={{ cursor: "pointer" }}
          onClick={() => {
            dispatch(clearError());
            dispatch(switchAuthMode("login"));
          }}
        >
          Do you already have an account?
        </span>

        {error && <div className="signup-error" style={{ color: "red" }}>{error}</div>}

        <div className="signup-actions">
          <button
            className="signup-btn-submit"
            disabled={isLoading}
            type="submit"
          >
            <span>{isLoading ? "Signing up..." : "Signup"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 
import image from '../assets/image.jpg';

const saveAuthData = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    window.location.reload(); 
};

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        
        try {
            const response = await axios.post(endpoint, { username, password });
            
            saveAuthData(response.data);

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Authentication failed. Please check credentials.';
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };
return (
  <div className="auth-wrapper">
    <div className="auth-container">
      {/* Left Section */}
      <div className="auth-info">
        <h1>Welcome to <span>Placement Hub ⚙</span></h1>
        <p>
          {isLogin
            ? "Login to access personalized dashboards, quizzes, and placement resources."
            : "Join Placement Hub today and get access to study materials, mock tests, and placement prep tools."}
        </p>
        <img
          src={image}
          alt="Placement illustration"
          className="auth-image"
        />
      </div>

      {/* Right Section */}
      <div className="auth-form-section">
        <h2>{isLogin ? "Login to Dashboard" : "Create an Account"}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username or email"
            required
          />

          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {isLogin && (
            <div className="password-options">
              <a href="#">Forgot Password?</a>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>

          {message && <p className="auth-message">{message}</p>}
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <>
              <span>Don’t have an account? </span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLogin(false);
                }}
              >
                Register here
              </a>
            </>
          ) : (
            <>
              <span>Already have an account? </span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLogin(true);
                }}
              >
                Login
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  </div>
);

};


export default AuthScreen;
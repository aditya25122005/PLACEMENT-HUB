import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 

// Helper function to save JWT token and user info to local storage
const saveAuthData = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    // Refresh the window to signal App.jsx to load the new state
    window.location.reload(); 
};

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true); // Login aur Register view toggle karne ke liye
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
            
            // Success! Save user data (token, role)
            saveAuthData(response.data);

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Authentication failed. Please check credentials.';
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        // New wrapper class for vertical centering (as defined in the updated CSS)
        <div className="auth-container-wrapper">
            <div className="auth-container">
                
                {/* 1. Header (Top Gradient Bar) */}
                <div className="auth-header">
                    <h1>Placement - Hub ⚙️</h1>
                </div>

                {/* 2. Main Content (White Card Body) */}
                <div className="auth-content">
                    
                    {/* Simplified & Bolder Title */}
                    <h2>{isLogin ? 'Access Your Hub' : 'Create New Account'}</h2>
                    <p className="subtitle">
                        {isLogin ? 
                         "Sign in to access your dashboard and verified resources." : 
                         "Join the platform by creating your student profile."
                        }
                    </p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Username Field */}
                        <label htmlFor="username">Username:</label>
                        <input 
                            id="username"
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Enter email or student ID"
                            required
                        />

                        {/* Password Field */}
                        <label htmlFor="password">Password:</label>
                        <input 
                            id="password"
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter your password"
                            required
                        />
                        
                        {/* Conditional Forgot Password Link (Only for Login View) */}
                        {isLogin && (
                            <div className="password-options">
                                {/* Use a generic link for the moment, replace with actual routing later */}
                                <a href="#" onClick={(e) => { e.preventDefault(); console.log('Forgot Password clicked'); }}>
                                    Forgot Password?
                                </a>
                            </div>
                        )}
                        
                        {/* Submit Button */}
                        <button type="submit" disabled={loading}>
                            {loading ? 'Processing...' : (isLogin ? 'Login to Dashboard' : 'Create Account')}
                        </button>
                    </form>

                    {message && <p className={`auth-message ${error.response ? 'error' : 'success'}`}>{message}</p>}

                    {/* Footer for Toggle (Styled as a simple text link via CSS) */}
                    <div className="auth-footer">
                        {isLogin ? 
                            <span>Need an account? </span> : 
                            <span>Already have an account? </span>
                        }
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}
                        >
                            {isLogin ? "Register Here" : "Login"}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default AuthScreen;
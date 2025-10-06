import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'; 
// Ek helper function jo JWT token aur user info ko local storage mein save karegi
const saveAuthData = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    // Window ko refresh karke App.jsx ko naye state mein load hone ka signal denge
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
            
            // Success! User data (token, role) ko save karo
            saveAuthData(response.data);

        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Authentication failed. Please check credentials.';
            setMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>{isLogin ? 'Student / Moderator Login' : 'Student Registration'}</h2>
            <p className="auth-subtitle">
                {isLogin ? 
                 "Access verified content and your dashboard." : 
                 "Create a new student account."
                }
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
                <label>Username:</label>
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter unique username"
                    required
                />

                <label>Password:</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Enter password"
                    required
                />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                </button>
            </form>

            {message && <p className={`auth-message ${message.includes('Success') ? 'success' : 'error'}`}>{message}</p>}

            <div className="auth-footer">
                <button 
                    onClick={() => setIsLogin(!isLogin)} 
                    className="switch-auth-btn"
                >
                    {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </button>
            </div>
        </div>
    );
};

export default AuthScreen;
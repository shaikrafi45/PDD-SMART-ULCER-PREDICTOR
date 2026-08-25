import React, { useState } from 'react';
import appLogo from '../assets/app_logo.png';

export function Login({ onBack, onLoginSuccess, onForgotPasswordClick, makeRequest, showToast }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            showToast("Email and password are required.");
            return;
        }
        
        setIsLoading(true);
        const res = await makeRequest('login.php', { 
            email: email.trim(), 
            password: password.trim() 
        });
        setIsLoading(false);
        
        if (res.status === 'success') {
            showToast("Login successful!");
            onLoginSuccess(res.user);
        } else {
            showToast(res.message || "Invalid credentials.");
        }
    };

    return (
        <section id="login-screen" className="screen active">
            <div className="auth-container">
                <div className="back-bar">
                    <button className="btn-back btn-back-dark" onClick={onBack} disabled={isLoading}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12,19 5,12 12,5"></polyline>
                        </svg>
                        <span>Back</span>
                    </button>
                </div>
                
                <div className="logo-badge">
                    <img src={appLogo} alt="Logo" />
                </div>
                
                <h2>Welcome Back 👋</h2>
                <p className="subtitle">Please log in with your registered email</p>
                
                <form id="login-form" className="auth-form mt-large" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <span className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </span>
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            required 
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="input-group">
                        <span className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </span>
                        <input 
                            type={passwordVisible ? "text" : "password"} 
                            placeholder="Enter your password" 
                            required 
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <button 
                            type="button" 
                            className="password-toggle" 
                            tabIndex="-1"
                            onClick={() => setPasswordVisible(!passwordVisible)}
                            disabled={isLoading}
                        >
                            {passwordVisible ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg className="eye-open" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    <div className="forgot-container">
                        <a href="#" className="forgot-link text-primary" onClick={(e) => { e.preventDefault(); onForgotPasswordClick(); }}>
                            Forgot Password?
                        </a>
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-large btn-auth" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : (
                            <span className="btn-text">Login</span>
                        )}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default Login;

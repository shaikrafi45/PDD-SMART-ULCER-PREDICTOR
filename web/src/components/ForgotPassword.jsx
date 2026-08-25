import React, { useState } from 'react';

export function ForgotPassword({ onBack, onSendSuccess, makeRequest, showToast }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            showToast("Email is required.");
            return;
        }
        
        setIsLoading(true);
        const res = await makeRequest('forgot_password.php', { 
            email: email.trim() 
        });
        setIsLoading(false);
        
        if (res.status === 'success') {
            showToast("Verification code sent to your email!");
            onSendSuccess(email.trim());
        } else {
            showToast(res.message || "Failed to generate code.");
        }
    };

    return (
        <section id="forgot-password-screen" className="screen active">
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
                
                <h2>Forgot Password?</h2>
                <p className="subtitle">Enter your email to receive a verification code</p>
                
                <form id="forgot-form" className="auth-form mt-large" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <span className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                        </span>
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            required 
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary btn-large btn-auth mt-large" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : (
                            <span className="btn-text">Send Code</span>
                        )}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default ForgotPassword;

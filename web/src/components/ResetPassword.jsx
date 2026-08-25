import React, { useState } from 'react';

export function ResetPassword({ onBack, onResetSuccess, emailAddress, makeRequest, showToast }) {
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resetCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            showToast("All fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            showToast("Password must be at least 6 characters.");
            return;
        }
        if (!emailAddress) {
            showToast("Session expired. Please request a new code.");
            onBack();
            return;
        }
        
        setIsLoading(true);
        const res = await makeRequest('reset_password.php', {
            email: emailAddress,
            reset_code: resetCode.trim(),
            new_password: newPassword.trim()
        });
        setIsLoading(false);
        
        if (res.status === 'success') {
            showToast("Password updated successfully!");
            onResetSuccess();
        } else {
            showToast(res.message || "Reset failed.");
        }
    };

    return (
        <section id="reset-password-screen" className="screen active">
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
                
                <h2>Reset Password</h2>
                <p className="subtitle">Set your new password to regain access to your account</p>
                
                <form id="reset-form" className="auth-form mt-large" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <span className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                            </svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Verification Code" 
                            required 
                            autoComplete="off"
                            value={resetCode}
                            onChange={(e) => setResetCode(e.target.value)}
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
                            placeholder="New Password" 
                            required 
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
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
                    
                    <div className="input-group">
                        <span className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </span>
                        <input 
                            type={confirmPasswordVisible ? "text" : "password"} 
                            placeholder="Confirm Password" 
                            required 
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <button 
                            type="button" 
                            className="password-toggle" 
                            tabIndex="-1"
                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                            disabled={isLoading}
                        >
                            {confirmPasswordVisible ? (
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
                    
                    <button type="submit" className="btn btn-primary btn-large btn-auth mt-large" disabled={isLoading}>
                        {isLoading ? (
                            <span className="spinner"></span>
                        ) : (
                            <span className="btn-text">Reset Password</span>
                        )}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default ResetPassword;

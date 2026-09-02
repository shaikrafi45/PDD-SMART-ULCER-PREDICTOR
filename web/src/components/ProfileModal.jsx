import React, { useState } from 'react';

export function ProfileModal({ isOpen, onClose, user, onLogout }) {
    const [confirmLogout, setConfirmLogout] = useState(false);

    if (!isOpen || !user) return null;

    const handleClose = () => {
        setConfirmLogout(false);
        onClose();
    };

    return (
        <div id="profile-modal" className="modal-overlay" onClick={(e) => { if (e.target.id === 'profile-modal') handleClose(); }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h3>{confirmLogout ? "Confirm Logout" : "User Profile"}</h3>
                    <button className="btn-close-modal" onClick={handleClose}>&times;</button>
                </div>
                <div className="modal-body text-center">
                    {!confirmLogout ? (
                        <>
                            <div className="avatar-large">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <h4 id="profile-name" className="mt-medium font-bold">{user.name}</h4>
                            <p id="profile-email" className="text-secondary">{user.email}</p>
                            <p id="profile-id" className="text-secondary text-sm mt-small">User ID: {user.id}</p>

                            <button 
                                id="btn-modal-logout"
                                className="btn btn-large btn-full-width mt-large" 
                                style={{ backgroundColor: '#E53935', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={() => setConfirmLogout(true)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <div style={{ padding: '12px 0' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#FFEBEE',
                                color: '#E53935',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px auto'
                            }}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <h4 className="font-bold text-md">Are you sure you want to log out?</h4>
                            <p className="text-secondary text-sm mt-small">
                                You will need to enter your email and password to log in again.
                            </p>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-full-width"
                                    onClick={() => setConfirmLogout(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-full-width"
                                    style={{ backgroundColor: '#E53935', color: '#FFFFFF' }}
                                    onClick={() => {
                                        handleClose();
                                        if (onLogout) onLogout();
                                    }}
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;

import React from 'react';

export function ProfileModal({ isOpen, onClose, user, onLogout }) {
    if (!isOpen || !user) return null;

    return (
        <div id="profile-modal" className="modal-overlay" onClick={(e) => { if (e.target.id === 'profile-modal') onClose(); }}>
            <div className="modal-card">
                <div className="modal-header">
                    <h3>User Profile</h3>
                    <button className="btn-close-modal" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body text-center">
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
                        onClick={() => {
                            onClose();
                            if (onLogout) onLogout();
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileModal;

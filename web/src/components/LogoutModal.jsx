import React from 'react';

export function LogoutModal({ isOpen, onCancel, onConfirm }) {
    if (!isOpen) return null;

    return (
        <div id="logout-confirm-modal" className="modal-overlay" onClick={(e) => { if (e.target.id === 'logout-confirm-modal') onCancel(); }}>
            <div className="modal-card" style={{ maxWidth: '380px', borderRadius: '24px', textAlign: 'center', padding: '24px' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#FFEBEE',
                    color: '#E53935',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    boxShadow: '0 4px 14px rgba(229, 57, 53, 0.18)'
                }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1D3557', margin: '0 0 8px 0' }}>
                    Confirm Logout
                </h3>
                
                <p style={{ fontSize: '14px', color: '#6C757D', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                    Are you sure you want to log out? You will need to enter your credentials to access your account again.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        id="btn-cancel-logout"
                        type="button"
                        className="btn btn-secondary"
                        style={{
                            flex: 1,
                            padding: '12px 18px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #E2E8F0',
                            cursor: 'pointer'
                        }}
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        id="btn-confirm-logout"
                        type="button"
                        className="btn"
                        style={{
                            flex: 1,
                            padding: '12px 18px',
                            borderRadius: '12px',
                            fontWeight: '600',
                            backgroundColor: '#E53935',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(229, 57, 53, 0.3)'
                        }}
                        onClick={onConfirm}
                    >
                        Log Out
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogoutModal;

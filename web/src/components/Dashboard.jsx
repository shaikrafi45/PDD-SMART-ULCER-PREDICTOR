import React from 'react';
import appLogo from '../assets/app_logo.png';

export function Dashboard({ onGoToHistory, onLogout, onUploadClick }) {
    return (
        <section id="about-screen" className="screen active">
            <header className="top-bar">
                {/* Spacer to push title to center alignment since back button is gone */}
                <div style={{ width: '80px' }}></div>
                <h1 className="header-title">ABOUT</h1>
                <div className="header-actions">
                    <button className="btn-icon" onClick={onGoToHistory} title="History">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                    </button>
                    <button className="btn-icon" onClick={onLogout} title="Logout">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </header>
            
            <div className="content-scrollable">
                <div style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>
                    <img 
                        src={appLogo} 
                        alt="Smart Ulcer Predictor Logo" 
                        style={{ width: '88px', height: '88px', borderRadius: '18px', objectFit: 'contain', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }} 
                    />
                </div>
                
                <div className="dashboard-section mt-medium">
                    <h3>How It Works</h3>
                    <div className="how-it-works-flow">
                        <div className="flow-step">
                            <span className="flow-icon">📁</span>
                            <span className="flow-text">Upload</span>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <span className="flow-icon">🧠</span>
                            <span className="flow-text">AI Processing</span>
                        </div>
                        <div className="flow-arrow">→</div>
                        <div className="flow-step">
                            <span className="flow-icon">📊</span>
                            <span className="flow-text">Result</span>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-section card-warning mt-medium">
                    <h3>Privacy Note</h3>
                    <p className="text-secondary text-sm">Your image stays secure. No data is shared.</p>
                </div>
                
                <div className="about-description mt-large">
                    <p className="lead">Understanding wound tissue types and their treatment plans is essential for proper healing. Here's a quick guide:</p>
                </div>
                
                <div className="tissue-types-grid mt-medium">
                    <div className="tissue-card" style={{ '--card-accent': '#E53935' }}>
                        <div className="tissue-card-header">
                            <span className="tissue-status red">🔴</span>
                            <h4>1 = Granulation tissue</h4>
                        </div>
                        <p className="tissue-subtitle">Red, healing</p>
                        <p className="tissue-treatment"><strong>Treatment:</strong> Keep moist, protect.</p>
                    </div>
                    
                    <div className="tissue-card" style={{ '--card-accent': '#FFB300' }}>
                        <div className="tissue-card-header">
                            <span className="tissue-status yellow">🟡</span>
                            <h4>2 = Slough</h4>
                        </div>
                        <p className="tissue-subtitle">Yellow, needs cleaning</p>
                        <p className="tissue-treatment"><strong>Treatment:</strong> Requires debridement and infection control.</p>
                    </div>
                    
                    <div className="tissue-card" style={{ '--card-accent': '#212121' }}>
                        <div className="tissue-card-header">
                            <span className="tissue-status black">⚫</span>
                            <h4>3 = Necrotic tissue</h4>
                        </div>
                        <p className="tissue-subtitle">Black, dead</p>
                        <p className="tissue-treatment"><strong>Treatment:</strong> Surgical or enzymatic debridement required.</p>
                    </div>
                    
                    <div className="tissue-card" style={{ '--card-accent': '#EC407A' }}>
                        <div className="tissue-card-header">
                            <span className="tissue-status pink">🌸</span>
                            <h4>4 = Epithelialisation</h4>
                        </div>
                        <p className="tissue-subtitle">Pink, new skin</p>
                        <p className="tissue-treatment"><strong>Treatment:</strong> Protect, avoid trauma. Key healing indicator.</p>
                    </div>
                </div>
                <div className="spacer-bottom"></div>
            </div>
            
            <footer className="bottom-action-bar">
                <button onClick={onUploadClick} className="btn btn-success btn-large btn-full-width">
                    Click here to upload
                </button>
            </footer>
        </section>
    );
}

export default Dashboard;

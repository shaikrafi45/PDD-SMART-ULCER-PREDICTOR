import React, { useState, useEffect } from 'react';
import appLogo from '../assets/app_logo.png';

export function History({ onBack, getHistoryRequest, showToast, userId, apiBaseUrl }) {
    const [historyList, setHistoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId || userId <= 0) {
                showToast("Session invalid. Please log in.");
                setIsLoading(false);
                setHasError(true);
                return;
            }
            
            try {
                setIsLoading(true);
                const res = await getHistoryRequest(userId);
                setIsLoading(false);
                
                if (res.status === 'success') {
                    setHistoryList(res.history || []);
                } else {
                    setHasError(true);
                    showToast("Failed to retrieve history.");
                }
            } catch (e) {
                setIsLoading(false);
                setHasError(true);
                showToast("Error fetching history: " + e.message);
            }
        };

        fetchHistory();
    }, [userId]);

    const formatIsoDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr.replace(' ', 'T'));
            if (isNaN(d.getTime())) return dateStr;
            
            const options = { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
            return d.toLocaleDateString('en-US', options);
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <section id="history-screen" className="screen active">
            <header className="top-bar">
                <button className="btn-back btn-back-dark" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12,19 5,12 12,5"></polyline>
                    </svg>
                    <span>Back</span>
                </button>
                <h1 className="header-title">History</h1>
                <div style={{ width: '80px' }}></div>
            </header>
            
            <div className="content-scrollable">
                <h2 className="text-center mt-medium font-bold text-md">Your Wound History</h2>
                
                {isLoading && (
                    <div id="history-loading-container" className="loading-state mt-large">
                        <span className="spinner"></span>
                        <p className="text-secondary mt-small">Loading scan history...</p>
                    </div>
                )}
                
                {hasError && !isLoading && (
                    <div id="history-error-container" className="error-state mt-large">
                        <p className="text-secondary">Unable to load scan history.</p>
                    </div>
                )}
                
                {!isLoading && !hasError && historyList.length === 0 && (
                    <div id="history-empty-container" className="empty-state mt-large">
                        <p className="text-secondary">No scans logged yet.</p>
                    </div>
                )}
                
                {!isLoading && !hasError && historyList.length > 0 && (
                    <div id="history-list" className="history-list-cards mt-medium">
                        {historyList.map((item) => {
                            let imgSrc = item.image_path || item.image_url;
                            if (imgSrc && typeof imgSrc === 'string') {
                                if (!imgSrc.startsWith('http') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('blob:') && !imgSrc.startsWith('assets/')) {
                                    const cleanBase = apiBaseUrl ? (apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`) : '';
                                    const cleanPath = imgSrc.startsWith('uploads/') 
                                        ? imgSrc 
                                        : (imgSrc.startsWith('/') ? imgSrc.slice(1) : `uploads/${imgSrc}`);
                                    imgSrc = `${cleanBase}${cleanPath}`;
                                }
                            }
                            
                            return (
                                <div key={item.id} className="history-card">
                                    <div className="history-card-row font-bold">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                        <span>Result: {item.result}</span>
                                    </div>
                                    <p className="text-secondary text-sm" style={{ marginLeft: '28px' }}>
                                        Confidence: {parseFloat(item.confidence).toFixed(2)}%
                                    </p>
                                    
                                    <div className="history-card-image">
                                        <img 
                                            src={imgSrc || appLogo} 
                                            alt="Wound log" 
                                            onError={(e) => { e.target.src = appLogo; }}
                                        />
                                    </div>
                                    
                                    <div className="history-card-row text-secondary text-sm">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <span>Date: {formatIsoDate(item.date || item.created_at)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                <div className="spacer-bottom"></div>
            </div>
        </section>
    );
}

export default History;

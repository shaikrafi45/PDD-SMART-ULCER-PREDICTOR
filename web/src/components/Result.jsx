import React from 'react';

export function Result({ onBack, onProfileClick, onPrecautionsClick, onViewHistory, result }) {
    const resultText = result?.label || "Unable to Identify";
    const isUnable = resultText.toLowerCase() === "unable to identify";
    const confidenceText = isUnable ? "Confidence: 0.00%" : `Confidence: ${(result?.confidence || 0).toFixed(2)}%`;
    const imageSrc = result?.imageBase64 || '';

    return (
        <section id="result-screen" className="screen active">
            <header className="top-bar">
                <button className="btn-back btn-back-dark" onClick={onBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12,19 5,12 12,5"></polyline>
                    </svg>
                    <span>Back</span>
                </button>
                <div className="header-actions">
                    <button className="btn-icon" onClick={onProfileClick} title="Profile">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </button>
                </div>
            </header>
            
            <div className="content-scrollable flex-column align-center">
                <h2 className="text-primary mt-medium font-bold text-lg">Wound Analysis Result</h2>
                
                <div className="result-image-card mt-medium">
                    {imageSrc ? (
                        <img id="result-image-display" src={imageSrc} alt="Analyzed Wound" className="result-image" />
                    ) : (
                        <div id="result-image-fallback" className="result-image-fallback">
                            Image preview not available
                        </div>
                    )}
                </div>
                
                <div className="result-data-card mt-medium" style={isUnable ? { backgroundColor: '#616161' } : {}}>
                    <h3 id="result-label" className="result-title">{resultText}</h3>
                    <p id="result-confidence" className="result-percent">{confidenceText}</p>
                </div>

                <div className="warning-row mt-large" style={isUnable ? { borderLeftColor: '#757575', backgroundColor: 'rgba(117, 117, 117, 0.1)' } : {}}>
                    <span className="warning-icon">{isUnable ? "ℹ️" : "⚠️"}</span>
                    <p className="warning-text">
                        {isUnable 
                            ? "No active ulcer wound could be identified in this image. Please upload a clear, focused close-up photo of a foot or leg ulcer wound."
                            : "This assessment is AI-generated. Check 'Precautions & Tips' below for wound care guidelines and consult a medical professional."}
                    </p>
                </div>
                
                <div className="precautions-trigger-container mt-large">
                    <button id="btn-result-precautions" className="btn-precautions-circle" onClick={onPrecautionsClick}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="9" width="18" height="12" rx="2" ry="2"></rect>
                            <line x1="12" y1="5" x2="12" y2="9"></line>
                            <line x1="12" y1="13" x2="12" y2="17"></line>
                            <line x1="10" y1="15" x2="14" y2="15"></line>
                            <path d="M7 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"></path>
                        </svg>
                    </button>
                    <span className="precautions-label mt-small" onClick={onPrecautionsClick}>Precautions & Tips</span>
                </div>
                
                <div className="spacer-bottom"></div>
            </div>
            
            <footer className="bottom-action-bar">
                <button id="btn-result-history" className="btn btn-primary btn-large btn-full-width" onClick={onViewHistory}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                    <span>View History</span>
                </button>
            </footer>
        </section>
    );
}

export default Result;

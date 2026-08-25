import React from 'react';
import appLogo from '../assets/app_logo.png';

export function Disclaimer({ onConfirm }) {
    return (
        <section id="disclaimer-screen" className="screen active">
            <div className="disclaimer-card">
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <img src={appLogo} alt="Smart Ulcer Predictor Logo" style={{ width: '80px', height: '80px', borderRadius: '16px', objectFit: 'contain' }} />
                </div>
                <h2 className="text-danger">Disclaimer</h2>
                <div className="disclaimer-content">
                    <p>This application is designed to provide information and risk assessment related to foot ulcers. It is intended for educational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment.</p>
                    <p>The predictions and recommendations provided by this app are based on general medical knowledge and may not be suitable for your specific condition. Always consult with a qualified healthcare provider for personalized medical advice.</p>
                    <p>In case of medical emergency or if you experience severe symptoms, contact your doctor or emergency services immediately. Do not rely on this app for urgent medical situations.</p>
                </div>
                <button onClick={onConfirm} className="btn btn-primary btn-large">OK</button>
            </div>
        </section>
    );
}

export default Disclaimer;

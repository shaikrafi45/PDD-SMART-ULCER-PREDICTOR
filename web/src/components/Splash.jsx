import React from 'react';
import appLogo from '../assets/app_logo.png';

export function Splash() {
    return (
        <section id="splash-screen" className="screen active">
            <div className="decor-circle top-left"></div>
            <div className="decor-circle bottom-right"></div>
            
            <div className="splash-card">
                <div className="logo-container">
                    <img src={appLogo} alt="Smart Ulcer Predictor Logo" className="app-logo" />
                </div>
                <h2>SMART ULCER<br />PREDICTOR</h2>
            </div>
            
            <div className="splash-slogan">
                Check your feet<br />Stop ulcers early
            </div>
        </section>
    );
}

export default Splash;

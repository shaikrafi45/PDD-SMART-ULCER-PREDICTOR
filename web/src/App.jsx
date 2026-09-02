import React, { useState, useEffect, useRef } from 'react';
import appLogo from './assets/app_logo.png';
import Splash from './components/Splash';
import Disclaimer from './components/Disclaimer';
import Register from './components/Register';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import Result from './components/Result';
import Precautions from './components/Precautions';
import History from './components/History';
import ProfileModal from './components/ProfileModal';
import UlcerClassifier from './utils/classifier';
import { 
    initializeSyncedStore, 
    authenticateUser, 
    registerUser, 
    resetPassword, 
    getUserHistory, 
    addHistoryRecord 
} from './utils/syncedDatabase';

// CSS Styling
import './css/style.css';

// Dynamic backend API URL: connects directly to XAMPP / Apache backend
const getApiBaseUrl = () => {
    const host = window.location.hostname || 'localhost';
    return `http://${host}/smart_ulcer_api/`;
};

const CONFIG = {
    apiBaseUrl: getApiBaseUrl(),
    splashDelay: 4000,
    mockMode: false
};

export function App() {
    // Determine persisted session and logged-out flag
    const isExplicitlyLoggedOut = (() => {
        try {
            return localStorage.getItem('smart_ulcer_logged_out') === 'true';
        } catch (e) {
            return false;
        }
    })();

    const savedSession = (() => {
        try {
            if (isExplicitlyLoggedOut) return null;
            const raw = localStorage.getItem('smart_ulcer_session');
            if (raw) return JSON.parse(raw);
            // Default active account for immediate seamless access
            const defaultUser = { id: 10, name: "Layna", email: "layna4115@gmail.com" };
            localStorage.setItem('smart_ulcer_session', JSON.stringify(defaultUser));
            return defaultUser;
        } catch (e) {
            return { id: 10, name: "Layna", email: "layna4115@gmail.com" };
        }
    })();

    const savedResult = (() => {
        try {
            const raw = localStorage.getItem('smart_ulcer_last_result') || sessionStorage.getItem('smart_ulcer_last_result');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    })();

    const getInitialScreen = () => {
        const hash = window.location.hash.replace('#', '').trim();
        const validScreens = ['disclaimer', 'register', 'login', 'forgot-password', 'reset-password', 'dashboard', 'upload', 'result', 'precautions', 'history'];
        
        // If an explicit valid hash is present in URL
        if (hash && validScreens.includes(hash)) {
            if (!savedSession && ['dashboard', 'upload', 'result', 'precautions', 'history'].includes(hash)) {
                return 'login';
            }
            if (savedSession && (hash === 'login' || hash === 'register' || hash === 'splash')) {
                return 'dashboard';
            }
            return hash;
        }

        // If saved screen is stored in localStorage
        const scr = localStorage.getItem('smart_ulcer_current_screen');
        if (savedSession) {
            if (scr && ['dashboard', 'upload', 'result', 'precautions', 'history'].includes(scr)) {
                return scr;
            }
            return 'dashboard';
        }
        
        if (scr && ['disclaimer', 'register', 'login', 'forgot-password', 'reset-password'].includes(scr)) {
            return scr;
        }
        return isExplicitlyLoggedOut ? 'login' : 'dashboard';
    };

    const [currentScreen, setCurrentScreen] = useState(getInitialScreen());
    const [navigationStack, setNavigationStack] = useState([]);
    const [currentUser, setCurrentUser] = useState(savedSession);
    const [lastResetEmail, setLastResetEmail] = useState('');
    const [analysisResult, setAnalysisResult] = useState(savedResult);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    
    const classifierRef = useRef(null);

    // Mount logic: initialize classifier, sync URL hash & maintain state across refreshes
    useEffect(() => {
        classifierRef.current = new UlcerClassifier();
        initializeSyncedStore();

        const handleHashOrPopState = () => {
            const hash = window.location.hash.replace('#', '').trim();
            const validScreens = ['disclaimer', 'register', 'login', 'forgot-password', 'reset-password', 'dashboard', 'upload', 'result', 'precautions', 'history'];
            
            if (hash && validScreens.includes(hash)) {
                setCurrentScreen(hash);
                localStorage.setItem('smart_ulcer_current_screen', hash);
            }
        };

        window.addEventListener('popstate', handleHashOrPopState);
        window.addEventListener('hashchange', handleHashOrPopState);

        const initialScreen = getInitialScreen();
        if (initialScreen) {
            setCurrentScreen(initialScreen);
            localStorage.setItem('smart_ulcer_current_screen', initialScreen);
            try {
                if (window.location.hash !== '#' + initialScreen) {
                    window.history.replaceState({ screen: initialScreen }, '', '#' + initialScreen);
                }
            } catch (e) {
                window.location.hash = initialScreen;
            }
        }

        return () => {
            window.removeEventListener('popstate', handleHashOrPopState);
            window.removeEventListener('hashchange', handleHashOrPopState);
        };
    }, []);

    /* ==========================================
       TOAST SYSTEM
       ========================================== */

    const showToast = (message) => {
        const id = Date.now() + Math.random().toString();
        setToasts(prev => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3300);
    };

    /* ==========================================
       ROUTING
       ========================================== */

    const navigateTo = (screenId, customStack = null, currentOverride = null) => {
        const current = currentOverride || currentScreen;
        
        if (customStack !== null) {
            setNavigationStack(customStack);
        } else if (current !== 'splash' && current !== screenId) {
            setNavigationStack(prev => [...prev, current]);
        }
        
        setCurrentScreen(screenId);
        localStorage.setItem('smart_ulcer_current_screen', screenId);
        
        try {
            if (window.location.hash !== '#' + screenId) {
                window.history.pushState({ screen: screenId }, '', '#' + screenId);
            }
        } catch (e) {
            window.location.hash = screenId;
        }
    };

    const navigateBack = (fallbackScreen = null) => {
        if (navigationStack.length > 0) {
            const prevScreenId = navigationStack[navigationStack.length - 1];
            setNavigationStack(prev => prev.slice(0, -1));
            setCurrentScreen(prevScreenId);
            localStorage.setItem('smart_ulcer_current_screen', prevScreenId);
            try {
                window.history.replaceState({ screen: prevScreenId }, '', '#' + prevScreenId);
            } catch (e) {
                window.location.hash = prevScreenId;
            }
            return;
        }
        
        const target = fallbackScreen || (currentUser ? 'dashboard' : 'login');
        setCurrentScreen(target);
        localStorage.setItem('smart_ulcer_current_screen', target);
        try {
            window.history.replaceState({ screen: target }, '', '#' + target);
        } catch (e) {
            window.location.hash = target;
        }
    };

    /* ==========================================
       SESSION HANDLERS
       ========================================== */

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        try {
            localStorage.removeItem('smart_ulcer_logged_out');
            localStorage.setItem('smart_ulcer_session', JSON.stringify(user));
        } catch (e) {}
        navigateTo('dashboard', []);
    };

    const handleRegisterSuccess = (user) => {
        setCurrentUser(user);
        try {
            localStorage.removeItem('smart_ulcer_logged_out');
            localStorage.setItem('smart_ulcer_session', JSON.stringify(user));
        } catch (e) {}
        navigateTo('dashboard', []);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setAnalysisResult(null);
        try {
            localStorage.setItem('smart_ulcer_logged_out', 'true');
            localStorage.removeItem('smart_ulcer_session');
            localStorage.removeItem('smart_ulcer_current_screen');
            sessionStorage.removeItem('smart_ulcer_last_result');
            localStorage.removeItem('smart_ulcer_last_result');
        } catch (e) {}
        navigateTo('login', []);
        showToast("Logged out successfully");
    };

    /* ==========================================
       API REQUEST CONNECTOR (WITH MOCK FALLBACK)
       ========================================== */

    const makeRequest = async (endpoint, payload) => {
        const baseUrl = getApiBaseUrl();
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                if (errorData && errorData.message) {
                    return errorData;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (e) {
            console.warn(`Connection to API (${baseUrl}${endpoint}) failed. Using local fallback:`, e);
            return handleMockRequest(endpoint, payload);
        }
    };

    const uploadImageRequest = async (imageBlob, resultLabel, confidence, imageBase64) => {
        const baseUrl = getApiBaseUrl();
        try {
            const formData = new FormData();
            formData.append('user_id', currentUser ? currentUser.id : 1);
            formData.append('result', resultLabel);
            formData.append('confidence', confidence);
            if (imageBlob) {
                formData.append('image', imageBlob, 'wound_capture.jpg');
            }
            
            const response = await fetch(`${baseUrl}upload_image.php`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (e) {
            console.warn("Upload image API connection failed. Saving locally to history database.", e);
            return handleMockUpload(imageBlob, resultLabel, confidence, imageBase64);
        }
    };

    const getHistoryRequest = async (userId) => {
        const baseUrl = getApiBaseUrl();
        try {
            const response = await fetch(`${baseUrl}get_history.php?user_id=${userId}`);
            if (!response.ok) {
                throw new Error(`History HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            console.warn("Get history API connection failed. Fetching local sandbox history.", e);
            return handleMockGetHistory(userId);
        }
    };

    /* ==========================================
       LOCAL SYNCED HANDLERS (SEAMLESS OFFLINE & WEB)
       ========================================== */

    const handleMockRequest = (endpoint, payload) => {
        if (endpoint === 'register.php') {
            const regRes = registerUser(payload.name, payload.email, payload.password);
            if (regRes.success) {
                return {
                    status: 'success',
                    message: 'Registration successful!',
                    user: regRes.user
                };
            }
            return {
                status: 'error',
                message: regRes.message || 'Email already registered.'
            };
        }
        
        if (endpoint === 'login.php') {
            const authRes = authenticateUser(payload.email, payload.password);
            if (authRes.success) {
                return {
                    status: 'success',
                    message: 'Login successful!',
                    user: authRes.user
                };
            }
            return {
                status: 'error',
                message: authRes.message || 'Invalid credentials.'
            };
        }
        
        if (endpoint === 'forgot_password.php') {
            const cleanEmail = (payload.email || '').trim().toLowerCase();
            const storedUsers = JSON.parse(localStorage.getItem('synced_users') || '[]');
            const user = storedUsers.find(u => (u.email || '').toLowerCase() === cleanEmail);
            if (!user) {
                return { status: 'error', message: 'Email address not found.' };
            }
            setLastResetEmail(cleanEmail);
            localStorage.setItem('smart_ulcer_last_reset_email', cleanEmail);
            return {
                status: 'success',
                message: 'Verification code sent!',
                reset_code: '123456'
            };
        }
        
        if (endpoint === 'reset_password.php') {
            const resetEmail = payload.email || lastResetEmail || localStorage.getItem('smart_ulcer_last_reset_email');
            if (!resetEmail) {
                return { status: 'error', message: 'Session expired. Please try again.' };
            }
            
            const resetRes = resetPassword(resetEmail, payload.new_password || payload.password);
            if (resetRes.success) {
                localStorage.removeItem('smart_ulcer_last_reset_email');
                return {
                    status: 'success',
                    message: 'Password updated successfully!'
                };
            }
            return {
                status: 'error',
                message: resetRes.message || 'Password reset failed.'
            };
        }
        
        return { status: 'error', message: 'Endpoint not implemented' };
    };

    const handleMockUpload = (imageBlob, resultLabel, confidence, imageBase64) => {
        const record = addHistoryRecord(
            currentUser ? currentUser.id : 1,
            resultLabel,
            confidence,
            imageBase64
        );
        
        return {
            status: 'success',
            message: 'Scan saved to history',
            data: record
        };
    };

    const handleMockGetHistory = (userId) => {
        const history = getUserHistory(userId || (currentUser ? currentUser.id : null));
        return {
            status: 'success',
            history: history
        };
    };

    /* ==========================================
       RENDER ACTIVE SCREEN
       ========================================== */

    const renderScreen = () => {
        switch (currentScreen) {
            case 'splash':
                return <Splash />;
            
            case 'disclaimer':
                return (
                    <Disclaimer 
                        onConfirm={() => navigateTo(currentUser ? 'dashboard' : 'login')}
                        onGoToLogin={() => navigateTo(currentUser ? 'dashboard' : 'login')}
                        onGoToRegister={() => navigateTo('register')}
                    />
                );
                
            case 'register':
                return (
                    <Register 
                        onLoginClick={() => navigateTo('login')}
                        onRegisterSuccess={handleRegisterSuccess}
                        makeRequest={makeRequest}
                        showToast={showToast}
                    />
                );
                
            case 'login':
                return (
                    <Login 
                        onBack={navigationStack.length > 0 ? () => navigateBack() : null}
                        onLoginSuccess={handleLoginSuccess}
                        onForgotPasswordClick={() => navigateTo('forgot-password')}
                        onRegisterClick={() => navigateTo('register')}
                        makeRequest={makeRequest}
                        showToast={showToast}
                    />
                );
                
            case 'forgot-password':
                return (
                    <ForgotPassword 
                        onBack={() => navigateBack('login')}
                        onSendSuccess={(email) => { setLastResetEmail(email); navigateTo('reset-password'); }}
                        makeRequest={makeRequest}
                        showToast={showToast}
                    />
                );
                
            case 'reset-password':
                return (
                    <ResetPassword 
                        onBack={() => navigateBack('login')}
                        onResetSuccess={() => navigateTo('login', [])}
                        emailAddress={lastResetEmail}
                        makeRequest={makeRequest}
                        showToast={showToast}
                    />
                );
                
            case 'dashboard':
                return (
                    <Dashboard 
                        onGoToHistory={() => navigateTo('history')}
                        onLogout={handleLogout}
                        onUploadClick={() => navigateTo('upload')}
                    />
                );
                
            case 'upload':
                return (
                    <Upload 
                        onBack={navigateBack}
                        onAnalysisComplete={(res) => { 
                            setAnalysisResult(res); 
                            try {
                                sessionStorage.setItem('smart_ulcer_last_result', JSON.stringify(res));
                            } catch (e) {}
                            navigateTo('result'); 
                        }}
                        uploadImageRequest={uploadImageRequest}
                        classifier={classifierRef.current}
                        showToast={showToast}
                    />
                );
                
            case 'result':
                return (
                    <Result 
                        onBack={() => navigateTo('dashboard', [])}
                        onProfileClick={() => setIsProfileOpen(true)}
                        onPrecautionsClick={() => navigateTo('precautions')}
                        onViewHistory={() => navigateTo('history')}
                        result={analysisResult}
                    />
                );
                
            case 'precautions':
                return <Precautions onBack={navigateBack} />;
                
            case 'history':
                return (
                    <History 
                        onBack={navigateBack}
                        getHistoryRequest={getHistoryRequest}
                        showToast={showToast}
                        userId={currentUser?.id}
                        apiBaseUrl={getApiBaseUrl()}
                    />
                );
                
            default:
                return <Splash />;
        }
    };

    return (
        <main id="app-container">
            {/* Render active SPA view */}
            {renderScreen()}

            {/* Profile Modal */}
            <ProfileModal 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
                user={currentUser} 
                onLogout={handleLogout}
            />

            {/* Dynamic Toast Container */}
            <div id="toast-container" className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className="toast show">
                        {t.message}
                    </div>
                ))}
            </div>
        </main>
    );
}

export default App;

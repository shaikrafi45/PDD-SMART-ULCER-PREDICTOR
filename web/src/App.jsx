import React, { useState, useEffect, useRef } from 'react';
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

// CSS Styling
import './css/style.css';

// Config
const CONFIG = {
    apiBaseUrl: window.location.origin.includes('localhost') 
        ? 'http://localhost/smart_ulcer_api/' 
        : 'https://8a32813407e2a0.lhr.life/smart_ulcer_api/',
    splashDelay: 4000,
    mockMode: false
};

export function App() {
    const [currentScreen, setCurrentScreen] = useState('splash');
    const [navigationStack, setNavigationStack] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [lastResetEmail, setLastResetEmail] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    
    const classifierRef = useRef(null);
    const mockModeRef = useRef(CONFIG.mockMode);

    // Mount logic: initialize classifier & session
    useEffect(() => {
        classifierRef.current = new UlcerClassifier();
        
        // Session
        const session = localStorage.getItem('smart_ulcer_session');
        let initialUser = null;
        if (session) {
            try {
                initialUser = JSON.parse(session);
                setCurrentUser(initialUser);
                console.log("React Session loaded:", initialUser);
            } catch (e) {
                localStorage.removeItem('smart_ulcer_session');
            }
        }

        // Seed mock DB
        if (!localStorage.getItem('mock_users')) {
            localStorage.setItem('mock_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('mock_history')) {
            localStorage.setItem('mock_history', JSON.stringify([]));
        }

        // Splash screen auto transition
        setTimeout(() => {
            if (session && initialUser) {
                navigateTo('dashboard', [], 'splash');
            } else {
                navigateTo('disclaimer', [], 'splash');
            }
        }, CONFIG.splashDelay);
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
        } else if (current !== 'splash') {
            setNavigationStack(prev => [...prev, current]);
        }
        
        setCurrentScreen(screenId);
    };

    const navigateBack = (fallbackScreen = null) => {
        if (navigationStack.length === 0) {
            if (fallbackScreen) {
                setCurrentScreen(fallbackScreen);
            }
            return;
        }
        
        const prevScreenId = navigationStack[navigationStack.length - 1];
        setNavigationStack(prev => prev.slice(0, -1));
        setCurrentScreen(prevScreenId);
    };

    /* ==========================================
       SESSION HANDLERS
       ========================================== */

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        localStorage.setItem('smart_ulcer_session', JSON.stringify(user));
        navigateTo('dashboard', []);
    };

    const handleRegisterSuccess = (user) => {
        setCurrentUser(user);
        localStorage.setItem('smart_ulcer_session', JSON.stringify(user));
        navigateTo('dashboard', []);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('smart_ulcer_session');
        navigateTo('login', []);
        showToast("Logged out successfully");
    };

    /* ==========================================
       API REQUEST CONNECTOR (WITH MOCK FALLBACK)
       ========================================== */

    const makeRequest = async (endpoint, payload) => {
        if (mockModeRef.current) {
            return handleMockRequest(endpoint, payload);
        }
        
        try {
            const response = await fetch(`${CONFIG.apiBaseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (e) {
            console.warn(`Connection to API failed (${endpoint}). Activating offline mock fallback database.`, e);
            mockModeRef.current = true;
            showToast("Offline mode: Connecting to local sandbox");
            return handleMockRequest(endpoint, payload);
        }
    };

    const uploadImageRequest = async (imageBlob, resultLabel, confidence) => {
        if (mockModeRef.current) {
            return handleMockUpload(imageBlob, resultLabel, confidence);
        }
        
        try {
            const formData = new FormData();
            formData.append('user_id', currentUser.id);
            formData.append('result', resultLabel);
            formData.append('confidence', confidence);
            formData.append('image', imageBlob, 'wound_capture.jpg');
            
            const response = await fetch(`${CONFIG.apiBaseUrl}upload_image.php`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (e) {
            console.warn("Upload image API connection failed. Saving locally to history database.", e);
            return handleMockUpload(imageBlob, resultLabel, confidence);
        }
    };

    const getHistoryRequest = async (userId) => {
        if (mockModeRef.current) {
            return handleMockGetHistory(userId);
        }
        
        try {
            const response = await fetch(`${CONFIG.apiBaseUrl}get_history.php?user_id=${userId}`);
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
       LOCAL MOCK HANDLERS
       ========================================== */

    const handleMockRequest = (endpoint, payload) => {
        const users = JSON.parse(localStorage.getItem('mock_users')) || [];
        
        if (endpoint === 'register.php') {
            const existing = users.find(u => u.email === payload.email);
            if (existing) {
                return { status: 'error', message: 'Email already registered.' };
            }
            
            const newUser = {
                id: users.length + 1,
                name: payload.name,
                email: payload.email,
                password: payload.password
            };
            users.push(newUser);
            localStorage.setItem('mock_users', JSON.stringify(users));
            
            return {
                status: 'success',
                message: 'Registration successful!',
                user: { id: newUser.id, name: newUser.name, email: newUser.email }
            };
        }
        
        if (endpoint === 'login.php') {
            const user = users.find(u => u.email === payload.email && u.password === payload.password);
            if (!user) {
                return { status: 'error', message: 'Invalid credentials.' };
            }
            return {
                status: 'success',
                message: 'Login successful!',
                user: { id: user.id, name: user.name, email: user.email }
            };
        }
        
        if (endpoint === 'forgot_password.php') {
            const user = users.find(u => u.email === payload.email);
            if (!user) {
                return { status: 'error', message: 'Email address not found.' };
            }
            localStorage.setItem('mock_last_reset_email', payload.email);
            return {
                status: 'success',
                message: 'Verification code sent!',
                reset_code: '123456'
            };
        }
        
        if (endpoint === 'reset_password.php') {
            const resetEmail = localStorage.getItem('mock_last_reset_email');
            if (!resetEmail) {
                return { status: 'error', message: 'Session expired.' };
            }
            
            if (payload.reset_code !== '123456') {
                return { status: 'error', message: 'Invalid verification code.' };
            }
            
            const userIdx = users.findIndex(u => u.email === resetEmail);
            if (userIdx === -1) {
                return { status: 'error', message: 'User not found.' };
            }
            
            users[userIdx].password = payload.new_password;
            localStorage.setItem('mock_users', JSON.stringify(users));
            localStorage.removeItem('mock_last_reset_email');
            
            return {
                status: 'success',
                message: 'Password updated successfully!'
            };
        }
        
        return { status: 'error', message: 'Endpoint not implemented' };
    };

    const handleMockUpload = (imageBlob, resultLabel, confidence) => {
        const history = JSON.parse(localStorage.getItem('mock_history')) || [];
        
        const historyItem = {
            id: (history.length + 1).toString(),
            result: resultLabel,
            confidence: parseFloat(confidence),
            image_path: analysisResult?.imageBase64 || "/assets/app_logo.png",
            date: new Date().toISOString(),
            user_id: currentUser.id
        };
        
        history.push(historyItem);
        localStorage.setItem('mock_history', JSON.stringify(history));
        
        return {
            status: 'success',
            message: 'Scan saved locally',
            data: historyItem
        };
    };

    const handleMockGetHistory = (userId) => {
        const history = JSON.parse(localStorage.getItem('mock_history')) || [];
        const userHistory = history.filter(item => item.user_id === userId);
        userHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        return {
            status: 'success',
            history: userHistory
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
                return <Disclaimer onConfirm={() => navigateTo(currentUser ? 'dashboard' : 'register')} />;
                
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
                        onBack={() => navigateBack('register')}
                        onLoginSuccess={handleLoginSuccess}
                        onForgotPasswordClick={() => navigateTo('forgot-password')}
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
                        onAnalysisComplete={(res) => { setAnalysisResult(res); navigateTo('result'); }}
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
                        apiBaseUrl={CONFIG.apiBaseUrl}
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

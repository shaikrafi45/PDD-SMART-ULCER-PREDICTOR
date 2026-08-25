import React, { useState, useRef, useEffect } from 'react';

export function Upload({ onBack, onAnalysisComplete, uploadImageRequest, classifier, showToast }) {
    const [isLoading, setIsLoading] = useState(false);
    const [statusText, setStatusText] = useState('Uploading & Analyzing...');
    const [previewSrc, setPreviewSrc] = useState('');
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const selectedBlobRef = useRef(null);
    const base64DataRef = useRef('');

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            stopCameraStream();
        };
    }, []);

    const stopCameraStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
    };

    const handleFileSelect = (file) => {
        if (!file.type.startsWith('image/')) {
            showToast("Invalid file type. Please upload an image.");
            return;
        }
        
        selectedBlobRef.current = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const rawDataUrl = e.target.result;
            const img = new Image();
            img.onload = () => {
                const maxDim = 1000;
                let w = img.naturalWidth || img.width;
                let h = img.naturalHeight || img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                base64DataRef.current = optimizedDataUrl;
                setPreviewSrc(optimizedDataUrl);
                analyzeImage(optimizedDataUrl);
            };
            img.src = rawDataUrl;
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        stopCameraStream();
        if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const startCamera = async () => {
        setPreviewSrc('');
        setIsCameraActive(true);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }, // Rear camera preferred
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (e) {
            console.error("Camera access failed:", e);
            showToast("Could not open camera. Please upload file.");
            setIsCameraActive(false);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video) return;

        const maxDim = 1000;
        let w = video.videoWidth;
        let h = video.videoHeight;
        if (w > maxDim || h > maxDim) {
            if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
            } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
            }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);
        
        stopCameraStream();

        canvas.toBlob((blob) => {
            selectedBlobRef.current = blob;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            base64DataRef.current = dataUrl;
            setPreviewSrc(dataUrl);
            analyzeImage(dataUrl);
        }, 'image/jpeg', 0.85);
    };

    const analyzeImage = async (base64Data) => {
        setIsLoading(true);
        setStatusText("Initializing Classifier...");
        
        try {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                setStatusText("Analyzing Wound Pixels...");
                await new Promise(r => setTimeout(r, 400));
                
                // Initialize model
                await classifier.init();
                
                setStatusText("Evaluating Tissue Profiles...");
                const results = await classifier.classify(canvas);
                
                if (results && results.length > 0) {
                    const topResult = results[0];
                    const confidenceVal = topResult.score * 100;
                    
                    setStatusText("Logging prediction history...");
                    
                    // Upload to backend/mock
                    await uploadImageRequest(
                        selectedBlobRef.current, 
                        topResult.label, 
                        confidenceVal.toFixed(2),
                        base64Data
                    );
                    
                    setIsLoading(false);
                    onAnalysisComplete({
                        label: topResult.label,
                        confidence: confidenceVal,
                        imageBase64: base64Data
                    });
                } else {
                    throw new Error("Empty classification result.");
                }
            };
            img.src = base64Data;
        } catch (e) {
            console.error("Analysis failed:", e);
            setIsLoading(false);
            showToast("Analysis Error: " + e.message);
        }
    };

    const triggerFileExplorer = (e) => {
        // Prevent click if camera or preview is active
        if (isCameraActive || previewSrc || e.target.classList.contains('btn-close-preview')) {
            return;
        }
        fileInputRef.current.click();
    };

    return (
        <section id="upload-screen" className="screen active">
            <header className="top-bar">
                <button className="btn-back btn-back-dark" onClick={() => { stopCameraStream(); onBack(); }} disabled={isLoading}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12,19 5,12 12,5"></polyline>
                    </svg>
                    <span>Back</span>
                </button>
                <h1 className="header-title">Upload Image</h1>
                <div style={{ width: '80px' }}></div>
            </header>
            
            <div className="content-scrollable flex-column align-center justify-between">
                <div className="upload-top-container mt-medium text-center">
                    <h2>Upload Wound Image</h2>
                </div>
                
                <div className="alignment-box-container mt-large">
                    <div 
                        id="drop-zone" 
                        className={`alignment-box ${isDragOver ? 'dragover' : ''}`}
                        onClick={triggerFileExplorer}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {previewSrc && (
                            <div id="upload-preview-container" className="preview-container">
                                <img id="image-upload-preview" className="image-preview" src={previewSrc} alt="Wound preview" />
                                <button 
                                    id="btn-remove-preview" 
                                    className="btn-close-preview"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPreviewSrc('');
                                        selectedBlobRef.current = null;
                                        base64DataRef.current = '';
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                        
                        {isCameraActive && (
                            <div id="camera-container" className="camera-stream-container">
                                <video ref={videoRef} autoPlay playsInline className="video-stream"></video>
                                <div className="camera-overlay"></div>
                            </div>
                        )}
                        
                        {!previewSrc && !isCameraActive && (
                            <div id="upload-placeholder" className="upload-placeholder-content">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <p>Align wound inside this box</p>
                                <span className="drag-hint">or click/drag to select</span>
                            </div>
                        )}
                        
                        {isLoading && (
                            <div id="analysis-spinner-overlay" className="loading-overlay">
                                <div className="progress-container">
                                    <span className="spinner large"></span>
                                    <p id="spinner-status-text">{statusText}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <p className="reminder-text mt-medium text-center">
                    Reminder: Keep good lighting, place your wound inside the box and take photo.
                </p>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                        if (e.target.files.length > 0) {
                            handleFileSelect(e.target.files[0]);
                        }
                    }}
                />
                
                <div className="upload-buttons-container mt-large">
                    <button 
                        id="btn-camera-trigger" 
                        className="btn btn-success btn-large btn-full-width"
                        style={{ backgroundColor: isCameraActive ? '#E53935' : '' }}
                        onClick={isCameraActive ? capturePhoto : startCamera}
                        disabled={isLoading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                            <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span id="btn-camera-text">{isCameraActive ? "Capture Photo" : "Take Photo"}</span>
                    </button>
                    
                    <button 
                        id="btn-gallery-trigger" 
                        className="btn btn-primary btn-large btn-full-width mt-small"
                        onClick={() => { stopCameraStream(); fileInputRef.current.click(); }}
                        disabled={isLoading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>Upload Image</span>
                    </button>
                </div>
                
                <div className="spacer-bottom"></div>
            </div>
        </section>
    );
}

export default Upload;

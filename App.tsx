import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from './types';
import { CameraIcon, ThumbsUpIcon, ThumbsDownIcon, SparklesIcon } from './components/IconComponents';

type AppState = 'initial' | 'camera' | 'loading' | 'result' | 'error';

// --- Main App Component ---
export default function App() {
    const [appState, setAppState] = useState<AppState>('initial');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const handleStartCamera = async () => {
        stopCamera();
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setStream(mediaStream);
            setAppState('camera');
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Oops! We need camera access to see your meal. Please enable it in your browser settings.");
            setAppState('error');
        }
    };

    useEffect(() => {
        if (appState === 'camera' && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        // Cleanup function to stop camera when component unmounts or state changes
        return () => {
            if (appState !== 'camera') {
                stopCamera();
            }
        };
    }, [appState, stream, stopCamera]);


    const handleCapture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageDataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(imageDataUrl);
                stopCamera();
                setAppState('loading');
                analyzeImage(imageDataUrl);
            }
        }
    };
    
    const analyzeImage = async (imageDataUrl: string) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = imageDataUrl.split(',')[1];

            const imagePart = {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                },
            };

            const textPart = {
                text: `You are a friendly and encouraging nutritionist for children. Analyze the meal in this photo.
1. Identify the food items.
2. List foods that are 'Growth Boosters'. For each, explain in simple, fun terms why it's good (e.g., 'Milk builds strong bones!') and suggest a daily serving size for a growing child.
3. List foods that are 'Growth Slowers'. For each, explain gently why it should be eaten in moderation and suggest a healthier, yummy alternative (e.g., for 'Candy', suggest 'Try sweet strawberries instead!').
Keep the tone positive. Format as a JSON object with 'growthBoosters' and 'growthSlowers' keys. Each should be an array of objects with 'foodName', 'reason', 'recommendation' for boosters, and 'alternative' for slowers.`
            };
            
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    growthBoosters: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                foodName: { type: Type.STRING },
                                reason: { type: Type.STRING },
                                recommendation: { type: Type.STRING }
                            },
                             required: ["foodName", "reason", "recommendation"]
                        }
                    },
                    growthSlowers: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                foodName: { type: Type.STRING },
                                reason: { type: Type.STRING },
                                alternative: { type: Type.STRING }
                            },
                            required: ["foodName", "reason", "alternative"]
                        }
                    }
                },
                required: ["growthBoosters", "growthSlowers"]
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });

            const resultJson = JSON.parse(response.text);
            setAnalysis(resultJson);
            setAppState('result');

        } catch (e) {
            console.error(e);
            setError("I had a little trouble analyzing that. Maybe try a different photo?");
            setAppState('error');
        }
    };

    const handleReset = () => {
        stopCamera();
        setAppState('initial');
        setCapturedImage(null);
        setAnalysis(null);
        setError(null);
    };

    const renderContent = () => {
        switch (appState) {
            case 'initial':
                return (
                    <div className="text-center">
                        <SparklesIcon className="w-24 h-24 text-pink-400 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Grow Taller with AI!</h1>
                        <p className="text-gray-600 mb-8">Let's see what's in your meal!</p>
                        <button onClick={handleStartCamera} className="bg-pink-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center mx-auto">
                            <CameraIcon className="w-6 h-6 mr-3" />
                            Analyze My Meal
                        </button>
                    </div>
                );
            case 'camera':
                return (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-2xl"></video>
                        <button onClick={handleCapture} className="absolute bottom-8 w-20 h-20 bg-white rounded-full border-4 border-pink-500 shadow-xl focus:outline-none flex items-center justify-center">
                             <div className="w-16 h-16 bg-pink-500 rounded-full"></div>
                        </button>
                        <button onClick={handleReset} className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full">
                            Back
                        </button>
                    </div>
                );
            case 'loading':
                return (
                    <div className="text-center">
                         <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-pink-500 mx-auto"></div>
                         <h2 className="text-2xl font-semibold text-gray-700 mt-8">Analyzing your yummy meal...</h2>
                    </div>
                );
            case 'result':
                return (
                    <div className="w-full space-y-6 animate-fade-in">
                        <img src={capturedImage!} alt="Captured meal" className="rounded-2xl shadow-lg w-full max-w-md mx-auto" />
                        
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg">
                            <h3 className="font-bold text-xl flex items-center"><ThumbsUpIcon className="w-6 h-6 mr-2 text-green-500" /> Growth Boosters</h3>
                            <ul className="mt-2 list-disc list-inside space-y-2">
                               {analysis?.growthBoosters.map(item => (
                                   <li key={item.foodName}><strong>{item.foodName}:</strong> {item.reason} <em>{item.recommendation}</em></li>
                               ))}
                            </ul>
                        </div>
                        
                        {analysis?.growthSlowers && analysis.growthSlowers.length > 0 && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg">
                                <h3 className="font-bold text-xl flex items-center"><ThumbsDownIcon className="w-6 h-6 mr-2 text-red-500" /> Growth Slowers</h3>
                                <p className="text-sm mb-2">Remember, it's okay to have these sometimes!</p>
                                <ul className="mt-2 list-disc list-inside space-y-3">
                                {analysis.growthSlowers.map(item => (
                                    <li key={item.foodName}>
                                        <strong>{item.foodName}:</strong> {item.reason}
                                        {item.alternative && (
                                            <p className="text-sm text-red-700 font-semibold mt-1 p-2 bg-red-50 rounded-md">
                                                👉 Try this instead: <span className="font-normal">{item.alternative}</span>
                                            </p>
                                        )}
                                    </li>
                                ))}
                                </ul>
                            </div>
                        )}
                        
                        <button onClick={handleReset} className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                            Analyze Another Meal
                        </button>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center bg-red-100 p-8 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold text-red-700">Uh Oh!</h2>
                        <p className="text-red-600 mt-2 mb-6">{error}</p>
                        <button onClick={handleReset} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg">
                            Try Again
                        </button>
                    </div>
                 );
        }
    };
    
    return (
        <div className="min-h-screen bg-pink-50 text-gray-800 font-sans flex items-center justify-center p-4">
             <main className="w-full max-w-lg mx-auto bg-white/70 backdrop-blur-sm p-6 rounded-3xl shadow-2xl">
                {renderContent()}
             </main>
             <canvas ref={canvasRef} className="hidden"></canvas>
             {/* FIX: Use dangerouslySetInnerHTML to prevent JSX parser from treating CSS as code. */}
             <style dangerouslySetInnerHTML={{__html: `
                @keyframes fade-in {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-in-out forwards;
                }
             `}} />
        </div>
    );
}

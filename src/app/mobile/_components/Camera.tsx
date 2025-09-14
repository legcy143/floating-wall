'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HiCamera, HiArrowPath, HiArrowRight } from 'react-icons/hi2';

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError('Camera access denied or not available');
      console.error('Camera error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  const retryCapture = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const handleNext = useCallback(() => {
    if (capturedImage) {
      // Here you can do whatever you want with the captured image
      console.log('Image captured and ready to proceed:', capturedImage);
      // For now, we'll just keep it in the component state
      // In a real app, you might want to send it to a parent component or API
    }
  }, [capturedImage]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // If image is captured, show preview with retry/next buttons
  if (capturedImage) {
    return (
      <div className="w-full space-y-4">
        <div className="relative">
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={retryCapture}
            className="flex items-center gap-2"
          >
            <HiArrowPath className="w-4 h-4" />
            Retry
          </Button>
          
          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            Next
            <HiArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Camera interface
  return (
    <div className="w-full space-y-4">
      {/* Camera viewport */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center space-y-2">
              <HiCamera className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-sm text-gray-500">
                {error ? error : 'Camera not active'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        {!isStreaming && !error ? (
          <Button
            onClick={startCamera}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <HiCamera className="w-4 h-4" />
                Start Camera
              </>
            )}
          </Button>
        ) : isStreaming ? (
          <Button
            onClick={capturePhoto}
            size="lg"
            className="rounded-full w-16 h-16 p-0"
          >
            <div className="w-8 h-8 bg-white rounded-full" />
          </Button>
        ) : error ? (
          <Button
            onClick={startCamera}
            variant="outline"
            className="flex items-center gap-2"
          >
            <HiArrowPath className="w-4 h-4" />
            Try Again
          </Button>
        ) : null}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
}

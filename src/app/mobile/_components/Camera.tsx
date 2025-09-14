import React, { useEffect, useRef, useState } from 'react';
import { LuCamera, LuCheck, LuUpload } from 'react-icons/lu';
import { MdOutlineKeyboardArrowLeft, MdOutlineRefresh } from 'react-icons/md';


import { Button } from '@/components/ui/button';
import { uploadSingleFile } from '@/utils/upload';

interface CameraInterface{
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function Camera({image , setImage}:CameraInterface) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerValue, setTimerValue] = useState(3);
  const [countdown, setCountdown] = useState(0);
  const [cameraError, setCameraError] = useState<{
    label: string;
    body: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedBlob, setUploadedBlob] = useState<Blob | null>(null);
  const [cameraPermission, setCameraPermission] = useState<
    'granted' | 'denied' | 'checking'
  >('checking');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [capturedDimensions, setCapturedDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const timerOptions = [
    { value: 0, label: 'Instant', icon: '0' },
    { value: 3, label: '3 seconds', icon: '3' },
    { value: 5, label: '5 seconds', icon: '5' },
    { value: 10, label: '10 seconds', icon: '10' },
  ];

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;

      const handleLoadedMetadata = () => {
        if (videoRef.current) {
          setVideoDimensions({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight,
          });
        }
      };

      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

      videoRef.current.load();
      videoRef.current.play().catch(console.error);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener(
            'loadedmetadata',
            handleLoadedMetadata,
          );
        }
      };
    }
  }, [stream, facingMode]);

  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);
    setCameraPermission('checking');

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 320 },
          facingMode: facingMode,
          aspectRatio: { ideal: 1 / 1 },
        },
      });

      setStream(mediaStream);
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraPermission('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    setCapturedDimensions({
      width: displayWidth,
      height: displayHeight,
    });

    if (context) {
      if (isMirrored) {
        context.save();
        context.scale(-1, 1);
        context.drawImage(
          video,
          0,
          0,
          displayWidth,
          displayHeight,
          -displayWidth,
          0,
          displayWidth,
          displayHeight,
        );
        context.restore();
      } else {
        context.drawImage(
          video,
          0,
          0,
          displayWidth,
          displayHeight,
          0,
          0,
          displayWidth,
          displayHeight,
        );
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCapturedBlob(blob);
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
          }
        },
        'image/jpeg',
        0.8,
      );
    }
  };

  const startTimerCapture = () => {
    setIsTimerActive(true);
    setCountdown(timerValue);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);
          capturePhoto();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextPage = async () => {
    const imageBlob = capturedBlob || uploadedBlob;
    if (!imageBlob) {
      console.log('No image to upload.');
      return;
    }
    try {
      setIsUploadLoading(true);
      const file = new File(
        [imageBlob],
        capturedBlob ? 'captured-photo.jpg' : 'uploaded-photo.jpg',
        {
          type: 'image/jpeg',
        },
      );

      let image = await uploadSingleFile(file);
      setImage(image);


      if (stream) {
        console.log('Stopping camera stream...');
        stream.getTracks().forEach((track) => track.stop());
      }

      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }

      if (uploadedImage) {
        URL.revokeObjectURL(uploadedImage);
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      setCameraError({
        label: 'Upload Failed',
        body: 'There was an error uploading your photo. Please try again.',
      });
    } finally {
      setIsUploadLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clear any previous errors
    setCameraError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setCameraError({
        label: 'Invalid File Type',
        body: 'Please select an image file (JPG, PNG, etc.).',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setCameraError({
        label: 'File Too Large',
        body: 'Please select an image smaller than 10MB.',
      });
      return;
    }

    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
      setCapturedBlob(null);
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setUploadedBlob(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const retakePhoto = async () => {
    setIsRetaking(true);
    setCapturedImage(null);
    setCapturedBlob(null);
    setUploadedImage(null);
    setUploadedBlob(null);
    setCameraError(null);

    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }

    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }

    // Only try to restart camera if permission was previously granted
    if (cameraPermission === 'granted') {
      try {
        await startCamera();
      } catch (error) {
        console.error('Error restarting camera:', error);
      }
    } else if (cameraPermission === 'denied') {
      // If camera was denied but user had uploaded image, just clear the upload
      // and let them choose again
      setCameraPermission('checking');
      await startCamera();
    }

    setIsRetaking(false);
  };

  if (cameraError && cameraPermission === 'denied') {
    return (
      <section className="animate-appearance-in border border-gray-400/50 rounded-2xl p-5 bg-gray-500/50 backdrop-blur-sm flex flex-col gap-7 m-auto">
        <div className="mb-8">
          <div
            className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-sm border-4 border-gray-200 flex items-center justify-center"
            style={{ aspectRatio: '3/4', width: '320px', height: '320px' }}
          >
            <div className="text-center text-white p-8">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-lg font-semibold mb-2">
                {cameraError.label}
              </h3>
              <p className="text-sm text-gray-300 mb-6">{cameraError.body}</p>
              <Button onClick={startCamera} className="mb-4">
                Try Again
              </Button>
            </div>
          </div>
        </div>

        {/* Upload option when camera is not available */}
        <div className="space-y-4">
          <div className="flex flex-row justify-center">
            <Button
              size={"icon"}
              onClick={handleUploadClick}
              disabled={isLoading}
            >
              <LuUpload />
            </Button>
          </div>
          <div className="text-center text-sm text-gray-300">
            <p>Upload an image file to continue</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* <div className="flex flex-row justify-between items-center">
          <Button size={"icon"} onClick={GoPrevious}>
            <MdOutlineKeyboardArrowLeft className="size-7" />
          </Button>
        </div> */}
      </section>
    );
  }

  return (
    <section className="animate-appearance-in border border-gray-400/50 rounded-2xl p-5 bg-gray-500/50 backdrop-blur-sm w-fit flex flex-col gap-7 m-auto">
      <div className="mb-8">
        <div
          className="relative bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-sm border-4 border-gray-200"
          style={{ aspectRatio: '3/4', width: '320px', height: '320px' }}
        >
          {(isLoading || isRetaking) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <div className="text-center text-white">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-lg font-medium">
                  {isRetaking
                    ? 'Restarting camera...'
                    : 'Preparing your camera...'}
                </p>
              </div>
            </div>
          )}

          {isTimerActive && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <div className="text-center text-white">
                <div className="text-8xl font-bold mb-6">{countdown}</div>
                <p className="text-2xl font-medium">Get ready...</p>
              </div>
            </div>
          )}

          {capturedImage || uploadedImage ? (
            <div className="relative w-full h-full">
              <img
                src={capturedImage || uploadedImage || ''}
                alt="Your Amazing Photo"
                className="w-full h-full object-cover"
              />
              {capturedDimensions && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                  {capturedDimensions.width} × {capturedDimensions.height}
                </div>
              )}
            </div>
          ) : cameraPermission === 'denied' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-white p-8">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-sm text-gray-300">Camera not available</p>
                <p className="text-xs text-gray-400 mt-2">
                  Use upload button below
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: isMirrored ? 'scaleX(-1)' : 'none',
                }}
              />
              {videoDimensions && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                  {videoDimensions.width} × {videoDimensions.height}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {capturedImage || uploadedImage ? (
        <div className="flex flex-row gap-5 items-center justify-center">
          <Button
            size={"icon"}
            onClick={retakePhoto}
            disabled={isRetaking}
          >
            <MdOutlineRefresh />
          </Button>
          <Button
            size={"icon"}
            onClick={handleNextPage}
            disabled={isUploadLoading}
          >
            <LuCheck />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-row gap-5 items-center justify-center">
            {/* Upload button first */}
            <Button
              size={"icon"}
              onClick={handleUploadClick}
              disabled={isTimerActive || isLoading}
            >
              <LuUpload />
            </Button>

            {/* Camera button - only show if camera permission is granted */}
            {cameraPermission === 'granted' && (
              <Button
                size={"icon"}
                onClick={timerValue > 0 ? startTimerCapture : capturePhoto}
                disabled={isTimerActive || isLoading}
              >
                <LuCamera />
              </Button>
            )}
          </div>
          <div className="text-center text-sm text-gray-300">
            <p>
              {cameraPermission === 'granted'
                ? 'Upload an image or take a photo with your camera'
                : cameraPermission === 'checking'
                  ? 'Checking camera access...'
                  : 'Upload an image file to continue'}
            </p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <canvas ref={canvasRef} className="hidden" />
      {/* <div className="flex flex-row justify-between items-center">
        <Button size={"icon"} onClick={GoPrevious}>
          <MdOutlineKeyboardArrowLeft className="size-7" />
        </Button>
      </div> */}
    </section>
  );
}
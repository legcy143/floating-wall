import React, { useEffect, useRef, useState } from 'react';
import { LuCamera, LuCameraOff, LuImages, LuLoader } from 'react-icons/lu';
import { MdOutlineFlipCameraIos, MdOutlineKeyboardArrowLeft, MdOutlineRefresh } from 'react-icons/md';


import { Button } from '@/components/ui/button';
import { uploadSingleFile } from '@/utils/upload';

interface CameraInterface {
  image: string | null;
  setImage: React.Dispatch<React.SetStateAction<string>>;
}

export default function Camera({ image, setImage }: CameraInterface) {

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerValue, setTimerValue] = useState(0);
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
          width: { ideal: 280 },
          height: { ideal: 373 },
          facingMode: facingMode,
          aspectRatio: { ideal: 3 / 4 },
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

    setCameraError(null);

    if (!file.type.startsWith('image/')) {
      setCameraError({
        label: 'Invalid File Type',
        body: 'Please select an image file (JPG, PNG, etc.).',
      });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setCameraError({
        label: 'File Too Large',
        body: 'Please select an image smaller than 15MB.',
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

  const handleToggle = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    setIsMirrored(newFacingMode === 'user');

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 280 },
          height: { ideal: 373 },
          facingMode: newFacingMode,
          aspectRatio: { ideal: 3 / 4 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      setFacingMode(facingMode);
      setIsMirrored(facingMode === 'user');
    } finally {
      setIsLoading(false);
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

    if (cameraPermission === 'granted') {
      try {
        await startCamera();
      } catch (error) {
        console.error('Error restarting camera:', error);
      }
    } else if (cameraPermission === 'denied') {
      setCameraPermission('checking');
      await startCamera();
    }

    setIsRetaking(false);
  };

  if (cameraError && cameraPermission === 'denied') {
    return (
      <section className="animate-appearance-in rounded-2xl p-3 flex flex-col gap-4 w-full max-w-xs mx-auto">
        <div className="w-full">
          <div
            className="relative rounded-3xl overflow-hidden shadow-2xl mx-auto w-full flex items-center justify-center"
            style={{ aspectRatio: '3/4', maxWidth: '280px' }}
          >
            <div className="text-center text-white p-8">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-lg font-semibold mb-2">
                {cameraError.label}
              </h3>
              <p className="text-sm opacity-70 mb-6">{cameraError.body}</p>
              <Button onClick={startCamera} className="mb-4">
                Try Again
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-row justify-center">
            <Button
              variant={"theme"}
              size={"icon"}
              onClick={handleUploadClick}
              disabled={isLoading}
            >
              <LuImages size={20} />
            </Button>
          </div>
          {/* <div className="text-center text-sm text-gray-300">
            <p>Upload an image file to continue</p>
          </div> */}
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
    <section className="animate-appearance-in rounded-2xl p-3 w-full max-w-xs mx-auto flex flex-col gap-4">
      <div className="w-full">
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl mx-auto w-full"
          style={{ aspectRatio: '3/4', maxWidth: '280px' }}
        >
          {(isLoading || isRetaking) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
              <div className="text-center text-white">
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
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="text-center text-white p-8">
                <LuCameraOff className='text-4xl mb-4 text-center mx-auto'/>
                <p className="text-sm ">
                  Unable to access the camera. Please verify your settings and grant the necessary permissions. or use the upload option below.
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
            variant={"outline"}
            onClick={retakePhoto}
            disabled={isRetaking || isUploadLoading}
          >
            Retry
          </Button>
          <Button
            onClick={handleNextPage}
            disabled={isUploadLoading}
          >
            {
              isUploadLoading && <LuLoader className="animate-spin" />
            }
            continue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-row gap-5 items-center justify-center">
            <Button
              variant={"theme"}
              size={"icon"}
              onClick={handleUploadClick}
              disabled={isTimerActive || isLoading}
            >
              <LuImages size={20} />
            </Button>

            {cameraPermission === 'granted' && (
              <>
                <Button
                  variant={"theme"}
                  size={"icon"}
                  className='text-white-500 size-16 rounded-full'
                  onClick={timerValue > 0 ? startTimerCapture : capturePhoto}
                  disabled={isTimerActive || isLoading}
                >
                  <LuCamera size={25} />
                </Button>
                <Button
                  variant={"theme"}
                  size={"icon"}
                  onClick={handleToggle}
                  disabled={isTimerActive || isLoading}
                >
                  <MdOutlineFlipCameraIos size={20}/>
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}
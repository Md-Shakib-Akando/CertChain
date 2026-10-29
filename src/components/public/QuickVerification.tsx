'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import {
  Search,
  QrCode,
  Camera,
  Upload,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CameraOff,
  FileText,
  Download,
  Eye,
  RotateCcw,
  CircleHelp,
  CloudOff,
  RefreshCw,
  FlipHorizontal,
} from 'lucide-react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Segmented,
  Input,
  StatusBadge,
  HashText,
  explorerTxUrl,
  Dialog,
  CertificateDocumentPreview,
  DescriptionList,
  Alert,
} from '@/components/ui';

type VerificationStatus = 'VALID' | 'REVOKED' | 'NOT_FOUND' | 'INVALID_MODIFIED' | 'ERROR';

interface VerificationResult {
  id: string;
  name: string;
  studentId?: string;
  degree: string;
  program?: string;
  type?: string;
  status: VerificationStatus;
  session?: string;
  cgpa?: string;
  issueDate?: string;
  sha256Hash?: string;
  txHash: string;
  blockNumber: string;
  numericBlock?: number;
  network?: string;
  revocationReason?: string;
  revocationDate?: string;
  message?: string;
  computedHash?: string;
  expectedHash?: string;
}

interface BarcodeDetectorLike {
  detect(source: ImageBitmapSource): Promise<Array<{ rawValue?: string }>>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetectorLike;
    };
  }
}

export const QuickVerification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'id' | 'qr' | 'pdf'>('id');
  const [certIdInput, setCertIdInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null);
  const [selectedPdfSize, setSelectedPdfSize] = useState<number | null>(null);
  const [pdfDropError, setPdfDropError] = useState<string | null>(null);
  const [selectedQrFileName, setSelectedQrFileName] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [isDraggingQr, setIsDraggingQr] = useState<boolean>(false);
  const [isDraggingPdf, setIsDraggingPdf] = useState<boolean>(false);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Real Camera Scanner State
  const [isScanningCamera, setIsScanningCamera] = useState<boolean>(false);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [mirrorCamera, setMirrorCamera] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScanningCameraRef = useRef<boolean>(false);
  const mirrorCameraRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const scanTickCountRef = useRef<number>(0);

  // Verification Result State
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    mirrorCameraRef.current = mirrorCamera;
  }, [mirrorCamera]);

  const extractCertIdFromQr = useCallback((text: string): string => {
    const trimmed = text.trim();
    if (!trimmed) return '';

    // 1. Check if the string directly contains an official Certificate ID pattern
    const certIdPattern = /(PUB-(?:DEG|PRO|TRN|CRT)-\d{4}-\d+|CERT-DEMO-\d{4}-\d+)/i;

    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed);
        const queryId = url.searchParams.get('id') || url.searchParams.get('certId');
        if (queryId) return queryId.trim().toUpperCase();

        const queryToken = url.searchParams.get('token');
        if (queryToken) return queryToken.trim();

        // Check if query params were placed inside hash (e.g. #verify?id=...)
        if (url.hash && url.hash.includes('?')) {
          const hashQuery = new URLSearchParams(url.hash.slice(url.hash.indexOf('?')));
          const hashId = hashQuery.get('id') || hashQuery.get('certId');
          if (hashId) return hashId.trim().toUpperCase();
        }

        const pathParts = url.pathname.split('/').filter(Boolean);
        // Handle student share link URLs: /s/<token> -> preserve token case for SHA-256 lookup
        if (pathParts.length >= 2 && pathParts[0].toLowerCase() === 's') {
          return decodeURIComponent(pathParts[1]).trim();
        }

        if (pathParts.length > 0) {
          const lastSeg = decodeURIComponent(pathParts[pathParts.length - 1]).trim();
          const embeddedMatch = lastSeg.match(certIdPattern);
          if (embeddedMatch) return embeddedMatch[1].toUpperCase();
          return lastSeg.toUpperCase();
        }
      }
    } catch {
      // Not a valid URL, fall through to pattern/raw matching
    }

    const directMatch = trimmed.match(certIdPattern);
    if (directMatch) {
      return directMatch[1].toUpperCase();
    }

    return trimmed.toUpperCase();
  }, []);

  // REAL VERIFICATION BY ID OR SHARE TOKEN
  const handleVerify = useCallback(async (idToSearch: string) => {
    const rawTrimmed = idToSearch.trim();
    if (!rawTrimmed) return;

    // Preserve case if it looks like a 64-char hex share token; otherwise uppercase Certificate ID
    const isHexShareToken = /^[a-f0-9]{32,128}$/i.test(rawTrimmed) || rawTrimmed.startsWith('offline-');
    const queryParam = isHexShareToken ? rawTrimmed : rawTrimmed.toUpperCase();

    setIsVerifying(true);
    setCameraError(null);

    try {
      const res = await fetch(`/api/public/verify/${encodeURIComponent(queryParam)}`);
      const data = await res.json();

      if (res.ok && data.success && data.certificate) {
        setResult({
          id: data.certificate.id,
          name: data.certificate.studentName,
          studentId: data.certificate.studentId,
          degree: data.certificate.degree || data.certificate.program,
          program: data.certificate.program,
          type: data.certificate.type,
          status: data.status,
          session: data.certificate.session,
          cgpa: data.certificate.cgpa,
          issueDate: data.certificate.issueDate,
          sha256Hash: data.certificate.sha256Hash,
          txHash: data.certificate.txHash,
          blockNumber: data.certificate.blockNumber ? `#${data.certificate.blockNumber}` : '',
          numericBlock: data.certificate.blockNumber,
          network: data.certificate.network,
          revocationReason: data.certificate.revocationReason,
          revocationDate: data.certificate.revocationDate,
        });
      } else if (res.status >= 500) {
        setResult({
          id: queryParam,
          name: 'N/A',
          degree: 'N/A',
          status: 'ERROR',
          message:
            data.message ||
            'The verification ledger service encountered an unexpected error. Please try again shortly.',
          txHash: '',
          blockNumber: '',
        });
      } else {
        setResult({
          id: queryParam,
          name: 'N/A',
          degree: 'N/A',
          status: 'NOT_FOUND',
          message:
            data.message ||
            `Invalid credential identifier. "${queryParam}" is not a valid certificate registered on the university blockchain ledger.`,
          txHash: '',
          blockNumber: '',
        });
      }
    } catch {
      setResult({
        id: queryParam,
        name: 'N/A',
        degree: 'N/A',
        status: 'ERROR',
        message:
          'Could not reach the verification service. Please verify your network connection and try again.',
        txHash: '',
        blockNumber: '',
      });
    } finally {
      setIsVerifying(false);
    }
  }, []);

  // Auto-verify on mount if ?id= is in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('id') || params.get('certId') || params.get('token');
      if (queryId) {
        setTimeout(() => {
          setCertIdInput(queryId);
          handleVerify(queryId);
        }, 100);
      }
    }
  }, [handleVerify]);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    isScanningCameraRef.current = false;
    setIsStartingCamera(false);

    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      const videoStream = videoRef.current.srcObject as MediaStream | null;
      if (videoStream) {
        videoStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
      }
      videoRef.current.srcObject = null;
    }

    setIsScanningCamera(false);
  }, []);

  const tickScanRef = useRef<() => void>(() => {});

  const tickScan = useCallback(() => {
    if (!isScanningCameraRef.current || !videoRef.current) return;

    const now = performance.now();
    // Throttle heavy pixel decoding to ~11-12 scans/sec so video playback stays smooth
    if (now - lastScanTimeRef.current >= 85) {
      lastScanTimeRef.current = now;
      const video = videoRef.current;

      if (
        video.readyState >= video.HAVE_CURRENT_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        try {
          // 1. Fast path: Native BarcodeDetector if available
          if (typeof window !== 'undefined' && window.BarcodeDetector) {
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
            detector
              .detect(video)
              .then((barcodes) => {
                if (!isScanningCameraRef.current) return;
                const raw = barcodes?.[0]?.rawValue;
                if (raw) {
                  const detectedId = extractCertIdFromQr(raw);
                  if (detectedId) {
                    stopCamera();
                    setCertIdInput(detectedId);
                    void handleVerify(detectedId);
                  }
                }
              })
              .catch(() => {});
          }

          // 2. Universal path: jsQR multi-pass on offscreen canvas
          if (!scanCanvasRef.current) {
            scanCanvasRef.current = document.createElement('canvas');
          }
          const canvas = scanCanvasRef.current;
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          const tick = scanTickCountRef.current++;

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            // Pass A: Full video frame (or mirrored on every 3rd tick)
            const flipHoriz = mirrorCameraRef.current || tick % 3 === 2;
            canvas.width = vw;
            canvas.height = vh;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, vw, vh);

            if (flipHoriz) {
              ctx.save();
              ctx.translate(vw, 0);
              ctx.scale(-1, 1);
              ctx.drawImage(video, 0, 0, vw, vh);
              ctx.restore();
            } else {
              ctx.drawImage(video, 0, 0, vw, vh);
            }

            const fullData = ctx.getImageData(0, 0, vw, vh);
            let code = jsQR(fullData.data, fullData.width, fullData.height, {
              inversionAttempts: 'attemptBoth',
            });

            // Pass B: 2x upscaled center target crop with white quiet-zone padding
            if (!code || !code.data) {
              const cropSize = Math.floor(Math.min(vw, vh) * 0.6);
              const sx = Math.floor((vw - cropSize) / 2);
              const sy = Math.floor((vh - cropSize) / 2);
              const pad = 24;
              const targetSize = Math.min(cropSize * 2, 640);

              canvas.width = targetSize + pad * 2;
              canvas.height = targetSize + pad * 2;
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(video, sx, sy, cropSize, cropSize, pad, pad, targetSize, targetSize);

              const cropData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              code = jsQR(cropData.data, cropData.width, cropData.height, {
                inversionAttempts: 'attemptBoth',
              });
            }

            if (code && code.data) {
              const detectedId = extractCertIdFromQr(code.data);
              if (detectedId) {
                stopCamera();
                setCertIdInput(detectedId);
                void handleVerify(detectedId);
                return;
              }
            }
          }
        } catch {
          // Ignore transient frame read errors so the scan loop continues uninterrupted
        }
      }
    }

    if (isScanningCameraRef.current) {
      animFrameIdRef.current = requestAnimationFrame(tickScanRef.current);
    }
  }, [extractCertIdFromQr, handleVerify, stopCamera]);

  useEffect(() => {
    tickScanRef.current = tickScan;
  }, [tickScan]);

  const startCamera = useCallback(
    async (overrideDeviceId?: string) => {
      setCameraError(null);

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== 'function'
      ) {
        setCameraError(
          'Browser camera access requires a secure context (localhost or HTTPS). Please open the app via http://localhost:3000 or upload a QR image below.'
        );
        return;
      }

      stopCamera();
      setIsStartingCamera(true);

      const targetDevice = overrideDeviceId !== undefined ? overrideDeviceId : selectedDeviceId;

      try {
        let stream: MediaStream;
        try {
          const videoConstraints: MediaTrackConstraints = targetDevice
            ? {
                deviceId: { exact: targetDevice },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              };
          stream = await navigator.mediaDevices.getUserMedia({
            video: videoConstraints,
            audio: false,
          });
        } catch {
          // Fallback to default unconstrained video input (e.g., laptop webcams without facingMode)
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        streamRef.current = stream;

        // Discover available cameras for camera switcher
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter((d) => d.kind === 'videoinput');
          setVideoDevices(cameras);
          const activeTrack = stream.getVideoTracks()[0];
          const activeDeviceId = activeTrack?.getSettings()?.deviceId;
          if (activeDeviceId) {
            setSelectedDeviceId(activeDeviceId);
          }
        } catch {}

        const video = videoRef.current;
        if (!video) {
          stopCamera();
          setCameraError('Could not initialize video preview element. Please try again.');
          return;
        }

        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;

        // Wait for video metadata before starting playback
        if (video.readyState < 1) {
          await new Promise<void>((resolve) => {
            const onLoaded = () => {
              video.removeEventListener('loadedmetadata', onLoaded);
              resolve();
            };
            video.addEventListener('loadedmetadata', onLoaded);
            setTimeout(resolve, 1500);
          });
        }

        try {
          await video.play();
        } catch {
          // Ignore AbortError if autoPlay already started the stream
        }

        setIsStartingCamera(false);
        setIsScanningCamera(true);
        isScanningCameraRef.current = true;
        lastScanTimeRef.current = 0;
        animFrameIdRef.current = requestAnimationFrame(tickScanRef.current);
      } catch (err) {
        stopCamera();
        const errName = err instanceof Error ? err.name : '';
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied by your browser. Please allow camera access in the address bar settings, or upload an image of the QR code below.'
          );
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setCameraError(
            'No camera hardware was detected on this device. You can upload a QR image, screenshot, or certificate PDF below instead.'
          );
        } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
          setCameraError(
            'Your camera is currently in use by another application. Close other apps using the camera and try again, or upload a QR image below.'
          );
        } else {
          setCameraError(
            'Camera access is unavailable on this device. You can upload an image or screenshot of the QR code below instead.'
          );
        }
      }
    },
    [selectedDeviceId, stopCamera]
  );

  const handleSwitchCamera = () => {
    if (videoDevices.length < 2) return;
    const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextDevice = videoDevices[(currentIndex + 1) % videoDevices.length];
    if (nextDevice) {
      setSelectedDeviceId(nextDevice.deviceId);
      void startCamera(nextDevice.deviceId);
    }
  };

  // Stop camera if user leaves the 'qr' tab
  useEffect(() => {
    if (activeTab !== 'qr' && (isScanningCameraRef.current || streamRef.current)) {
      stopCamera();
    }
  }, [activeTab, stopCamera]);

  // Stop camera on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  /**
   * Multi-scale, multi-region QR decoder for HTMLImageElement.
   * Handles transparent PNGs, tight quiet zones (margin=1), small 54px-64px preview screenshots,
   * full-page certificate screenshots (where the QR stamp is in the bottom-right corner),
   * and high-res camera photos.
   */
  const decodeQrFromImageElement = useCallback(
    async (img: HTMLImageElement): Promise<string | null> => {
      // 1. Try native BarcodeDetector first if supported
      if (typeof window !== 'undefined' && window.BarcodeDetector) {
        try {
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const results = await detector.detect(img);
          if (results?.[0]?.rawValue) {
            return results[0].rawValue;
          }
        } catch {}
      }

      const nw = img.naturalWidth || img.width;
      const nh = img.naturalHeight || img.height;
      if (!nw || !nh) return null;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return null;

      const scanRegion = (
        sx: number,
        sy: number,
        sw: number,
        sh: number,
        targetW: number,
        targetH: number,
        smoothing: boolean,
        contrastThreshold?: number
      ): string | null => {
        if (sw <= 0 || sh <= 0 || targetW <= 0 || targetH <= 0) return null;
        // Add generous white quiet-zone border (48px) around the image
        const pad = 48;
        canvas.width = Math.round(targetW + pad * 2);
        canvas.height = Math.round(targetH + pad * 2);

        // Fill solid white first so transparent PNGs or tight borders have a clean quiet zone
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = smoothing;
        ctx.drawImage(
          img,
          Math.round(sx),
          Math.round(sy),
          Math.round(sw),
          Math.round(sh),
          pad,
          pad,
          Math.round(targetW),
          Math.round(targetH)
        );

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (typeof contrastThreshold === 'number') {
          const d = imageData.data;
          for (let i = 0; i < d.length; i += 4) {
            const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
            const v = lum < contrastThreshold ? 0 : 255;
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
            d[i + 3] = 255;
          }
        }

        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });
        return code?.data || null;
      };

      // Pass 1: Full image at native resolution (capped at 1400px) with white quiet-zone padding
      const maxDim = Math.max(nw, nh);
      const baseScale = maxDim > 1400 ? 1400 / maxDim : 1;
      let hit = scanRegion(0, 0, nw, nh, nw * baseScale, nh * baseScale, true);
      if (hit) return hit;

      // Pass 2: Upscaled nearest-neighbor (critical for small 50px-180px QR images)
      if (maxDim < 500) {
        hit =
          scanRegion(0, 0, nw, nh, nw * 2, nh * 2, false) ||
          scanRegion(0, 0, nw, nh, nw * 3, nh * 3, false) ||
          scanRegion(0, 0, nw, nh, nw * 4, nh * 4, false);
        if (hit) return hit;
      }

      // Pass 3: Downscaled passes (critical for noisy high-resolution photos/screenshots)
      for (const targetMax of [800, 500, 320]) {
        if (maxDim > targetMax) {
          const s = targetMax / maxDim;
          hit = scanRegion(0, 0, nw, nh, nw * s, nh * s, true);
          if (hit) return hit;
        }
      }

      // Pass 4: Region-of-Interest (ROI) crops for full certificate screenshots
      // CertChain places the QR stamp in the bottom-right corner of the certificate.
      const roiCrops: Array<[number, number, number, number]> = [
        // Tight bottom-right corner
        [nw * 0.62, nh * 0.55, nw * 0.38, nh * 0.45],
        // Wide bottom-right quadrant
        [nw * 0.45, nh * 0.45, nw * 0.55, nh * 0.55],
        // Bottom strip
        [0, nh * 0.5, nw, nh * 0.5],
        // Center region
        [nw * 0.15, nh * 0.15, nw * 0.7, nh * 0.7],
        // Bottom-left quadrant
        [0, nh * 0.45, nw * 0.55, nh * 0.55],
        // Top-right quadrant
        [nw * 0.45, 0, nw * 0.55, nh * 0.55],
        // Top-left quadrant
        [0, 0, nw * 0.55, nh * 0.55],
      ];

      for (const [cx, cy, cw, ch] of roiCrops) {
        for (const mult of [1, 2, 3]) {
          const tw = Math.min(cw * mult, 1200);
          const th = Math.min(ch * mult, 1200);
          hit =
            scanRegion(cx, cy, cw, ch, tw, th, false) ||
            scanRegion(cx, cy, cw, ch, tw, th, true);
          if (hit) return hit;
        }
      }

      // Pass 5: High-contrast thresholded passes on full image and bottom-right corner
      for (const thresh of [150, 185, 115]) {
        hit =
          scanRegion(0, 0, nw, nh, nw * baseScale, nh * baseScale, false, thresh) ||
          scanRegion(nw * 0.55, nh * 0.5, nw * 0.45, nh * 0.5, nw * 0.9, nh, false, thresh);
        if (hit) return hit;
      }

      return null;
    },
    []
  );

  /**
   * Extract and decode embedded QR image from a CertChain PDF file if uploaded in the QR tab.
   */
  const decodeQrFromPdfFile = useCallback(async (file: File): Promise<string | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const latin1 = Array.from(bytes)
        .map((b) => String.fromCharCode(b))
        .join('');

      if (typeof DecompressionStream !== 'undefined') {
        const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
        let match: RegExpExecArray | null;

        while ((match = streamRegex.exec(latin1)) !== null) {
          const rawStr = match[1];
          const rawBytes = new Uint8Array(rawStr.length);
          for (let i = 0; i < rawStr.length; i++) {
            rawBytes[i] = rawStr.charCodeAt(i) & 0xff;
          }

          try {
            // Skip 2-byte zlib header (0x78 0x9c) for raw deflate or use 'deflate'
            const ds = new DecompressionStream('deflate');
            const writer = ds.writable.getWriter();
            void writer.write(rawBytes);
            void writer.close();
            const inflatedBuf = await new Response(ds.readable).arrayBuffer();
            const inflated = new Uint8Array(inflatedBuf);

            // Check if this stream is an RGB square QR image (e.g. 200x200x3 or 240x240x3)
            const pixelCount = inflated.length / 3;
            const dim = Math.round(Math.sqrt(pixelCount));
            if (dim >= 64 && dim <= 600 && dim * dim * 3 === inflated.length) {
              const pad = 24;
              const paddedDim = dim + pad * 2;
              const rgba = new Uint8ClampedArray(paddedDim * paddedDim * 4);
              rgba.fill(255);

              for (let y = 0; y < dim; y++) {
                for (let x = 0; x < dim; x++) {
                  const sIdx = (y * dim + x) * 3;
                  const dIdx = ((y + pad) * paddedDim + (x + pad)) * 4;
                  rgba[dIdx] = inflated[sIdx];
                  rgba[dIdx + 1] = inflated[sIdx + 1];
                  rgba[dIdx + 2] = inflated[sIdx + 2];
                  rgba[dIdx + 3] = 255;
                }
              }

              const qr = jsQR(rgba, paddedDim, paddedDim, {
                inversionAttempts: 'attemptBoth',
              });
              if (qr?.data) return qr.data;
            }
          } catch {}
        }
      }

      // Fallback: check filename for official Certificate ID
      const nameMatch = file.name.match(/(PUB-(?:DEG|PRO|TRN|CRT)-\d{4}-\d+|CERT-DEMO-\d{4}-\d+)/i);
      if (nameMatch) return nameMatch[1].toUpperCase();
    } catch {}
    return null;
  }, []);

  const processQrFile = useCallback(
    async (file: File) => {
      setSelectedQrFileName(file.name);
      setIsVerifying(true);
      setCameraError(null);

      try {
        // Support PDF files uploaded in the QR scanner tab
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const pdfQrData = await decodeQrFromPdfFile(file);
          if (pdfQrData) {
            const detectedId = extractCertIdFromQr(pdfQrData);
            setCertIdInput(detectedId);
            await handleVerify(detectedId);
            return;
          }
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });

        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new window.Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('Invalid image file'));
          image.src = dataUrl;
        });

        const decodedText = await decodeQrFromImageElement(img);
        if (decodedText) {
          const detectedId = extractCertIdFromQr(decodedText);
          setCertIdInput(detectedId);
          await handleVerify(detectedId);
        } else {
          setIsVerifying(false);
          setResult({
            id: file.name,
            name: 'N/A',
            degree: 'N/A',
            status: 'NOT_FOUND',
            message:
              'Invalid QR code. No valid PUB CertChain verification QR stamp was detected in the uploaded file.',
            txHash: '',
            blockNumber: '',
          });
        }
      } catch {
        setIsVerifying(false);
        setResult({
          id: file.name,
          name: 'N/A',
          degree: 'N/A',
          status: 'ERROR',
          message:
            'Could not decode the uploaded file. Please upload a PNG, JPG, WebP screenshot of the QR code, or the official PDF.',
          txHash: '',
          blockNumber: '',
        });
      }
    },
    [decodeQrFromImageElement, decodeQrFromPdfFile, extractCertIdFromQr, handleVerify]
  );

  // REAL QR IMAGE UPLOAD SCANNING
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processQrFile(file);
    }
    e.target.value = '';
  };

  // Support pasting a screenshot (Ctrl+V) while on the QR tab
  useEffect(() => {
    if (activeTab !== 'qr') return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            void processQrFile(blob);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeTab, processQrFile]);

  // Generate & scan or download a sample QR image for quick testing
  const handleSampleQrAction = async (certId: string, mode: 'scan' | 'download') => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const verifyUrl = `${origin}/?id=${encodeURIComponent(certId)}#verify`;
      const dataUrl = await QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 280,
        color: {
          dark: '#0B1F3AFF',
          light: '#FFFFFFFF',
        },
      });

      if (mode === 'download') {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${certId}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Convert generated PNG DataURL into a File and run it through the real QR image decoder pipeline
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const sampleFile = new File([blob], `${certId}-qr.png`, { type: 'image/png' });
      await processQrFile(sampleFile);
    } catch {}
  };

  // REAL PDF SHA-256 FINGERPRINT VERIFICATION
  const processPdfFile = async (file: File) => {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setPdfDropError(
        `Invalid file "${file.name}". Please drop or select an official PDF document (.pdf) for SHA-256 cryptographic verification.`
      );
      return;
    }

    setPdfDropError(null);
    setSelectedPdfName(file.name);
    setSelectedPdfSize(file.size);
    setIsVerifying(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const idMatch = file.name.match(/(PUB-(?:DEG|PRO|TRN|CRT)-\d{4}-\d+|CERT-DEMO-\d{4}-\d+)/i);
      let extractedCertId = idMatch ? idMatch[0] : '';

      if (!extractedCertId) {
        const embeddedQrText = await decodeQrFromPdfFile(file);
        if (embeddedQrText) {
          extractedCertId = extractCertIdFromQr(embeddedQrText);
        }
      }
      if (!extractedCertId) {
        extractedCertId = file.name.replace(/\.pdf$/i, '');
      }

      const res = await fetch('/api/public/verify/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: hexHash, certId: extractedCertId }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.certificate) {
        setResult({
          id: data.certificate.id,
          name: data.certificate.studentName,
          studentId: data.certificate.studentId,
          degree: data.certificate.degree || data.certificate.program,
          program: data.certificate.program,
          type: data.certificate.type,
          status: data.status,
          session: data.certificate.session,
          cgpa: data.certificate.cgpa,
          issueDate: data.certificate.issueDate,
          sha256Hash: data.certificate.sha256Hash || hexHash,
          txHash: data.certificate.txHash,
          blockNumber: data.certificate.blockNumber ? `#${data.certificate.blockNumber}` : '',
          numericBlock: data.certificate.blockNumber,
          network: data.certificate.network,
          revocationReason: data.certificate.revocationReason,
          revocationDate: data.certificate.revocationDate,
          computedHash: hexHash,
        });
      } else if (data.status === 'INVALID_MODIFIED') {
        setResult({
          id: data.certificateId || extractedCertId,
          name: data.studentName || 'Official Student Record',
          degree: 'N/A',
          status: 'INVALID_MODIFIED',
          message:
            data.message ||
            'Security Alert: The uploaded PDF byte hash does not match the official hash anchored on-chain. This file has been modified or forged.',
          txHash: '',
          blockNumber: '',
          computedHash: data.computedHash || hexHash,
          expectedHash: data.expectedHash,
        });
      } else {
        setResult({
          id: file.name,
          name: 'N/A',
          degree: 'N/A',
          status: 'NOT_FOUND',
          message:
            data.message ||
            'Invalid PDF document. This cryptographic SHA-256 fingerprint is not registered on the university blockchain ledger.',
          txHash: '',
          blockNumber: '',
          computedHash: hexHash,
        });
      }
    } catch {
      setResult({
        id: file.name,
        name: 'N/A',
        degree: 'N/A',
        status: 'ERROR',
        message: 'Failed to compute SHA-256 digest or communicate with the verification endpoint.',
        txHash: '',
        blockNumber: '',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processPdfFile(file);
    }
    e.target.value = '';
  };

  const sampleIds = [
    { id: 'PUB-DEG-2026-000105', label: 'PUB-DEG-2026-000105 (Valid)' },
    { id: 'CERT-DEMO-2026-002', label: 'CERT-DEMO-2026-002 (Revoked)' },
  ];

  return (
    <section id="verify" className="bg-canvas paper-grain py-16 sm:py-24 border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-2xl mb-10">
          <p className="eyebrow mb-1.5">Public Verification Workbench &middot; Zero Gas</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
            Verify an Academic Credential
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted leading-relaxed">
            Authenticate any Pundra University certificate by entering its Certificate ID, scanning its printed QR stamp, or uploading the official PDF for client-side SHA-256 tamper inspection.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Verification Input Workbench */}
          <div className="lg:col-span-6">
            <Card>
              <CardHeader
                title="Select Verification Method"
                description="All verification queries are read-only and free for public verifiers."
              />
              <CardBody className="space-y-5">
                <Segmented
                  fullWidth
                  ariaLabel="Verification method"
                  value={activeTab}
                  onChange={(k) => {
                    stopCamera();
                    setActiveTab(k);
                  }}
                  items={[
                    { key: 'id', label: 'Certificate ID', icon: <Search /> },
                    { key: 'qr', label: 'Scan QR Code', icon: <QrCode /> },
                    { key: 'pdf', label: 'Upload PDF', icon: <FileText /> },
                  ]}
                />

                {/* TAB 1: Certificate ID */}
                {activeTab === 'id' && (
                  <div className="space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (certIdInput.trim()) {
                          void handleVerify(certIdInput);
                        }
                      }}
                      className="space-y-3"
                    >
                      <label htmlFor="cert-id-search-input" className="block text-[13px] font-medium text-ink">
                        Certificate Identifier
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <Input
                          id="cert-id-search-input"
                          type="text"
                          mono
                          inputSize="lg"
                          value={certIdInput}
                          onChange={(e) => setCertIdInput(e.target.value)}
                          placeholder="e.g. PUB-DEG-2026-000105"
                          className="flex-1"
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          size="lg"
                          loading={isVerifying}
                          loadingText="Verifying..."
                          disabled={!certIdInput.trim()}
                          leftIcon={<Search />}
                        >
                          Verify Record
                        </Button>
                      </div>
                    </form>

                    {/* Quick Sample Pills */}
                    <div className="pt-2 border-t border-line flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-muted font-medium">Try official sample record:</span>
                      {sampleIds.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setCertIdInput(item.id);
                            void handleVerify(item.id);
                          }}
                          className="px-2.5 py-1 rounded bg-sunken hover:bg-[#e5e1d7] text-ink font-mono text-[11.5px] border border-line transition-colors cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 2: Scan QR Code */}
                {activeTab === 'qr' && (
                  <div className="space-y-4">
                    {cameraError && (
                      <Alert tone="warning" title="Camera notice">
                        {cameraError}
                      </Alert>
                    )}

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (!isScanningCamera) setIsDraggingQr(true);
                      }}
                      onDragLeave={() => setIsDraggingQr(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingQr(false);
                        const droppedFile = e.dataTransfer.files?.[0];
                        if (droppedFile) {
                          void processQrFile(droppedFile);
                        }
                      }}
                      className={`rounded-lg border p-5 flex flex-col items-center justify-center text-center min-h-[240px] transition-colors ${
                        isDraggingQr
                          ? 'border-brand bg-brand-muted/30 border-dashed'
                          : 'border-line bg-sunken/60'
                      }`}
                    >
                      {/* Keep <video> always mounted in DOM while on QR tab so videoRef.current is always ready */}
                      <div
                        className={
                          isScanningCamera
                            ? 'relative w-full max-w-[360px] h-56 rounded-md overflow-hidden bg-night border border-line-strong shadow-card'
                            : 'hidden'
                        }
                      >
                        <video
                          ref={videoRef}
                          className={`w-full h-full object-cover ${
                            mirrorCamera ? '-scale-x-100' : ''
                          }`}
                          playsInline
                          autoPlay
                          muted
                        />
                        {/* Viewfinder Target Reticle Overlay */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="size-36 rounded-lg border-2 border-white/80 shadow-[0_0_0_9999px_rgba(11,31,58,0.35)] relative">
                            <span className="absolute -top-0.5 -left-0.5 size-3 border-t-2 border-l-2 border-seal-bright" />
                            <span className="absolute -top-0.5 -right-0.5 size-3 border-t-2 border-r-2 border-seal-bright" />
                            <span className="absolute -bottom-0.5 -left-0.5 size-3 border-b-2 border-l-2 border-seal-bright" />
                            <span className="absolute -bottom-0.5 -right-0.5 size-3 border-b-2 border-r-2 border-seal-bright" />
                          </div>
                        </div>

                        {/* Top Camera Controls Overlay */}
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setMirrorCamera((m) => !m)}
                            title="Mirror camera horizontally"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-night/80 hover:bg-night text-white text-[11px] font-medium border border-white/20 cursor-pointer"
                          >
                            <FlipHorizontal className="size-3" />
                            <span>Mirror</span>
                          </button>
                          {videoDevices.length > 1 && (
                            <button
                              type="button"
                              onClick={handleSwitchCamera}
                              title="Switch camera device"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-night/80 hover:bg-night text-white text-[11px] font-medium border border-white/20 cursor-pointer"
                            >
                              <RefreshCw className="size-3" />
                              <span>Switch</span>
                            </button>
                          )}
                        </div>

                        {/* Bottom Live Indicator */}
                        <div className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-night/80 text-white text-[11px] font-medium border border-white/15">
                            <span className="size-2 rounded-full bg-success animate-pulse" />
                            Scanning for QR code...
                          </span>
                        </div>
                      </div>

                      {!isScanningCamera && (
                        <div className="size-24 rounded-lg bg-surface border border-line-strong shadow-card flex items-center justify-center">
                          <QrCode className="size-12 text-brand" />
                        </div>
                      )}

                      <p className="mt-3 text-xs text-muted max-w-sm">
                        {isScanningCamera
                          ? 'Center the certificate QR stamp inside the viewfinder frame for automatic detection.'
                          : 'Start your camera to scan live, or upload / drop / paste (Ctrl+V) a QR image, certificate screenshot, or PDF.'}
                      </p>

                      {selectedQrFileName && !isScanningCamera && (
                        <p className="mt-2 text-xs font-mono text-ink-2 bg-surface inline-block px-2.5 py-1 rounded border border-line">
                          Last scanned file: {selectedQrFileName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {isScanningCamera ? (
                        <Button
                          variant="danger"
                          onClick={stopCamera}
                          leftIcon={<CameraOff />}
                        >
                          Stop Camera
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => void startCamera()}
                          loading={isStartingCamera || isVerifying}
                          loadingText={isStartingCamera ? 'Starting Camera...' : 'Scanning...'}
                          leftIcon={<Camera />}
                        >
                          Start Camera Scan
                        </Button>
                      )}

                      <label className="inline-flex items-center justify-center gap-2 h-9.5 px-4 text-sm font-medium rounded-md bg-surface text-ink border border-line-strong shadow-card hover:bg-sunken cursor-pointer">
                        <Upload className="size-4 text-muted" />
                        <span>Upload QR Image / PDF</span>
                        <input
                          type="file"
                          accept="image/*,.pdf,application/pdf"
                          onChange={handleQrImageUpload}
                          className="sr-only"
                        />
                      </label>
                    </div>

                    {/* Quick Sample QR Scan & Download Pills */}
                    <div className="pt-2 border-t border-line flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-muted font-medium">Test QR scanner with sample:</span>
                        <button
                          type="button"
                          onClick={() => void handleSampleQrAction('PUB-DEG-2026-000105', 'scan')}
                          className="px-2.5 py-1 rounded bg-sunken hover:bg-[#e5e1d7] text-ink font-mono text-[11.5px] border border-line transition-colors cursor-pointer"
                        >
                          Scan Valid QR
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleSampleQrAction('CERT-DEMO-2026-002', 'scan')}
                          className="px-2.5 py-1 rounded bg-sunken hover:bg-[#e5e1d7] text-ink font-mono text-[11.5px] border border-line transition-colors cursor-pointer"
                        >
                          Scan Revoked QR
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSampleQrAction('PUB-DEG-2026-000105', 'download')}
                        className="inline-flex items-center gap-1 text-brand hover:underline font-medium text-[11.5px] cursor-pointer"
                      >
                        <Download className="size-3" />
                        <span>Download Sample QR PNG</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: Upload PDF */}
                {activeTab === 'pdf' && (
                  <div className="space-y-4">
                    {pdfDropError && (
                      <Alert tone="warning" title="PDF File Required">
                        {pdfDropError}
                      </Alert>
                    )}

                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Drag and drop official certificate PDF or click to browse"
                      onClick={() => {
                        if (!isVerifying) pdfInputRef.current?.click();
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && !isVerifying) {
                          e.preventDefault();
                          pdfInputRef.current?.click();
                        }
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isVerifying) setIsDraggingPdf(true);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'copy';
                        if (!isVerifying) setIsDraggingPdf(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setIsDraggingPdf(false);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDraggingPdf(false);
                        if (isVerifying) return;
                        const droppedFile = e.dataTransfer.files?.[0];
                        if (droppedFile) {
                          void processPdfFile(droppedFile);
                        }
                      }}
                      className={`rounded-lg border-2 border-dashed p-6 text-center space-y-3 transition-all cursor-pointer select-none ${
                        isDraggingPdf
                          ? 'border-brand bg-brand-muted/30 ring-2 ring-brand/20 scale-[1.01]'
                          : 'border-line-strong bg-sunken/40 hover:bg-sunken/70 hover:border-brand/60'
                      } ${isVerifying ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      <div
                        className={`size-11 mx-auto rounded-full border flex items-center justify-center shadow-card transition-transform ${
                          isDraggingPdf
                            ? 'bg-brand text-white border-brand scale-110'
                            : 'bg-surface border-line text-brand'
                        }`}
                      >
                        <Upload className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {isDraggingPdf
                            ? 'Drop Certificate PDF Here to Verify SHA-256'
                            : 'Drag & Drop Official Certificate PDF, or Click to Browse'}
                        </p>
                        <p className="text-xs text-muted mt-0.5 max-w-md mx-auto">
                          Your browser computes the 256-bit SHA-256 digest locally and compares it against the anchored smart contract hash.
                        </p>
                      </div>
                      {selectedPdfName && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 text-xs font-mono text-ink-2 bg-surface px-3 py-1.5 rounded-md border border-line shadow-2xs"
                        >
                          <FileText className="size-3.5 text-brand shrink-0" />
                          <span className="truncate max-w-[240px]">
                            {selectedPdfName}
                            {selectedPdfSize
                              ? ` (${(selectedPdfSize / 1024).toFixed(1)} KB)`
                              : ''}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="inline-flex items-center justify-center gap-2 h-9.5 px-4 rounded-md bg-brand text-white hover:bg-brand-hover text-sm font-medium shadow-card">
                          <FileText className="size-4" />
                          <span>
                            {isVerifying
                              ? 'Computing SHA-256 & Verifying...'
                              : 'Choose PDF Document'}
                          </span>
                        </span>
                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={handlePdfUpload}
                          disabled={isVerifying}
                          className="sr-only"
                        />
                      </div>
                    </div>

                    <div className="rounded-md bg-sunken/70 border border-line px-3.5 py-2.5 text-xs text-muted space-y-1">
                      <p className="font-semibold text-ink-2">Evaluator Demo Files (in repository `/demo`):</p>
                      <p className="font-mono text-[11px]">
                        &bull; demo/PUB-DEG-2026-000105.pdf (Authentic) &nbsp;&bull; demo/PUB-DEG-2026-000105-tampered.pdf (Altered)
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Live Verification Result Panel */}
          <div className="lg:col-span-6">
            {!result ? (
              <Card className="border-dashed">
                <CardBody className="py-12 px-6 text-center space-y-4">
                  <div className="size-12 mx-auto rounded-full bg-sunken border border-line flex items-center justify-center text-brand">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="font-serif text-lg font-semibold text-ink">
                      Awaiting Credential Query
                    </h3>
                    <p className="text-xs sm:text-[13.5px] text-muted leading-relaxed">
                      Enter a Certificate ID, scan a QR stamp, or upload a certificate PDF on the left. The cryptographic verification report, graduate metadata, and blockchain transaction anchor will appear here immediately.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <StatusBadge status="valid" label="Valid — Authentic" size="sm" />
                    <StatusBadge status="revoked" label="Revoked — Co-signed" size="sm" />
                    <StatusBadge status="tampered" label="Tampered — Hash Mismatch" size="sm" />
                    <StatusBadge status="invalid" label="Invalid" size="sm" />
                  </div>
                </CardBody>
              </Card>
            ) : (
              <Card className="overflow-hidden animate-rise-in" role="region" aria-live="polite" aria-label="Verification result">
                {/* Status Banner Header */}
                <div
                  className={`px-5 py-4 border-b flex items-start justify-between gap-4 ${
                    result.status === 'VALID'
                      ? 'bg-success-soft border-success-line'
                      : result.status === 'REVOKED'
                      ? 'bg-warning-soft border-warning-line'
                      : result.status === 'INVALID_MODIFIED' || result.status === 'NOT_FOUND'
                      ? 'bg-danger-soft border-danger-line'
                      : 'bg-sunken border-line'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 size-9 rounded-full flex items-center justify-center shrink-0 ${
                        result.status === 'VALID'
                          ? 'bg-success text-white'
                          : result.status === 'REVOKED'
                          ? 'bg-warning text-white'
                          : result.status === 'INVALID_MODIFIED' || result.status === 'NOT_FOUND'
                          ? 'bg-danger text-white'
                          : 'bg-ink-2 text-white'
                      }`}
                    >
                      {result.status === 'VALID' ? (
                        <ShieldCheck className="size-5" />
                      ) : result.status === 'REVOKED' ? (
                        <ShieldAlert className="size-5" />
                      ) : result.status === 'INVALID_MODIFIED' || result.status === 'NOT_FOUND' ? (
                        <AlertTriangle className="size-5" />
                      ) : result.status === 'ERROR' ? (
                        <CloudOff className="size-5" />
                      ) : (
                        <CircleHelp className="size-5" />
                      )}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={
                            result.status === 'VALID'
                              ? 'valid'
                              : result.status === 'REVOKED'
                              ? 'revoked'
                              : result.status === 'INVALID_MODIFIED'
                              ? 'tampered'
                              : result.status === 'ERROR'
                              ? 'unavailable'
                              : 'invalid'
                          }
                          label={result.status === 'NOT_FOUND' ? 'Invalid' : undefined}
                          size="sm"
                        />
                        <span className="font-mono text-xs text-ink-2 font-medium">
                          {result.id}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-ink mt-1">
                        {result.status === 'VALID'
                          ? 'Authentic University Credential'
                          : result.status === 'REVOKED'
                          ? 'Credential Officially Revoked'
                          : result.status === 'INVALID_MODIFIED'
                          ? 'Invalid Credential: Tampering Detected'
                          : result.status === 'ERROR'
                          ? 'Verification Service Unavailable'
                          : 'Invalid Credential'}
                      </h3>
                      <p className="text-xs text-ink-2 mt-0.5 leading-relaxed">
                        {result.status === 'VALID'
                          ? 'This credential matches the canonical SHA-256 fingerprint anchored on the blockchain ledger and is in good standing.'
                          : result.status === 'REVOKED'
                          ? 'This certificate was formally revoked with Controller of Examinations co-signature and is no longer valid.'
                          : result.status === 'INVALID_MODIFIED'
                          ? result.message
                          : result.message}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResult(null)}
                    leftIcon={<RotateCcw />}
                  >
                    Reset
                  </Button>
                </div>

                {/* Result Body */}
                <CardBody className="space-y-5">
                  {(result.status === 'VALID' || result.status === 'REVOKED') && (
                    <>
                      {result.status === 'REVOKED' && result.revocationReason && (
                        <Alert tone="danger" title="Official Revocation Justification">
                          <p>{result.revocationReason}</p>
                          {result.revocationDate && (
                            <p className="text-xs mt-1 font-mono">Revoked on: {result.revocationDate}</p>
                          )}
                        </Alert>
                      )}

                      <DescriptionList
                        columns={2}
                        items={[
                          {
                            term: 'Graduate Full Name',
                            value: <span className="font-semibold text-ink">{result.name}</span>,
                          },
                          {
                            term: 'Certificate ID',
                            value: <HashText value={result.id} head={14} tail={8} />,
                          },
                          {
                            term: 'Conferred Program',
                            value: <span className="font-medium">{result.degree}</span>,
                            full: true,
                          },
                          {
                            term: 'Academic Session & CGPA',
                            value: (
                              <span className="tabular">
                                {result.session || '—'} &middot;{' '}
                                <strong className="text-success">{result.cgpa || '—'} / 4.00</strong>
                              </span>
                            ),
                          },
                          {
                            term: 'Issuance Date',
                            value: result.issueDate || '—',
                          },
                        ]}
                      />

                      {/* Cryptographic Proof Box */}
                      <div className="rounded-md bg-sunken border border-line p-3.5 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">
                            On-Chain Cryptographic Anchor
                          </span>
                          {result.blockNumber && (
                            <span className="font-mono text-[11px] text-brand font-medium">
                              Block {result.blockNumber}
                            </span>
                          )}
                        </div>
                        {result.sha256Hash && (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-line">
                            <span className="text-muted shrink-0">SHA-256 Digest</span>
                            <HashText value={result.sha256Hash} head={14} tail={12} label="SHA-256 hash" />
                          </div>
                        )}
                        {result.txHash && (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-line">
                            <span className="text-muted shrink-0">Transaction Hash</span>
                            <HashText
                              value={result.txHash}
                              head={12}
                              tail={10}
                              href={explorerTxUrl(result.txHash, result.network || 'sepolia')}
                              label="transaction hash"
                            />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="pt-1 flex flex-wrap items-center gap-2.5">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Eye />}
                          onClick={() => setPreviewOpen(true)}
                        >
                          Inspect Certificate Preview
                        </Button>
                        <a
                          href={`/api/certificates/${encodeURIComponent(result.id)}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 h-8 px-3 text-[13px] font-medium rounded-md bg-surface text-ink border border-line-strong shadow-card hover:bg-sunken"
                        >
                          <Download className="size-3.5" />
                          <span>Download Official PDF</span>
                        </a>
                      </div>
                    </>
                  )}

                  {result.status === 'INVALID_MODIFIED' && (
                    <div className="space-y-4">
                      <Alert tone="danger" title="Cryptographic Digest Mismatch">
                        Even a 1-byte modification to student name, CGPA, or conferral date produces a completely different SHA-256 digest. Do not accept this file as authentic.
                      </Alert>

                      <div className="space-y-3 text-xs">
                        <div className="rounded-md bg-danger-soft/60 border border-danger-line p-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-danger block mb-1">
                            Uploaded PDF SHA-256 Digest (Altered File)
                          </span>
                          <code className="font-mono text-[11.5px] text-danger break-all select-all">
                            {result.computedHash || 'Mismatch'}
                          </code>
                        </div>

                        <div className="rounded-md bg-success-soft/60 border border-success-line p-3">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-success block mb-1">
                            Official On-Chain SHA-256 Digest ({result.id})
                          </span>
                          <code className="font-mono text-[11.5px] text-success break-all select-all">
                            {result.expectedHash || 'Anchored On-Chain Digest'}
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  {(result.status === 'NOT_FOUND' || result.status === 'ERROR') && (
                    <div className="space-y-3 text-xs text-muted">
                      {result.status === 'NOT_FOUND' && (
                        <Alert tone="danger" title="Invalid Credential — Verification Failed">
                          This document, QR code, or Certificate ID could not be authenticated against the Pundra University smart contract registry. Do not accept it as an official university credential.
                        </Alert>
                      )}
                      <div className="rounded-md bg-danger-soft/50 border border-danger-line p-3">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-danger block">
                          Queried Identifier / File (Invalid)
                        </span>
                        <code className="font-mono text-xs text-ink mt-1 block break-all">
                          {result.id}
                        </code>
                        {result.computedHash && (
                          <p className="font-mono text-[11px] text-danger mt-1 break-all">
                            Unverified SHA-256: {result.computedHash}
                          </p>
                        )}
                      </div>
                      <p>
                        Only unmodified PDFs and Certificate IDs (<code className="font-mono text-ink">PUB-DEG-YYYY-XXXXXX</code>) anchored by the Office of the Registrar are valid.
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Full Certificate Preview Modal */}
      <Dialog
        open={previewOpen && Boolean(result && (result.status === 'VALID' || result.status === 'REVOKED'))}
        onClose={() => setPreviewOpen(false)}
        size="xl"
        title={result ? `Certificate Specimen — ${result.id}` : 'Certificate Preview'}
        description="Official academic record rendered from verified ledger metadata."
        footer={
          result ? (
            <>
              <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
              <a
                href={`/api/certificates/${encodeURIComponent(result.id)}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-9.5 px-4 text-sm font-medium rounded-md bg-brand text-white hover:bg-brand-hover"
              >
                <Download className="size-4" />
                <span>Download Official PDF</span>
              </a>
            </>
          ) : undefined
        }
      >
        {result && (
          <CertificateDocumentPreview
            certificate={{
              id: result.id,
              type: result.type || 'Degree Certificate',
              studentName: result.name,
              studentId: result.studentId || 'Verified Graduate',
              program: result.program || result.degree,
              degreeName: result.degree,
              session: result.session || '—',
              cgpa: result.cgpa || '—',
              issueDate: result.issueDate || '—',
              sha256Hash: result.sha256Hash,
              txHash: result.txHash,
              blockNumber: result.numericBlock,
              status: result.status === 'REVOKED' ? 'revoked' : 'valid',
              revocationReason: result.revocationReason,
            }}
          />
        )}
      </Dialog>
    </section>
  );
};

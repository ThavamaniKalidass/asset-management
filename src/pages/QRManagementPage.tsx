import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Scan,
  Search,
  Download,
  Printer,
  CheckCircle,
  X,
  Camera,
  StopCircle,
  Monitor,
  Cpu,
  Keyboard,
  Mouse,
  Speaker,
  Phone,
  Headphones,
  HardDrive,
} from 'lucide-react';
import { assetsApi } from '@/lib/api';
import type { Asset } from '@/types';

type Tab = 'generate' | 'scan';

const assetTypeIcons: Record<string, React.FC<{ className?: string }>> = {
  Desk: HardDrive,
  Monitor,
  CPU: Cpu,
  'Thin Client': Monitor,
  Speaker: Speaker,
  Keyboard: Keyboard,
  Mouse: Mouse,
  'IP Phone': Phone,
  'RJ Headset': Headphones,
};

// Simple hash function to generate deterministic seed from string
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

// Draw a QR-like pattern on canvas based on desk number
function drawQRPattern(canvas: HTMLCanvasElement, deskNumber: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = canvas.width;
  const gridSize = 21; // QR-like grid
  const cellSize = size / (gridSize + 2); // padding
  const offset = cellSize;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const seed = hashString(deskNumber);

  // Simple PRNG
  let rng = seed;
  function nextBit(): number {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return (rng >> 16) & 1;
  }

  // Draw data cells
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Corner finder patterns (7x7 in three corners)
      const isTopLeft = row < 7 && col < 7;
      const isTopRight = row < 7 && col >= gridSize - 7;
      const isBottomLeft = row >= gridSize - 7 && col < 7;

      let fill = false;
      if (isTopLeft || isTopRight || isBottomLeft) {
        // Finder pattern: outer border, inner square
        const inOuter =
          row === 0 || row === 6 || col === 0 || col === 6;
        const inInner =
          row >= 2 && row <= 4 && col >= 2 && col <= 4;
        fill = inOuter || inInner;
      } else {
        // Skip timing pattern area (row 6, col 6)
        if (row === 6 || col === 6) {
          fill = (row + col) % 2 === 0;
        } else {
          fill = nextBit() === 1;
        }
      }

      ctx.fillStyle = fill ? '#1e293b' : '#ffffff';
      ctx.fillRect(
        offset + col * cellSize,
        offset + row * cellSize,
        cellSize,
        cellSize
      );
    }
  }

  // Draw small border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, size - 4, size - 4);
}

export default function QRManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [deskNumber, setDeskNumber] = useState('');
  const [generatedDesk, setGeneratedDesk] = useState('');
  const [deskAssets, setDeskAssets] = useState<Asset[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [deskSuggestions, setDeskSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingDesk, setLoadingDesk] = useState(false);

  // Scan state
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scannedDesk, setScannedDesk] = useState('');
  const [scannedAssets, setScannedAssets] = useState<Asset[]>([]);
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-scanner-viewfinder';

  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load all desk numbers for suggestions
  useEffect(() => {
    assetsApi.getDesks().then((desks) => {
      setDeskSuggestions(desks);
    });
  }, []);

  // Draw QR pattern when desk number changes in generate tab
  useEffect(() => {
    if (activeTab === 'generate' && generatedDesk && qrCanvasRef.current) {
      drawQRPattern(qrCanvasRef.current, generatedDesk);
    }
  }, [activeTab, generatedDesk]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [scanning]);

  const handleGenerate = useCallback(async () => {
    if (!deskNumber.trim()) return;
    setLoadingDesk(true);
    const desk = deskNumber.trim().toUpperCase();
    setGeneratedDesk(desk);
    setQrDataUrl(null);
    try {
      // Prefer backend-generated QR (scannable URL) and assets list
      const result = await assetsApi.getQR(desk);
      setQrDataUrl(result.qr_data_url || null);
      setDeskAssets(result.assets || []);
    } catch {
      // Fallback: fetch assets only
      try {
        const r = await assetsApi.getByDesk(desk);
        setDeskAssets(r.assets || []);
      } catch {
        setDeskAssets([]);
      }
    }
    setLoadingDesk(false);
    setShowSuggestions(false);
  }, [deskNumber]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.download = `QR-${generatedDesk || 'desk'}.png`;
    if (qrDataUrl) {
      link.href = qrDataUrl;
    } else if (qrCanvasRef.current) {
      link.href = qrCanvasRef.current.toDataURL('image/png');
    } else return;
    link.click();
  }, [generatedDesk]);

  const handlePrint = useCallback(() => {
    let dataUrl: string | null = null;
    if (qrDataUrl) dataUrl = qrDataUrl;
    else if (qrCanvasRef.current) dataUrl = qrCanvasRef.current.toDataURL('image/png');
    if (!dataUrl) return;
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head><title>QR Code - ${generatedDesk}</title></head>
          <body style="display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;">
            <div style="text-align:center;">
              <img src="${dataUrl}" style="width:300px;height:300px;" />
              <h2 style="font-family:sans-serif;color:#1e293b;">Desk: ${generatedDesk}</h2>
            </div>
          </body>
        </html>
      `);
      win.document.close();
      win.print();
    }
  }, [generatedDesk]);

  const handleSuggestionClick = useCallback((desk: string) => {
    setDeskNumber(desk);
    setShowSuggestions(false);
  }, []);

  // Scan QR
  const startScanning = useCallback(async () => {
    setScanError('');
    setScanSuccess(false);
    setScannedDesk('');
    setScannedAssets([]);

    try {
      const scanner = new Html5Qrcode(scannerDivId);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setScanError('No camera found on this device.');
        return;
      }

      setScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // On successful scan
          await scanner.stop();
          setScanning(false);
          setScanSuccess(true);

          // Extract desk number if the QR encodes a URL like /search?desk=DESK
          let desk = decodedText;
          try {
            const parsed = new URL(decodedText);
            const d = parsed.searchParams.get('desk');
            if (d) desk = d;
          } catch {
            // Not a URL, keep decodedText as-is
          }

          setScannedDesk(desk);

          // Fetch assets for scanned desk
          try {
            const result = await assetsApi.getByDesk(desk);
            setScannedAssets(result.assets);
          } catch {
            setScannedAssets([]);
          }
        },
        () => {
          // Scan failure - ignore, keep trying
        }
      );
    } catch (err: any) {
      setScanError(err.message || 'Failed to start camera.');
      setScanning(false);
    }
  }, []);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const clearScan = useCallback(() => {
    setScanSuccess(false);
    setScannedDesk('');
    setScannedAssets([]);
    setScanError('');
  }, []);

  const filteredSuggestions = deskSuggestions.filter(
    (d) => d.toLowerCase().includes(deskNumber.toLowerCase()) && d !== deskNumber
  );

  const AssetIcon = (type: string) => assetTypeIcons[type] || HardDrive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-1">QR Management</h1>
          <p className="text-caption mt-1">Generate and scan QR codes for desk assignments</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'generate' as Tab, label: 'Generate QR', icon: QrCode },
          { id: 'scan' as Tab, label: 'Scan QR', icon: Scan },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ==================== GENERATE QR TAB ==================== */}
        {activeTab === 'generate' && (
          <motion.div
            key="generate"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left Column: Input + QR Preview */}
            <div className="card-premium p-6 space-y-6">
              <h2 className="heading-3 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary-600" />
                Generate Desk QR Code
              </h2>

              {/* Desk Number Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Desk Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={deskNumber}
                    onChange={(e) => {
                      setDeskNumber(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerate();
                    }}
                    placeholder="e.g., D-101"
                    className="input-premium w-full pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute z-20 mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-elevated overflow-hidden"
                    >
                      {filteredSuggestions.slice(0, 5).map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button onClick={handleGenerate} className="btn-primary w-full">
                Generate QR Code
              </button>

              {/* QR Code Preview */}
              <AnimatePresence>
                {generatedDesk && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200"
                  >
                    <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
                      <canvas
                        ref={qrCanvasRef}
                        width={256}
                        height={256}
                        className="w-64 h-64"
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-600">
                      Desk: <span className="text-primary-700 font-semibold">{generatedDesk}</span>
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button onClick={handleDownload} className="btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Print
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Desk Assets */}
            <div className="card-premium p-6">
              <h2 className="heading-3 mb-4">Assets at Desk</h2>
              {loadingDesk ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="skeleton h-16 w-full rounded-xl" />
                  ))}
                </div>
              ) : generatedDesk && deskAssets.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-slate-500">
                    {deskAssets.length} asset{deskAssets.length !== 1 ? 's' : ''} assigned to{' '}
                    <span className="font-semibold text-slate-700">{generatedDesk}</span>
                  </p>
                  {deskAssets.map((asset, i) => {
                    const IconComp = AssetIcon(asset.asset_type);
                    return (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <IconComp className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{asset.asset_type}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {asset.brand} • {asset.model_number} • {asset.serial_number}
                          </p>
                        </div>
                        <span className="badge bg-slate-100 text-slate-600 text-xs">
                          {asset.serial_number}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : generatedDesk && deskAssets.length === 0 ? (
                <div className="text-center py-12">
                  <HardDrive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No assets found for this desk.</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">
                    Enter a desk number and generate QR to view assets.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ==================== SCAN QR TAB ==================== */}
        {activeTab === 'scan' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Left Column: Camera Viewfinder */}
            <div className="card-premium p-6 space-y-4">
              <h2 className="heading-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary-600" />
                Scan Desk QR Code
              </h2>

              {/* Viewfinder */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-black aspect-square">
                <div id={scannerDivId} className="w-full h-full" />
                {!scanning && !scanSuccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                    <Scan className="w-16 h-16 text-white/60 mb-4" />
                    <p className="text-white/80 text-sm">Camera preview will appear here</p>
                  </div>
                )}
                {scanning && (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 border-4 border-primary-400 rounded-2xl pointer-events-none"
                  />
                )}
                {scanSuccess && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                    >
                      <CheckCircle className="w-20 h-20 text-emerald-500" />
                    </motion.div>
                  </motion.div>
                )}
              </div>

              {/* Scan error */}
              {scanError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  <X className="w-4 h-4 flex-shrink-0" />
                  {scanError}
                </div>
              )}

              {/* Scan Controls */}
              <div className="flex gap-3">
                {!scanning && !scanSuccess && (
                  <button onClick={startScanning} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                    <Camera className="w-4 h-4" />
                    Start Scanning
                  </button>
                )}
                {scanning && (
                  <button onClick={stopScanning} className="btn-danger flex items-center gap-2 flex-1 justify-center">
                    <StopCircle className="w-4 h-4" />
                    Stop Scanning
                  </button>
                )}
                {scanSuccess && (
                  <button onClick={clearScan} className="btn-secondary flex items-center gap-2 flex-1 justify-center">
                    <Scan className="w-4 h-4" />
                    Scan Again
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Scan Results */}
            <div className="card-premium p-6">
              <h2 className="heading-3 mb-4">Scan Results</h2>
              <AnimatePresence>
                {scanSuccess && scannedDesk ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                    >
                      <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800">QR Code Scanned Successfully</p>
                        <p className="text-xs text-emerald-600">
                          Desk: <span className="font-semibold">{scannedDesk}</span>
                        </p>
                      </div>
                    </motion.div>

                    {scannedAssets.length > 0 ? (
                      <>
                        <p className="text-sm text-slate-500">
                          {scannedAssets.length} asset{scannedAssets.length !== 1 ? 's' : ''} assigned to{' '}
                          <span className="font-semibold text-slate-700">{scannedDesk}</span>
                        </p>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {scannedAssets.map((asset, i) => {
                            const IconComp = AssetIcon(asset.asset_type);
                            return (
                              <motion.div
                                key={asset.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.06 }}
                                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                                  <IconComp className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800">{asset.asset_type}</p>
                                  <p className="text-xs text-slate-400 truncate">
                                    {asset.brand} • {asset.model_number} • {asset.serial_number}
                                  </p>
                                </div>
                                <span className="badge bg-slate-100 text-slate-600 text-xs">
                                  {asset.serial_number}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center py-12"
                      >
                        <HardDrive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">
                          No assets found for desk <span className="font-semibold">{scannedDesk}</span>.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-12">
                    <Scan className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      Scan a QR code to view assets assigned to that desk.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
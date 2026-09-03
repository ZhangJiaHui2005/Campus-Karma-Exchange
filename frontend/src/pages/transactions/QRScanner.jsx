import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { verifyQR } from "../../services/transactionService";
import {
  Camera,
  CheckCircle2,
  XCircle,
  Zap,
  ScanLine,
  RefreshCw,
} from "lucide-react";

export default function QRScanner({ transaction, onSuccess }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { success, message, data }
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);

  const startScanner = async () => {
    if (scanning) return;
    setResult(null);

    try {
      const html5QrCode = new Html5Qrcode("qr-reader-container");
      qrRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          // Dừng scanner ngay khi quét được
          await html5QrCode.stop();
          setScanning(false);
          await handleVerify(decodedText);
        },
        () => {} // frame error
      );
      setScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setResult({ success: false, message: "Không thể mở camera: " + err.message });
    }
  };

  const stopScanner = async () => {
    if (qrRef.current) {
      try { await qrRef.current.stop(); } catch {}
      qrRef.current = null;
    }
    setScanning(false);
  };

  const handleVerify = async (token) => {
    setLoading(true);
    try {
      const res = await verifyQR(transaction.trans_id, token);
      setResult({ success: true, message: res.message, data: res.data });
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Cleanup khi unmount
  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  const reset = () => {
    setResult(null);
    setScanning(false);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Info card */}
      <div className="w-full bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-400" />
          <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
            {transaction.karma_amount} Karma sẽ được chuyển cho người cho mượn
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Nhờ{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            {transaction.lender?.full_name}
          </strong>{" "}
          mở QR trên ứng dụng rồi dùng camera này quét
        </p>
      </div>

      {/* Kết quả */}
      {result && (
        <div
          className={`w-full rounded-xl p-5 flex flex-col items-center gap-3 text-center border-2 ${
            result.success
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400"
              : "bg-red-50 dark:bg-red-900/20 border-red-400"
          }`}
        >
          {result.success ? (
            <>
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              <p className="font-bold text-emerald-800 dark:text-emerald-200 text-base">
                🎉 Giao nhận thành công!
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {result.message}
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-14 h-14 text-red-500" />
              <p className="font-bold text-red-800 dark:text-red-200 text-base">
                Xác thực thất bại
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                {result.message}
              </p>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4" /> Thử lại
              </button>
            </>
          )}
        </div>
      )}

      {/* Camera viewfinder */}
      {!result && (
        <>
          <div className="relative w-72 h-72 bg-black rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
            <div id="qr-reader-container" className="w-full h-full" ref={scannerRef} />
            {!scanning && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900/90">
                <Camera className="w-12 h-12 text-gray-400" />
                <p className="text-gray-300 text-sm font-medium">Camera chưa bật</p>
              </div>
            )}
            {/* Corner overlay */}
            {scanning && (
              <>
                <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />
              </>
            )}
          </div>

          <div className="flex gap-3">
            {!scanning ? (
              <button
                onClick={startScanner}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-lg shadow-emerald-200 dark:shadow-none"
              >
                <ScanLine className="w-5 h-5" />
                {loading ? "Đang xử lý..." : "Bật camera quét QR"}
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-all"
              >
                <XCircle className="w-5 h-5" />
                Dừng camera
              </button>
            )}
          </div>

          <p className="text-xs text-center text-gray-400 max-w-xs">
            Đặt camera đối diện mã QR của người cho mượn — hệ thống sẽ tự nhận diện
          </p>
        </>
      )}
    </div>
  );
}

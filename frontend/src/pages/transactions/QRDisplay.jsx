import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { getQRCode } from "../../services/transactionService";
import { RefreshCw, Clock, ShieldCheck, AlertCircle } from "lucide-react";

export default function QRDisplay({ transaction }) {
  const canvasRef = useRef(null);
  const [token, setToken] = useState(null);
  const [expiresIn, setExpiresIn] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  const fetchQR = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getQRCode(transaction.trans_id);
      setToken(res.data.token);
      setExpiresIn(res.data.expires_in || 60);

      // Render QR lên canvas
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, res.data.token, {
          width: 240,
          margin: 2,
          color: {
            dark: "#065f46", // màu emerald đậm
            light: "#ffffff",
          },
        });
      }
    } catch (err) {
      setError(err.message || "Không thể tải mã QR");
    } finally {
      setLoading(false);
    }
  };

  // Tự động load QR lần đầu
  useEffect(() => {
    fetchQR();
    return () => clearInterval(timerRef.current);
  }, [transaction.trans_id]);

  // Đếm ngược 60s
  useEffect(() => {
    if (!token) return;
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          fetchQR(); // Tự động làm mới khi hết hạn
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [token]);

  // Vẽ lại canvas khi token thay đổi
  useEffect(() => {
    if (token && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, token, {
        width: 240,
        margin: 2,
        color: { dark: "#065f46", light: "#ffffff" },
      });
    }
  }, [token]);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const progress = (expiresIn / 60) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div className="text-center">
        <h3 className="font-bold text-gray-900 dark:text-white text-base">
          Mã QR Bàn Giao Vật Phẩm
        </h3>
        <p className="text-xs text-gray-500 mt-1 max-w-xs">
          Đưa mã này cho{" "}
          <strong className="text-gray-700 dark:text-gray-300">
            {transaction.borrower?.full_name}
          </strong>{" "}
          quét khi gặp mặt trực tiếp để xác nhận giao đồ
        </p>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchQR}
            className="ml-auto underline font-semibold text-xs"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="relative p-4 bg-white dark:bg-gray-700 rounded-2xl shadow-md border-2 border-emerald-500/30 flex flex-col items-center">
          <canvas ref={canvasRef} className="rounded-lg" />
          {loading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-700/80 rounded-2xl flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Countdown timer */}
      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${
                expiresIn <= 10
                  ? "text-red-500"
                  : expiresIn <= 20
                  ? "text-yellow-500"
                  : "text-emerald-500"
              }`}
            />
          </svg>
          <span className="absolute text-xs font-bold text-gray-700 dark:text-gray-300">
            {expiresIn}
          </span>
        </div>
        <div className="flex flex-col text-xs text-gray-500">
          <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            Mã tự làm mới
          </span>
          <span>Tự động cập nhật sau {expiresIn}s</span>
        </div>
        <button
          onClick={fetchQR}
          disabled={loading}
          title="Làm mới ngay"
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors ml-1 text-gray-500 hover:text-emerald-600"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>Bảo mật HMAC-SHA256 • Chống chia sẻ từ xa</span>
      </div>
    </div>
  );
}

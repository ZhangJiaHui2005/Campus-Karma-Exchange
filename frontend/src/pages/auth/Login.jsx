import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Spinner } from "flowbite-react";
import { GoogleLogin } from "@react-oauth/google";
import { ShieldAlert, Sparkles, Recycle } from "lucide-react";
import { googleLogin } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await googleLogin(credentialResponse.credential);
      setUser(data.user);

      navigate("/");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-emerald-100 dark:border-gray-800">
        {/* Header / Logo Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-1">
            <Recycle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Campus Karma Exchange
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sàn chia sẻ & mượn đồ dùng sinh viên bằng điểm tín nhiệm
          </p>
        </div>

        {/* Thông báo thưởng Karma khởi tạo */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-start gap-3 text-emerald-800 dark:text-emerald-200 text-xs">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            Tài khoản mới xác thực thành công qua Email Trường sẽ nhận ngay{" "}
            <strong>100 Karma</strong> khởi tạo!
          </span>
        </div>

        {errorMessage && (
          <Alert color="failure" icon={ShieldAlert} className="text-xs">
            <span>{errorMessage}</span>
          </Alert>
        )}

        <div className="flex flex-col items-center justify-center pt-2 pb-1 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 py-3">
              <Spinner size="sm" color="success" />
              <span>Đang xác thực tài khoản sinh viên...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() =>
                  setErrorMessage("Đã xảy ra lỗi khi kết nối với Google.")
                }
                hosted_domain=".edu.vn"
                theme="outline"
                shape="pill"
                size="large"
                locale="vi"
              />
            </div>
          )}
        </div>

        {/* Footer ghi chú quy định */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Hệ thống chỉ chấp nhận tài khoản Google thuộc domain <br />
            <code className="text-emerald-600 dark:text-emerald-400 font-semibold">
              .edu.vn
            </code>
          </p>
        </div>
      </Card>
    </div>
  );
}

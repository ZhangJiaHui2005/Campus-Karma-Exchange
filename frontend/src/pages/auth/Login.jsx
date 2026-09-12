import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Alert, Badge, Card, Spinner, ThemeProvider } from "flowbite-react";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Leaf,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { googleLogin } from "../../services/authService";
import { userTheme } from "../../theme/userTheme";

const benefits = [
  { icon: GraduationCap, title: "Cộng đồng sinh viên", detail: "Tài khoản trường học được xác thực." },
  { icon: ShieldCheck, title: "Trao đổi an tâm", detail: "Ký quỹ Karma và xác nhận bằng QR." },
  { icon: Leaf, title: "Tiêu dùng bền vững", detail: "Kéo dài vòng đời của mỗi vật dụng." },
];

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
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={userTheme}>
      <main className="user-auth min-h-screen bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6 lg:p-8">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/8 lg:grid-cols-[1.08fr_0.92fr] dark:border-slate-700 dark:bg-slate-900">
          <section className="editorial-grid relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute right-0 top-0 h-72 w-72 translate-x-1/3 -translate-y-1/3 rounded-full border-[48px] border-emerald-400/10" />
            <Link to="/" className="relative inline-flex w-fit items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white">
                <img src="/logo.png" alt="" className="h-10 w-10 object-contain" />
              </span>
              <span>
                <span className="font-display block text-2xl font-semibold">Campus Karma</span>
                <span className="block text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">Exchange</span>
              </span>
            </Link>

            <div className="relative max-w-xl py-16">
              <Badge color="warning" className="mb-6 w-fit">Dành riêng cho sinh viên</Badge>
              <h1 className="font-display text-5xl font-semibold leading-[1.04] sm:text-6xl">
                Một món đồ cũ.<br />
                <span className="text-emerald-400">Một vòng đời mới.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                Chia sẻ, cho mượn và trao đổi vật dụng ngay trong khuôn viên trường bằng điểm tín nhiệm Karma.
              </p>
            </div>

            <div className="relative grid gap-4 sm:grid-cols-3">
              {benefits.map(({ icon: Icon, title, detail }) => (
                <div key={title} className="border-l border-white/15 pl-4">
                  <Icon className="mb-3 h-5 w-5 text-emerald-400" aria-hidden="true" />
                  <p className="text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
            <Card className="w-full max-w-md border-0 shadow-none dark:bg-transparent">
              <div className="lg:hidden">
                <Link to="/" className="inline-flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 dark:bg-white">
                    <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
                  </span>
                  <span className="font-display text-xl font-semibold">Campus Karma</span>
                </Link>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">Chào mừng trở lại</p>
                <h2 className="mt-3 font-display text-4xl font-semibold text-slate-950 dark:text-white">Đăng nhập để tiếp tục</h2>
                <p className="mt-3 leading-6 text-slate-500 dark:text-slate-400">
                  Sử dụng email trường để tham gia cộng đồng trao đổi đáng tin cậy.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/30">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-emerald-950 dark:text-emerald-200">Tặng 100 Karma khởi đầu</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800 dark:text-emerald-300">
                      Áp dụng ngay khi tài khoản email sinh viên được xác thực.
                    </p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <Alert color="failure" icon={ShieldAlert} role="alert">
                  {errorMessage}
                </Alert>
              )}

              <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                {loading ? (
                  <div className="flex min-h-12 items-center justify-center gap-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <Spinner size="sm" />
                    Đang xác thực tài khoản...
                  </div>
                ) : (
                  <div className="flex min-h-12 justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setErrorMessage("Không thể kết nối với Google. Vui lòng thử lại.")}
                      hosted_domain=".edu.vn"
                      theme="outline"
                      shape="pill"
                      size="large"
                      text="continue_with"
                      locale="vi"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                Chúng tôi chỉ dùng thông tin Google để xác thực danh tính và bảo vệ cộng đồng.
              </div>

              <Link to="/about" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-300">
                Tìm hiểu về Campus Karma <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Card>
          </section>
        </div>
      </main>
    </ThemeProvider>
  );
}

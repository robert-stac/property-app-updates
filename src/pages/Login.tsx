import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, ShieldAlert, Eye, EyeOff, Zap } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, loginWithGoogle, bypassLoginDev } = useAuth();

  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      window.location.href = "/"; 
    } catch (err: any) {
      console.error("Login Error:", err);
      const errMsg = String(err?.message || "");
      if (errMsg.includes("referer") || errMsg.includes("blocked") || err?.code === "auth/requests-from-referer-are-blocked") {
        setError("Firebase API Key blocked 'http://localhost:5173/'. Click 'Quick Dev Bypass' below to enter locally.");
      } else {
        setError("Invalid credentials. Please use your registered email and password.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await loginWithGoogle();
      window.location.href = "/";
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      const errMsg = String(err?.message || "");
      if (err?.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (err?.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups.");
      } else if (errMsg.includes("referer") || errMsg.includes("blocked")) {
        setError("Firebase API Key blocked 'http://localhost:5173/'. Click 'Quick Dev Bypass' below to enter locally.");
      } else {
        setError(err?.message || "Google Sign-In failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 px-4 py-8">
      <div className="max-w-sm w-full bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-blue-100">
        
        {/* Header / Logo */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-900 rounded-xl flex items-center justify-center overflow-hidden mb-3 shadow-md ring-2 ring-blue-100">
            <img 
              src="/pwa-512x512.png" 
              alt="Buwembo & Co. Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Buwembo & Co. Advocates
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Property Management System
          </p>
        </div>

        {/* Form */}
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-medium">
              <ShieldAlert size={15} className="shrink-0 text-red-500" /> 
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-800"
                placeholder="name@firm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-slate-800 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-xl text-white bg-blue-900 hover:bg-blue-800 focus:outline-none shadow-md transition-all active:scale-[0.99]"
          >
            <LogIn size={16} />
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-[11px]">
            <span className="bg-white px-3 text-slate-400 font-medium">Or</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.99]"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              className="w-4 h-4" 
              alt="Google" 
            />
            Sign in with Google
          </button>

          {isLocalhost && (
            <button
              onClick={() => bypassLoginDev()}
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.99]"
            >
              <Zap size={15} />
              Quick Dev Bypass
            </button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 font-medium text-center mt-5">
          Authorized Staff Only
        </p>
      </div>
    </div>
  );
};

export default Login;
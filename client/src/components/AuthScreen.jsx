import React, { useState, useEffect } from "react";
import axios from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiLock, FiShield, FiMail } from "react-icons/fi";
import image from "../assets/image.jpg";

const saveAuthData = (data) => {
  localStorage.setItem("userInfo", JSON.stringify(data));
  window.location.reload();
};

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ⭐ OTP STATES
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingSignup, setPendingSignup] = useState(null);

  /* ================= GOOGLE LOGIN ================= */
  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("google-btn"),
      { theme: "outline", size: "large", width: "100%" }
    );
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      const res = await axios.post("/api/auth/google-login", {
        token: response.credential,
      });
      saveAuthData(res.data);
    } catch {
      setMessage("error:Google login failed");
    }
  };

  /* ================= LOGIN + SIGNUP ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // ⭐ LOGIN FLOW (UNCHANGED)
      if (isLogin) {
        const res = await axios.post("/api/auth/login", {
          username,
          password,
        });
        saveAuthData(res.data);
        return;
      }

      // ⭐ SIGNUP FLOW → SEND OTP FIRST
      await axios.post("/api/auth/send-otp", { email });

      setPendingSignup({ username, password, email });
      setShowOtpModal(true);
      setMessage("success:OTP sent to email");

    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Authentication failed.";
      setMessage(`error:${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */
const handleVerifyOtp = async () => {
    try {
        setLoading(true);
        setMessage("");

        // 1. Verify the OTP first
        await axios.post("/api/auth/verify-otp", {
            email: pendingSignup.email,
            otp: otp, 
        });

        // 2. If verification passes, trigger the updated register route
        // This will now UPDATE the existing record instead of creating a duplicate
        const res = await axios.post("/api/auth/register", {
            username: pendingSignup.username,
            password: pendingSignup.password,
            email: pendingSignup.email
        });

        saveAuthData(res.data);
    } catch (error) {
        const msg = error.response?.data?.message || "Invalid OTP or Verification Failed";
        setMessage(`error:${msg}`);
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      {/* BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border grid md:grid-cols-2 overflow-hidden min-h-[650px]"
      >
        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 text-indigo-400">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
                <FiShield size={24} />
              </div>
              <span className="text-xl font-black uppercase text-white">
                Placement Hub
              </span>
            </div>

            <h1 className="text-4xl font-extrabold mb-4">
              {isLogin
                ? "Elevate your career journey."
                : "Begin your path to success."}
            </h1>
          </div>

          <motion.div className="relative z-10 mt-8">
            <img src={image} alt="illustration" className="rounded-3xl" />
          </motion.div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col justify-center p-8 lg:p-16 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input
                    type="email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2"/>
                <input
                  value={username}
                  onChange={(e)=>setUsername(e.target.value)}
                  required
                  className="w-full pl-12 py-4 bg-slate-50 border rounded-2xl"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2"/>
                <input
                  type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                  className="w-full pl-12 py-4 bg-slate-50 border rounded-2xl"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold"
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Get Started"}
            </button>

            <div id="google-btn" className="mt-4"></div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold"
                >
                  {message.split(":")[1]}
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <button
            onClick={()=>{setIsLogin(!isLogin);setMessage("");}}
            className="mt-6 text-indigo-600 font-black uppercase text-xs"
          >
            {isLogin ? "Create your account" : "Sign into existing"}
          </button>
        </div>
      </motion.div>

      {/* ⭐ OTP MODAL */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            exit={{opacity:0}}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{scale:0.9}}
              animate={{scale:1}}
              exit={{scale:0.9}}
              className="bg-white rounded-3xl p-8 w-[90%] max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-black mb-4">
                Verify OTP
              </h3>

              <input
                value={otp}
                onChange={(e)=>setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full px-4 py-3 border rounded-xl mb-4"
              />

              <button
                onClick={handleVerifyOtp}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold"
              >
                Verify & Create Account
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthScreen;
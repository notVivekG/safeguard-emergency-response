import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import GoogleLoginButton from '../components/GoogleLoginButton';

const PasswordEyeToggle = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
  >
    {show ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

const Login = () => {
  useEffect(() => { document.title = 'Login — SafeGuard'; }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOTP, setForgotOTP] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const sendOTP = async () => {
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      if (res.data.otp) {
        setForgotMsg(`Dev mode — your OTP is: ${res.data.otp}`);
      } else {
        setForgotMsg('OTP sent to your email');
      }
      setForgotStep(2);
    } catch (err) {
      setForgotMsg(err.response?.data?.message || 'Failed to send OTP');
    }
    setForgotLoading(false);
  };

  const verifyOTP = () => {
    if (forgotOTP.length === 6) {
      setForgotStep(3);
      setForgotMsg('');
    } else {
      setForgotMsg('Enter a valid 6-digit OTP');
    }
  };

  const doReset = async () => {
    setForgotLoading(true);
    setForgotMsg('');
    try {
      await api.post('/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOTP,
        newPassword: forgotPassword
      });
      setForgotMsg('Password reset! You can now login.');
      setTimeout(() => {
        setForgotOpen(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOTP('');
        setForgotPassword('');
        setForgotMsg('');
      }, 2000);
    } catch (err) {
      setForgotMsg(err.response?.data?.message || 'Reset failed');
    }
    setForgotLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy-light w-full max-w-md rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-navy dark:text-white">Welcome Back</h2>
          <p className="text-gray-500 mt-1">Sign in to your SafeGuard account</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" placeholder="you@example.com" />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-primary hover:text-primary-dark"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                placeholder="••••••••"
              />
              <PasswordEyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-70 mt-6">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <GoogleLoginButton />

        <p className="text-center text-sm text-gray-500 mt-8">
          Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Sign up</Link>
        </p>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {forgotStep === 1 && 'Forgot Password'}
              {forgotStep === 2 && 'Enter OTP'}
              {forgotStep === 3 && 'New Password'}
            </h2>
            {forgotMsg && (
              <p className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg px-3 py-2 mb-4">{forgotMsg}</p>
            )}
            {forgotStep === 1 && (
              <>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button onClick={sendOTP} disabled={forgotLoading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </>
            )}
            {forgotStep === 2 && (
              <>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  value={forgotOTP}
                  onChange={e => setForgotOTP(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 tracking-widest text-center text-xl"
                />
                <button onClick={verifyOTP}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700">
                  Verify OTP
                </button>
              </>
            )}
            {forgotStep === 3 && (
              <>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={forgotPassword}
                  onChange={e => setForgotPassword(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-3 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button onClick={doReset} disabled={forgotLoading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
            <button onClick={() => { setForgotOpen(false); setForgotStep(1); setForgotMsg(''); }}
              className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

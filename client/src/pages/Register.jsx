import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import PageWrapper from '../components/PageWrapper';

const PasswordEyeToggle = ({ show, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-2 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center text-gray-400 hover:text-gray-600"
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

const Register = () => {
  useEffect(() => { document.title = 'Register — SafeGuard'; }, []);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(formData.password !== formData.confirmPassword) {
        return setError("Passwords do not match");
    }
    setError('');
    setLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password, phone: formData.phone });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper className="flex min-h-[calc(100vh-64px)] items-center justify-center overflow-x-hidden px-4 py-6 sm:p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl dark:border-gray-800 dark:bg-navy-light sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-navy dark:text-white">Create Account</h2>
          <p className="text-gray-500 mt-1">Join the SafeGuard community</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full min-h-[44px] rounded-lg border border-gray-300 bg-transparent px-3 py-3 outline-none focus:border-primary dark:border-gray-600 dark:text-white" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full min-h-[44px] rounded-lg border border-gray-300 bg-transparent px-3 py-3 outline-none focus:border-primary dark:border-gray-600 dark:text-white" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
            <input type="tel" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full min-h-[44px] rounded-lg border border-gray-300 bg-transparent px-3 py-3 outline-none focus:border-primary dark:border-gray-600 dark:text-white" placeholder="+1 234 567 8900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e=>setFormData({...formData, password: e.target.value})}
                className="w-full min-h-[44px] rounded-lg border border-gray-300 bg-transparent px-3 py-3 pr-12 outline-none focus:border-primary dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
              />
              <PasswordEyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={e=>setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full min-h-[44px] rounded-lg border border-gray-300 bg-transparent px-3 py-3 pr-12 outline-none focus:border-primary dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
              />
              <PasswordEyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="mt-6 w-full min-h-[44px] rounded-lg bg-primary px-4 py-3 font-bold text-white transition-colors hover:bg-primary-dark disabled:opacity-70">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <GoogleLoginButton />

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </PageWrapper>
  );
};

export default Register;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from './translationContext';
import axios from 'axios';
import gsap from 'gsap';
import LanguageSw from './components/ui/LanguageSwitcher';

export default function Login() {
  const [step, setStep] = useState<'aadhar' | 'otp'>('aadhar');
  const [aadharNumber, setAadharNumber] = useState('');
  const [role, setRole] = useState('user'); // New state for role
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const { t } = useTranslation();
  const navigate = useNavigate();

  // GSAP animations
  useEffect(() => {
    gsap.fromTo('.login-container', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleAadharSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aadharNumber.length !== 12 || !/^\d+$/.test(aadharNumber)) {
      setError(t('invalidAadhar'));
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:4000/api/auth/request-otp', {
        adharNumber: aadharNumber,
        role: role // Send selected role to backend
      }, { withCredentials: true, headers: { 'Content-Type': "application/json" } });
      
      setSuccess(t('otpSent'));
      setStep('otp');
      setCountdown(60);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError(t('aadharNotFound'));
      } else {
        setError(t('somethingWentWrong'));
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError(t('invalidOtp'));
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:4000/api/auth/verify-otp', {
        adharNumber: aadharNumber,
        otp: otp,
        role: role 
      }, { withCredentials: true });
      console.log(role);
      setSuccess(t('loginSuccess'));
      localStorage.setItem('category', response.data.category);
      
      setTimeout(() => {
        console.log(role)
        if(role == "user"){
          navigate('/')
        }else if (role === "lineman"){
          navigate("/linemanall")
        }else if(role === "JE"){
          navigate("/jeall")
        }else if(role === "AEE"){
          navigate("/AeeAll")
        }
        
      
      }, 2000);
    } catch (err: any) {
      console.log(err)
      if (err.response?.status === 401) {
        setError(t('invalidOtp'));
      } else {
        setError(t('somethingWentWrong'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:4000/api/auth/request-otp', {
        adharNumber: aadharNumber,
        role: role
      }, { withCredentials: true });
      
      setSuccess(t('otpSent'));
      setCountdown(60);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(t('somethingWentWrong'));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAadhar = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return cleaned;
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 12) setAadharNumber(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <LanguageSw />
      <div className="login-container w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0a3d91] mb-2">KARTHVY</h1>
          <p className="text-gray-600">{t('loginSubtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 'aadhar' ? (
            <form onSubmit={handleAadharSubmit} className="space-y-6">
              <div>
                <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-2">{t('aadharNumber')}</label>
                <input
                  type="text"
                  id="aadhar"
                  value={formatAadhar(aadharNumber)}
                  onChange={handleAadharChange}
                  placeholder={t('aadharPlaceholder')}
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3d91] focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                  maxLength={14}
                  disabled={isLoading}
                />
              </div>

              {/* Role dropdown */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">Select Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3d91] focus:border-transparent transition-all duration-200 text-black"
                  disabled={isLoading}
                >
                  <option value="user">User</option>
                  <option value="lineman">Lineman</option>
                  <option value="JE">JE</option>
                  <option value="AEE">AEE</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || aadharNumber.length !== 12}
                className="w-full bg-[#0a3d91] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0a2d6b] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  t('requestOtp')
                )}
              </button>
            </form>
          ) : (
            // OTP step remains the same
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('otpTitle')}</h2>
                <p className="text-gray-600 text-sm">{t('otpSubtitle')}</p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) setOtp(value);
                  }}
                  placeholder={t('otpPlaceholder')}
                  className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a3d91] focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-red-600 text-sm">{error}</p></div>}
              {success && <div className="bg-green-50 border border-green-200 rounded-lg p-3"><p className="text-green-600 text-sm">{success}</p></div>}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-[#0a3d91] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0a2d6b] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    t('verifyOtp')
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `${t('resendOtp')} (${countdown}s)` : t('resendOtp')}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('aadhar');
                    setOtp('');
                    setError('');
                    setSuccess('');
                    setCountdown(0);
                  }}
                  className="w-full text-[#0a3d91] py-2 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
                >
                  ← Back to Aadhar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

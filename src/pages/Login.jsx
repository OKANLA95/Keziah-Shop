// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import '../styles/main.css';
import LoginHeader from '../components/LoginHeader';
import LoginForm from '../components/LoginForm';
import LoginFooter from '../components/LoginFooter';

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, enableNetwork, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navigateToDashboard = (role) => {
    const path = {
      Manager: '/dashboard/manager',
      Sales: '/dashboard/sales',
      Finance: '/dashboard/finance',
    }[role] || '/dashboard';
    navigate(path);
  };

  const fetchUserRoleAndNavigate = async (user) => {
    await enableNetwork(db);
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || !userSnap.data().role) {
      alert('No user role assigned. Please contact admin.');
      return;
    }
    navigateToDashboard(userSnap.data().role);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserRoleAndNavigate(user);
    } catch (error) {
      alert(`Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return alert('Please enter your email first.');
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          role: 'Sales',
        });
        navigateToDashboard('Sales');
      } else {
        navigateToDashboard(userSnap.data().role || 'Sales');
      }
    } catch (error) {
      alert(`Google Sign-In failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          alert('reCAPTCHA expired. Please try again.');
        },
      });
    }
  };

  const handleSendOtp = async () => {
    if (!phone) return alert('Enter a valid phone number');
    try {
      setUpRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      setIsOtpSent(true);
      alert('OTP sent!');
    } catch (error) {
      alert(`OTP Error: ${error.message}`);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) return alert('Enter OTP');
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          phone: user.phoneNumber,
          role: 'Sales',
        });
        navigateToDashboard('Sales');
      } else {
        navigateToDashboard(userSnap.data().role || 'Sales');
      }
    } catch (error) {
      alert(`OTP Verification failed: ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <LoginHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <main className="login-main">
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          phone={phone}
          setPhone={setPhone}
          otp={otp}
          setOtp={setOtp}
          isOtpSent={isOtpSent}
          handleSendOtp={handleSendOtp}
          handleVerifyOtp={handleVerifyOtp}
          handleForgotPassword={handleForgotPassword}
          handleLogin={handleLogin}
          handleGoogleSignIn={handleGoogleSignIn}
          loading={loading}
        />
      </main>
      <LoginFooter />
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import LoginFooter from '../components/LoginFooter';
import Header from '../components/LoginHeader';
import Footer from '../components/Footer';
import {
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [signupMethod, setSignupMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Sales');
  const [loading, setLoading] = useState(false);

  const [shopName, setShopName] = useState('');
  const [shopLocation, setShopLocation] = useState('');
  const [shopContact, setShopContact] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (signupMethod === 'phone' && !window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: () => {},
            'expired-callback': () => {
              if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
              }
            },
          }
        );
      } catch (error) {
        console.error('RecaptchaVerifier init failed:', error);
      }
    }
  }, [signupMethod]);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return false;
    }
    return true;
  };

  const checkIfUniqueRole = async (role) => {
    if (role === 'Manager' || role === 'Finance') {
      const existingQuery = query(collection(db, 'users'), where('role', '==', role));
      const snapshot = await getDocs(existingQuery);
      if (!snapshot.empty) {
        throw new Error(`${role} account already exists.`);
      }
    }
  };

  const createUserDoc = async (uid, data) => {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      createdAt: serverTimestamp(),
    });
  };

  const handlePhoneSignup = async () => {
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      alert('OTP sent! Please enter it to verify.');
    } catch (error) {
      console.error('Phone signup error:', error);
      alert('Phone signup failed: ' + error.message);
    }
  };

  const verifyOtpAndRegister = async () => {
    try {
      if (!validatePasswords()) return;
      const result = await confirmationResult.confirm(otp);
      const { uid } = result.user;

      await checkIfUniqueRole(role);

      await createUserDoc(uid, {
        phoneNumber,
        fullName,
        role,
        ...(role === 'Manager' || role === 'Finance' ? {
          shopName,
          shopLocation,
          shopContact,
        } : {}),
      });

      alert('✅ Signup successful!');
      navigate('/login');
    } catch (error) {
      console.error('OTP Verification Error:', error);
      alert('OTP verification failed: ' + error.message);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      await checkIfUniqueRole(role);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;

      await createUserDoc(uid, {
        email: email.toLowerCase(),
        fullName,
        role,
        ...(role === 'Manager' || role === 'Finance' ? {
          shopName,
          shopLocation,
          shopContact,
        } : {}),
      });

      alert('✅ Signup successful!');
      navigate('/login');
    } catch (error) {
      console.error('Signup Error:', error);
      alert('Signup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="signup-form-wrapper">
        <h2 className="form-title">Create Your Account</h2>

        <div className="form-toggle">
          <label>
            <input
              type="radio"
              value="email"
              checked={signupMethod === 'email'}
              onChange={() => setSignupMethod('email')}
            />
            Sign up with Email
          </label>
          <label>
            <input
              type="radio"
              value="phone"
              checked={signupMethod === 'phone'}
              onChange={() => setSignupMethod('phone')}
            />
            Sign up with Phone
          </label>
        </div>

        <form onSubmit={handleEmailSignup} className="signup-form">
          <input
            className="form-input"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          {signupMethod === 'email' ? (
            <input
              className="form-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          ) : (
            <>
              <input
                className="form-input"
                type="tel"
                placeholder="+233xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              {!confirmationResult && (
                <button className="form-button" type="button" onClick={handlePhoneSignup}>
                  Send OTP
                </button>
              )}
              {confirmationResult && (
                <input
                  className="form-input"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              )}
            </>
          )}

          <input
            className="form-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <input
            className="form-input"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            Show Password
          </label>

          <select
            className="form-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="Sales">Sales</option>
            <option value="Manager">Manager</option>
            <option value="Finance">Finance</option>
          </select>

          {(role === 'Manager' || role === 'Finance') && (
            <div className="shop-info">
              <h4>Shop Information</h4>
              <input
                className="form-input"
                type="text"
                placeholder="Shop Name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />
              <input
                className="form-input"
                type="text"
                placeholder="Shop Location"
                value={shopLocation}
                onChange={(e) => setShopLocation(e.target.value)}
                required
              />
              <input
                className="form-input"
                type="text"
                placeholder="Shop Contact"
                value={shopContact}
                onChange={(e) => setShopContact(e.target.value)}
                required
              />
            </div>
          )}

          {signupMethod === 'email' ? (
            <button className="form-button" type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up with Email'}
            </button>
          ) : (
            confirmationResult && (
              <button className="form-button" type="button" onClick={verifyOtpAndRegister}>
                Verify OTP & Sign Up
              </button>
            )
          )}
        </form>

        {/* 👇 Redirect to login if account already exists */}
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <span
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => navigate('/login')}
          >
            Login here
          </span>
        </p>

        {signupMethod === 'phone' && <div id="recaptcha-container"></div>}
      </div>
      <Footer />
    </>
  );
}

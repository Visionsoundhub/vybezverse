import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import './AuthModal.css';

const AuthModal = () => {
  const { authModalOpen, setAuthModalOpen, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      setAuthModalOpen(false);
      navigate('/account');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Το email υπάρχει ήδη. Κάνε Login.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Λάθος email ή κωδικός.');
      } else {
        setError('Υπήρξε ένα πρόβλημα. Προσπάθησε ξανά.');
        console.error(err);
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-container glass">
        <button className="auth-close-btn" onClick={() => setAuthModalOpen(false)}>
          <X size={24} />
        </button>
        
        <div className="auth-header">
          <h2>{isLogin ? 'WELCOME BACK' : 'JOIN VYBEZ FAMILY'}</h2>
          <p>{isLogin ? 'Κάνε login για να συνεχίσεις την αγορά σου.' : 'Δημιούργησε λογαριασμό για να πάρεις το αποκλειστικό σου beat.'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-input-group">
              <User className="auth-icon" size={20} />
              <input 
                type="text" 
                placeholder="Ονοματεπώνυμο ή Artist Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="auth-input-group">
            <Mail className="auth-icon" size={20} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <Lock className="auth-icon" size={20} />
            <input 
              type="password" 
              placeholder="Κωδικός" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
          </div>

          <button disabled={loading} type="submit" className="auth-submit-btn">
            {loading ? 'ΠΑΡΑΚΑΛΩ ΠΕΡΙΜΕΝΕ...' : (isLogin ? 'LOGIN' : 'SIGN UP')} 
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Δεν έχεις λογαριασμό; " : "Έχεις ήδη λογαριασμό; "}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Φτιάξε εδώ' : 'Κάνε Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

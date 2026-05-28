import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw, Music, Headphones, Gift, Mail } from 'lucide-react';
import './ChatbotWidget.css';

const SUGGESTIONS = [
  { label: 'Με ενδιαφέρει η μουσική του (Tracks)', icon: Music },
  { label: 'Ψάχνω Beats για να γράψω', icon: Headphones },
  { label: 'Θέλω ένα δωρεάν beat!', icon: Gift },
  { label: 'Πώς επικοινωνώ μαζί του;', icon: Mail }
];

const INITIAL_MESSAGES = [
  {
    id: 'init-1',
    role: 'bot',
    text: 'Γεια! Είμαι ο **VybezBot**, ο προσωπικός βοηθός του Black Vybez. 🤖\n\nΚαλώς ήρθες στο Vybezverse! Εδώ θα βρεις τα **tracks (τραγούδια)** αλλά και τα **beats (παραγωγές)** του Black Vybez για να γράψεις τη δική σου μουσική.\n\nΜε τι θα ήθελες να ξεκινήσουμε;',
    time: new Date()
  }
];

const ChatbotWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('vybez_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(m => ({ ...m, time: new Date(m.time) }));
      }
    } catch (e) {
      console.error('Error loading chat history:', e);
    }
    return INITIAL_MESSAGES;
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Show tooltip after a small delay on first mount
  useEffect(() => {
    const hasSeenChat = localStorage.getItem('vybez_chat_seen');
    if (!hasSeenChat) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('vybez_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleOpenToggle = () => {
    setIsOpen(!isOpen);
    setShowTooltip(false);
    localStorage.setItem('vybez_chat_seen', 'true');
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputValue('');
    }

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      time: new Date()
    };

    setMessages(prev => [...prev, userMsg]);

    // Local Router Navigation Interceptors
    const cleanText = text.trim().toLowerCase();

    // 1. Tracks Redirect
    if (cleanText.includes('μουσική') || cleanText.includes('tracks') || cleanText.includes('κομμάτια') || cleanText.includes('τραγούδια')) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-nav-${Date.now()}`,
          role: 'bot',
          text: 'Τέλεια! Σε μεταφέρω στις κυκλοφορίες του Black Vybez. 🎵\n\nΗ πιο πρόσφατη κυκλοφορία του είναι το **"Jazz Bar των τεράτων"**, ενώ πολύ σύντομα έρχεται και το επόμενο drop του!\n\nΨάχνεις κάτι συγκεκριμένο;',
          time: new Date()
        }]);
        setIsLoading(false);
        navigate('/releases');
      }, 1200); // slightly longer delay so user can read the track ad message
      return;
    }

    // 2. Beats Redirect
    if (cleanText.includes('beats') || cleanText.includes('beatstore') || cleanText.includes('beat store') || cleanText.includes('παραγωγές')) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `bot-nav-${Date.now()}`,
          role: 'bot',
          text: 'Βεβαίως! Σε μεταφέρω στο Beat Store του Black Vybez για να ακούσεις όλα τα instrumentals. 🎧',
          time: new Date()
        }]);
        setIsLoading(false);
        navigate('/beats');
      }, 700);
      return;
    }

    setIsLoading(true);

    try {
      // Map history to format required by Gemini backend
      // Keep only last 10 messages for context length
      const historyCtx = messages
        .filter(m => m.id !== 'init-1') // skip default greeting so system prompt controls it
        .slice(-10)
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text.trim(),
          history: historyCtx
        }),
      });

      const data = await response.json();
      
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: data.response || 'Κάτι πήγε στραβά, δοκιμάστε ξανά.',
        time: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'bot',
          text: 'Σφάλμα σύνδεσης. Βεβαιώσου ότι είσαι συνδεδεμένος στο διαδίκτυο και δοκίμασε ξανά.',
          time: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    if (window.confirm('Θέλετε να καθαρίσετε το ιστορικό συνομιλίας;')) {
      setMessages(INITIAL_MESSAGES);
      localStorage.removeItem('vybez_chat_history');
    }
  };

  // Helper to render markdown-like bolding and links in chat bubbles
  const renderMessageText = (text) => {
    return text.split('\n').map((line, idx) => {
      // Parse markdown bold: **text**
      let parts = line.split(/\*\*([^*]+)\*\*/g);
      const elements = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i}>{part}</strong>;
        }
        
        // Match links in line: [Text](URL) or direct http links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        if (urlRegex.test(part)) {
          const urlParts = part.split(urlRegex);
          return urlParts.map((subPart, subIdx) => {
            if (urlRegex.test(subPart)) {
              return (
                <a key={subIdx} href={subPart} target="_blank" rel="noopener noreferrer" className="chat-link">
                  {subPart}
                </a>
              );
            }
            return subPart;
          });
        }
        
        return part;
      });

      return <span key={idx}>{elements}<br /></span>;
    });
  };

  return (
    <div className="chatbot-widget-container">
      {/* Tooltip Greeting */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div 
            className="chat-tooltip glass"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            onClick={handleOpenToggle}
          >
            <div className="tooltip-avatar">
              <Bot size={22} color="#bc74f5" />
            </div>
            <div className="tooltip-text">
              <strong>VybezBot</strong>
              <p>Ψάχνεις μουσική ή beats; Κάνε κλικ εδώ!</p>
            </div>
            <button className="tooltip-close" onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button 
        className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={handleOpenToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        layout
      >
        {isOpen ? <X size={26} /> : <Bot size={26} />}
        {!isOpen && <span className="online-indicator-ping"></span>}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chat-window-wrapper glass"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 200 }}
          >
            {/* Header */}
            <div className="chat-header">
              <div className="header-info">
                <div className="avatar-icon">
                  <Bot size={20} />
                </div>
                <div className="header-text-block">
                  <h3>VybezBot <Sparkles size={12} color="#ff1493" className="sparkle-icon" /></h3>
                  <span className="online-status"><span className="green-dot"></span> Online Assistant</span>
                </div>
              </div>
              <div className="header-actions">
                <button className="clear-chat-btn" title="Καθαρισμός συνομιλίας" onClick={clearChat}>
                  <RefreshCw size={15} />
                </button>
                <button className="close-chat-btn" onClick={handleOpenToggle}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-messages-body">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.role}`}>
                  {msg.role === 'bot' && (
                    <div className="bot-msg-avatar">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className="message-bubble-wrapper">
                    <div className="message-bubble">
                      {renderMessageText(msg.text)}
                    </div>
                    <span className="message-time">
                      {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message-row bot loading">
                  <div className="bot-msg-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="message-bubble-wrapper">
                    <div className="message-bubble loading-bubble">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Chips */}
            {messages.length <= 2 && !isLoading && (
              <div className="chat-suggestions-chips">
                {SUGGESTIONS.map((sug, idx) => {
                  const Icon = sug.icon;
                  return (
                    <button 
                      key={idx} 
                      className="suggestion-chip"
                      onClick={() => handleSend(sug.label)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Icon size={14} className="chip-icon" style={{ flexShrink: 0 }} />
                      <span>{sug.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Chat Footer / Input Form */}
            <div className="chat-footer-input">
              <textarea
                placeholder={isLoading ? 'Ο VybezBot πληκτρολογεί...' : 'Γράψτε ένα μήνυμα... (π.χ. FREE)'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                rows={1}
              />
              <button 
                onClick={() => handleSend()} 
                disabled={isLoading || !inputValue.trim()}
                className="chat-send-btn"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;

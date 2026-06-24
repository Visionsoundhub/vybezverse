import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Ticket, Music, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [discountCode, setDiscountCode] = useState(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/');
      return;
    }

    // Fetch user data from firestore
    const fetchDashboardData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        const discountDoc = await getDoc(doc(db, 'global_settings', 'discounts'));
        if (discountDoc.exists() && discountDoc.data().activeCode) {
          setDiscountCode(discountDoc.data().activeCode);
        } else {
          setDiscountCode('VYBEZ2026'); // Default if not found
        }
      } catch (e) {
        console.error("Error fetching dashboard data", e);
      }
    };

    fetchDashboardData();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="dashboard-page page-container container">
      <div className="dashboard-header glass">
        <div className="user-profile">
          <div className="user-avatar">
            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'V'}
          </div>
          <div>
            <h1>Welcome, {currentUser.displayName || 'Artist'}</h1>
            <p>{currentUser.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card glass">
          <div className="card-header">
            <Ticket color="#ff1493" />
            <h2>VIP Εκπτώσεις</h2>
          </div>
          <div className="discount-banner">
            <p>Χρησιμοποίησε τον παρακάτω κωδικό στο ταμείο (Payhip) για έκπτωση!</p>
            <div className="discount-code">{discountCode}</div>
          </div>
        </div>

        <div className="dashboard-card glass">
          <div className="card-header">
            <Music color="#bc74f5" />
            <h2>Οι Αγορές Μου</h2>
          </div>
          
          {userData?.purchases && userData.purchases.length > 0 ? (
            <ul className="purchases-list">
              {userData.purchases.map((purchase, idx) => (
                <li key={idx} className="purchase-item">
                  <span>{purchase.trackTitle}</span>
                  <span className="purchase-type">{purchase.licenseType}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <AlertCircle size={40} opacity={0.5} />
              <p>Δεν έχεις καταχωρημένες αγορές ακόμα.</p>
              <span className="note">Οι αγορές σου από το Payhip θα συγχρονιστούν σύντομα. Αν αγόρασες κάτι και δεν φαίνεται, επικοινώνησε μαζί μας.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

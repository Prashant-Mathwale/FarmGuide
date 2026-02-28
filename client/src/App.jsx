import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropRec from './pages/CropRec';
import DiseaseDetect from './pages/DiseaseDetect';
import MarketPrices from './pages/MarketPrices';
import Weather from './pages/Weather';
import ProfitCalculator from './pages/ProfitCalculator';
import Layout from './components/Layout';

import Chatbot from './components/Chatbot';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <Router>
      <div className="bg-[var(--color-bg-darker)] min-h-screen text-[var(--color-text-main)] font-sans selection:bg-emerald-500/30">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!user ? <Landing /> : <Navigate to="/dashboard" replace />} />
          <Route path="/login" element={!user ? <Login setAuthUser={setUser} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register setAuthUser={setUser} /> : <Navigate to="/dashboard" replace />} />

          {/* Protected Routes Wrapper */}
          <Route
            element={user ? <Layout user={user} setUser={setUser}><div /></Layout> : <Navigate to="/login" replace />}
          >
            {/* The Layout component wraps its children, but react-router needs nested routes. Let's do a wrapper function below. */}
          </Route>

          <Route path="/dashboard" element={user ? <Layout user={user} setUser={setUser}><Dashboard /></Layout> : <Navigate to="/login" />} />
          <Route path="/crop-rec" element={user ? <Layout user={user} setUser={setUser}><CropRec /></Layout> : <Navigate to="/login" />} />
          <Route path="/disease-detect" element={user ? <Layout user={user} setUser={setUser}><DiseaseDetect /></Layout> : <Navigate to="/login" />} />
          <Route path="/market-prices" element={user ? <Layout user={user} setUser={setUser}><MarketPrices /></Layout> : <Navigate to="/login" />} />
          <Route path="/weather" element={user ? <Layout user={user} setUser={setUser}><Weather /></Layout> : <Navigate to="/login" />} />
          <Route path="/profit" element={user ? <Layout user={user} setUser={setUser}><ProfitCalculator /></Layout> : <Navigate to="/login" />} />
        </Routes>

        {/* Global Chatbot Widget (Only show if logged in, or everywhere if you prefer - here we show if logged in to avoid cluttering landing) */}
        {user && <Chatbot />}
      </div>
    </Router>
  );
}

export default App;

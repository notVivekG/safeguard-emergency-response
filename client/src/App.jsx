import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthContext } from './context/AuthContext';
import { audioService } from './services/audioService';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import SOSGlobalPopup from './components/SOSGlobalPopup';
import Home from './pages/Home';
import LiveMap from './pages/LiveMap';
import ReportIncident from './pages/ReportIncident';
import Alerts from './pages/Alerts';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import Resources from './pages/Resources';
import About from './pages/About';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';
import MyMissions from './pages/MyMissions';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" />;
  
  return children;
};

function App() {
  const location = useLocation();
  const { loading } = useContext(AuthContext);

  // Unlock AudioContext on first user interaction (browser requirement)
  useEffect(() => {
    const unlockAudio = () => {
      audioService.initAudioContext();
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SOSGlobalPopup />
      
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/report" element={
              <ProtectedRoute>
                <ReportIncident />
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/about" element={<About />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } />

            <Route path="/missions" element={
              <ProtectedRoute>
                <MyMissions />
              </ProtectedRoute>
            } />
            <Route path="/missions/:id" element={
              <ProtectedRoute>
                <MyMissions />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;


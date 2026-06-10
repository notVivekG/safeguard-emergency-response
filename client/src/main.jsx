import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { pingServer } from './services/api';
import './index.css';
import 'leaflet/dist/leaflet.css';

const AppWithPing = () => {
  useEffect(() => {
    pingServer();
  }, []);

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppWithPing />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

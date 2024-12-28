import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import HomePage from './HomePage';
import IframePage from './pages/IframePage';
import WebWalletPage from './pages/WebWalletPage';
import './index.css';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/iframe" element={<IframePage />} />
        <Route path="/web-wallet" element={<WebWalletPage />} />
      </Routes>
    </Router>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
);

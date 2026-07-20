import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import App from './App.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import Attributes from './pages/Attributes.jsx';
import Positions from './pages/Positions.jsx';
import CVs from './pages/CVs.jsx';
import CVDetail from './pages/CVDetail.jsx';
import PositionDetail from './pages/PositionDetail.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/attributes" element={<Attributes />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/cvs" element={<CVs />} />
        <Route path="/cvs/:id" element={<CVDetail />} />
        <Route path="/positions/:id" element={<PositionDetail />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
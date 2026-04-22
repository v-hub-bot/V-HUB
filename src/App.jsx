import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProviderDashboard from './pages/ProviderDashboard';
import Wekcadmin from './pages/Wekcadmin';
import ListService from './pages/ListService';
import Privacy from './pages/Privacy';
import Home from './pages/Home';
import Terms from './pages/Terms';
import Classifieds from './pages/Classifieds';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Classifieds" element={<Classifieds />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

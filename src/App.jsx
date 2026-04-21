import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Classifieds from './pages/Classifieds';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ListService from './pages/ListService';
import Wekcadmin from './pages/Wekcadmin';
import Home from './pages/Home';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

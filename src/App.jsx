import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Wekcadmin from './pages/Wekcadmin';
import Classifieds from './pages/Classifieds';
import ProviderDashboard from './pages/ProviderDashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ListService from './pages/ListService';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

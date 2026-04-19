import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProviderDashboard from './pages/ProviderDashboard';
import Home from './pages/Home';
import Classifieds from './pages/Classifieds';
import Wekcadmin from './pages/Wekcadmin';
import Privacy from './pages/Privacy';
import ListService from './pages/ListService';
import Terms from './pages/Terms';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Wekcadmin from './pages/Wekcadmin';
import Home from './pages/Home';
import Classifieds from './pages/Classifieds';
import ProviderDashboard from './pages/ProviderDashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ListService from './pages/ListService';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/ListService" element={<ListService />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

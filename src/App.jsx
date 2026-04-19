import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProviderDashboard from './pages/ProviderDashboard';
import Home from './pages/Home';
import ListService from './pages/ListService';
import Classifieds from './pages/Classifieds';
import Wekcadmin from './pages/Wekcadmin';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

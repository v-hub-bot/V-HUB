import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Classifieds from './pages/Classifieds';
import ListService from './pages/ListService';
import Privacy from './pages/Privacy';
import ProviderDashboard from './pages/ProviderDashboard';
import Terms from './pages/Terms';
import Wekcadmin from './pages/Wekcadmin';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/Home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

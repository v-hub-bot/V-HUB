import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import ProviderDashboard from './pages/ProviderDashboard';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Wekcadmin from './pages/Wekcadmin';
import ListService from './pages/ListService';
import Classifieds from './pages/Classifieds';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Classifieds" element={<Classifieds />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

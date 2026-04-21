import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Wekcadmin from './pages/Wekcadmin';
import ListService from './pages/ListService';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import ProviderDashboard from './pages/ProviderDashboard';
import Classifieds from './pages/Classifieds';
import Terms from './pages/Terms';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/Terms" element={<Terms />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

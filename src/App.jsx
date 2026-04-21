import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Classifieds from './pages/Classifieds';
import Wekcadmin from './pages/Wekcadmin';
import Home from './pages/Home';
import Terms from './pages/Terms';
import ProviderDashboard from './pages/ProviderDashboard';
import ListService from './pages/ListService';
import Privacy from './pages/Privacy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Privacy" element={<Privacy />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

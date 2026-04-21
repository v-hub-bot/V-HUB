import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Terms from './pages/Terms';
import Wekcadmin from './pages/Wekcadmin';
import Privacy from './pages/Privacy';
import Home from './pages/Home';
import Classifieds from './pages/Classifieds';
import ListService from './pages/ListService';
import ProviderDashboard from './pages/ProviderDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

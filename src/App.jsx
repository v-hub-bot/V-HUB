import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Terms from './pages/Terms';
import Wekcadmin from './pages/Wekcadmin';
import ProviderDashboard from './pages/ProviderDashboard';
import Privacy from './pages/Privacy';
import Classifieds from './pages/Classifieds';
import Home from './pages/Home';
import ListService from './pages/ListService';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ListService" element={<ListService />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

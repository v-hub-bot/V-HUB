import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Classifieds from './pages/Classifieds';
import Home from './pages/Home';
import ListService from './pages/ListService';
import Privacy from './pages/Privacy';
import ProviderDashboard from './pages/ProviderDashboard';
import Terms from './pages/Terms';
import Wekcadmin from './pages/Wekcadmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Classifieds" element={<Classifieds />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ListService" element={<ListService />} />
        <Route path="/Privacy" element={<Privacy />} />
        <Route path="/ProviderDashboard" element={<ProviderDashboard />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Wekcadmin" element={<Wekcadmin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

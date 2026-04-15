import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Inventory from './pages/Inventory';
import Activity from './pages/Activity';
import ComingSoon from './pages/ComingSoon';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/people" element={<ComingSoon title="People" />} />
        <Route path="/settings" element={<ComingSoon title="Settings" />} />
        <Route path="/archive" element={<ComingSoon title="Archive" />} />
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

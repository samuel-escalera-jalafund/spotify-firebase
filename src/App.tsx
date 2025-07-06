import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import GenreDetail from './pages/GenreDetail';
import ArtistDetail from './pages/ArtistDetail';
import AdminPanel from './pages/AdminPanel';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container">Cargando...</div>;
  return user ? <>{children}</> : <Navigate to="/login" state={{ from: location }} replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container">Cargando...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  return (
    <nav className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold text-lg hover:text-green-400 transition">Inicio</Link>
        {!user && <Link to="/login" className="hover:text-green-400 transition">Iniciar sesión</Link>}
        {!user && <Link to="/register" className="hover:text-green-400 transition">Registrarse</Link>}
        {isAdmin && <Link to="/admin" className="hover:text-yellow-400 transition">Admin</Link>}
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-gray-300">| {user.email}</span>
          <button className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white transition" onClick={logout}>Salir</button>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="container mx-auto max-w-3xl px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={() => {}} />} />
            <Route path="/register" element={<Register onRegister={() => {}} />} />
            <Route path="/genre/:genreId" element={<PrivateRoute><GenreDetail /></PrivateRoute>} />
            <Route path="/artist/:artistId" element={<PrivateRoute><ArtistDetail /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

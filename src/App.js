import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import './App.css';

// Componentes
import RoomReservation from './features/rooms/RoomReservation';
import RestaurantReservation from './features/restaurant/RestaurantReservation';
import EventReservation from './features/events/EventReservation';
import FoodGallery from './features/food/FoodGallery';
import AdminDashboard from './features/admin/AdminDashboard';
import CustomAlert from './components/CustomAlert';
import HeroVideo from './components/HeroVideo';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import AuthModal from './components/AuthModal';
import LogoutModal from './components/LogoutModal';

// Hooks
import useAlert from './hooks/useAlert';
import useLocalStorage from './hooks/useLocalStorage';

// Assets
import { mahaloLogo } from './assets/images';

// Constantes
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const ADMIN_EMAIL = 'clubdeplaya@mahaloclubofficial.com';

function App() {
  const [user, setUser] = useLocalStorage('mahalo_user', null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '', email: '', phone: '', password: ''
  });

  const { alertState, hideAlert, showError, showSuccess } = useAlert();

  // Hook de navegación
  const navigate = useNavigate();
  const location = useLocation();

  // Memoizar usuario con permisos de admin
  const userWithAdmin = useMemo(() => {
    if (!user) return null;
    return user.email === ADMIN_EMAIL ? { ...user, is_admin: 1 } : user;
  }, [user]);

  // Determinar currentView basado en la ruta actual
  const currentView = useMemo(() => {
    const path = location.pathname;
    if (path === '/habitaciones' || path === '/rooms') return 'rooms';
    if (path === '/restaurante' || path === '/restaurant') return 'restaurant';
    if (path === '/eventos' || path === '/events') return 'events';
    if (path === '/comida' || path === '/food') return 'food';
    return 'home';
  }, [location.pathname]);

  // Efectos
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (user) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres cerrar la sesión? Los cambios no guardados se perderán.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user]);

  // Efecto para actualizar el usuario con permisos de admin solo si el usuario existe
  // No restaurar si el usuario fue eliminado (logout)
  useEffect(() => {
    // Verificar que el usuario existe y que también existe en localStorage (no fue eliminado)
    const storedUser = window.localStorage.getItem('mahalo_user');
    if (user && storedUser && user.email === ADMIN_EMAIL && !user.is_admin) {
      setUser({ ...user, is_admin: 1 });
    }
  }, [user, setUser]);

  // Handlers memoizados
  const handleViewChange = useCallback((newView) => {
    const routeMap = {
      'home': '/',
      'rooms': '/habitaciones',
      'restaurant': '/restaurante',
      'events': '/eventos',
      'food': '/comida'
    };
    const route = routeMap[newView] || '/';
    navigate(route);
  }, [navigate]);

  const openAuth = useCallback((mode) => {
    setAuthMode(mode);
    setAuthForm({ name: '', email: '', phone: '', password: '' });
    setShowAuthModal(true);
  }, []);

  const closeAuth = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const handleAuthInput = useCallback((e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // Efecto para redirigir si el usuario pierde permisos de admin mientras está en el panel
  useEffect(() => {
    if (location.pathname === '/mahalo-panel-de-administracion' && !userWithAdmin?.is_admin) {
      // Si está en el panel pero ya no es admin, redirigir a la página principal
      navigate('/', { replace: true });
    }
  }, [location.pathname, userWithAdmin?.is_admin, navigate]);

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const confirmLogout = useCallback(() => {
    // Cerrar el modal primero
    setShowLogoutConfirm(false);
    
    // Eliminar manualmente del localStorage PRIMERO para evitar que se restaure
    try {
      window.localStorage.removeItem('mahalo_user');
      window.localStorage.removeItem('mahalo_token');
      window.localStorage.removeItem('mahalo_session');
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
    
    // Limpiar el estado del usuario (esto también eliminará del localStorage gracias a useLocalStorage)
    setUser(null);
    
    // Redirigir a la página principal inmediatamente
    navigate('/', { replace: true });
  }, [setUser, navigate]);

  const cancelLogout = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  // Autenticación
  const submitAuth = async (e) => {
    e.preventDefault();
    
    const isSignup = authMode === 'signup';
    const requiredFields = isSignup 
      ? ['name', 'email', 'password']
      : ['email', 'password'];

    const missingFields = requiredFields.filter(field => !authForm[field]);
    if (missingFields.length > 0) {
      showError(`${missingFields.join(', ')} ${missingFields.length > 1 ? 'son' : 'es'} obligatorio${missingFields.length > 1 ? 's' : ''}`, 'Campos requeridos');
      return;
    }

    try {
      const endpoint = isSignup ? '/api/users' : '/api/login';
      const payload = isSignup 
        ? { name: authForm.name, email: authForm.email, phone: authForm.phone || '', password: authForm.password }
        : { email: authForm.email, password: authForm.password };

      const resp = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || (isSignup ? 'Error al crear el usuario' : 'Credenciales inválidas'));
      }

      const userData = await resp.json();
      const finalUser = userData.email === ADMIN_EMAIL ? { ...userData, is_admin: 1 } : userData;
      
      setUser(finalUser);
      setShowAuthModal(false);
      
      // Redirigir al panel de administración si es admin
      if (finalUser.is_admin) {
        navigate('/mahalo-panel-de-administracion');
      }
      
      if (isSignup) {
        showSuccess('Cuenta creada exitosamente', '¡Bienvenido!');
      }
    } catch (error) {
      showError(`No se pudo ${isSignup ? 'crear la cuenta' : 'iniciar sesión'}: ${error.message}`, 
                `Error al ${isSignup ? 'crear cuenta' : 'iniciar sesión'}`);
    }
  };

  return (
    <div className="App">
      <Header 
        user={userWithAdmin}
        onOpenAuth={openAuth}
        onLogoutClick={handleLogoutClick}
      />
      
      <div className="app-body">
        <Routes>
          {/* Ruta del panel de administración */}
          <Route 
            path="/mahalo-panel-de-administracion" 
            element={
              userWithAdmin?.is_admin ? (
                <>
                  <main className="main-content">
                    <AdminDashboard apiUrl={API_URL} />
                  </main>
                </>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          
          {/* Ruta principal */}
          <Route 
            path="/" 
            element={
              <>
                {!userWithAdmin?.is_admin && <Navbar onViewChange={handleViewChange} currentView={currentView} />}
                <main className="main-content">
                  <HomePage 
                    onViewChange={handleViewChange}
                    user={userWithAdmin}
                  />
                </main>
              </>
            } 
          />
          
          {/* Ruta de habitaciones */}
          <Route 
            path="/habitaciones" 
            element={
              <>
                {!userWithAdmin?.is_admin && <Navbar onViewChange={handleViewChange} currentView={currentView} />}
                <main className="main-content">
                  <div className="back-navigation">
                    <button className="back-button" onClick={() => handleViewChange('home')}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                      </svg>
                      Volver al Inicio
                    </button>
                  </div>
                  <RoomReservation user={userWithAdmin} apiUrl={API_URL} />
                </main>
              </>
            } 
          />
          
          {/* Ruta de restaurante */}
          <Route 
            path="/restaurante" 
            element={
              <>
                {!userWithAdmin?.is_admin && <Navbar onViewChange={handleViewChange} currentView={currentView} />}
                <main className="main-content">
                  <div className="back-navigation">
                    <button className="back-button" onClick={() => handleViewChange('home')}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                      </svg>
                      Volver al Inicio
                    </button>
                  </div>
                  <RestaurantReservation user={userWithAdmin} apiUrl={API_URL} />
                </main>
              </>
            } 
          />
          
          {/* Ruta de eventos */}
          <Route 
            path="/eventos" 
            element={
              <>
                {!userWithAdmin?.is_admin && <Navbar onViewChange={handleViewChange} currentView={currentView} />}
                <main className="main-content">
                  <div className="back-navigation">
                    <button className="back-button" onClick={() => handleViewChange('home')}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                      </svg>
                      Volver al Inicio
                    </button>
                  </div>
                  <EventReservation user={userWithAdmin} apiUrl={API_URL} />
                </main>
              </>
            } 
          />
          
          {/* Ruta de comida */}
          <Route 
            path="/comida" 
            element={
              <>
                {!userWithAdmin?.is_admin && <Navbar onViewChange={handleViewChange} currentView={currentView} />}
                <main className="main-content">
                  <div className="back-navigation">
                    <button className="back-button" onClick={() => handleViewChange('home')}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                      </svg>
                      Volver al Inicio
                    </button>
                  </div>
                  <FoodGallery onBack={() => handleViewChange('home')} />
                </main>
              </>
            } 
          />
          
          {/* Redirects para rutas en inglés */}
          <Route path="/rooms" element={<Navigate to="/habitaciones" replace />} />
          <Route path="/restaurant" element={<Navigate to="/restaurante" replace />} />
          <Route path="/events" element={<Navigate to="/eventos" replace />} />
          <Route path="/food" element={<Navigate to="/comida" replace />} />
        </Routes>
      </div>

      <Footer />

      {/* Modales */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuth}
        mode={authMode}
        form={authForm}
        onInputChange={handleAuthInput}
        onSubmit={submitAuth}
      />

      <LogoutModal
        isOpen={showLogoutConfirm}
        onCancel={cancelLogout}
        onConfirm={confirmLogout}
      />

      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        autoClose={alertState.autoClose}
        autoCloseDelay={alertState.autoCloseDelay}
      />
    </div>
  );
}

// Componente Header separado
const Header = React.memo(({ user, onOpenAuth, onLogoutClick }) => {
  const navigate = useNavigate();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <img 
            src={mahaloLogo} 
            alt="Mahalo Logo" 
            className="logo clickable-logo" 
            onClick={handleLogoClick}
          />
          <div className="header-text">
            <h1>Mahalo Beach Club</h1>
            <p>Tu casa en la playa</p>
          </div>
        </div>
        
        <div className="header-right">
          <AuthSection 
            user={user}
            greeting={getGreeting()}
            onOpenAuth={onOpenAuth}
            onLogoutClick={onLogoutClick}
          />
          <SocialLinks />
        </div>
      </div>
    </header>
  );
});

// Componente AuthSection separado
const AuthSection = React.memo(({ user, greeting, onOpenAuth, onLogoutClick }) => (
  <div className="auth-buttons">
    {user ? (
      <div className="user-welcome">
        <div className="user-avatar">
          <UserIcon />
        </div>
        <span className="greeting">{greeting}, {user.name || user.email}</span>
        <button onClick={onLogoutClick} className="auth-button logout" title="Cerrar sesión">
          <LogoutIcon />
          Cerrar sesión
        </button>
      </div>
    ) : (
      <div className="auth-options">
        <button onClick={() => onOpenAuth('login')} className="auth-button login" title="Iniciar sesión">
          <LoginIcon />
          Iniciar sesión
        </button>
        <button onClick={() => onOpenAuth('signup')} className="auth-button signup" title="Crear cuenta">
          <SignupIcon />
          Crear cuenta
        </button>
      </div>
    )}
  </div>
));

// Componente SocialLinks separado
const SocialLinks = React.memo(() => (
  <div className="social-links">
    <SocialIcon 
      href="https://www.facebook.com/clubmahalooficial/"
      ariaLabel="Facebook"
      title="Facebook"
    >
      <FacebookIcon />
    </SocialIcon>
    <SocialIcon 
      href="https://www.instagram.com/mahalocluboficial/"
      ariaLabel="Instagram"
      title="Instagram"
    >
      <InstagramIcon />
    </SocialIcon>
    <SocialIcon 
      href="https://www.tiktok.com/"
      ariaLabel="TikTok"
      title="TikTok"
    >
      <TikTokIcon />
    </SocialIcon>
  </div>
));

// Componente SocialIcon reutilizable
const SocialIcon = ({ href, ariaLabel, title, children }) => (
  <a className={`social-icon ${ariaLabel.toLowerCase()}`} 
     href={href} target="_blank" rel="noopener noreferrer"
     aria-label={ariaLabel} title={title}>
    {children}
  </a>
);

// Componente Footer separado
const Footer = React.memo(() => (
  <footer className="app-footer">
    <div className="footer-content">
      <div className="footer-section">
        <h4>Mahalo Beach Club</h4>
        <p>Tu refugio paradisíaco en la costa del Pacífico</p>
      </div>
      <div className="footer-section">
        <h4>Contacto</h4>
        <p>Playa Santa Lucía, Acapulco</p>
        <p>clubdeplaya@mahaloclubofficial.com</p>
        <p>Teléfono: 7444813854 - 7444840019</p>
      </div>
      <div className="footer-section">
        <h4>Horario</h4>
        <p>Lunes - Domingo: 9:00 AM - 8:00 PM</p>
      </div>
    </div>
    <div className="footer-bottom">
      <p>&copy; 2024 Mahalo Beach Club. Todos los derechos reservados.</p>
    </div>
  </footer>
));

// Iconos como componentes separados para reutilización
const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
  </svg>
);

const LoginIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z"/>
  </svg>
);

const SignupIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
  </svg>
);

// Componente wrapper con Router
const AppWithRouter = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

export default AppWithRouter;
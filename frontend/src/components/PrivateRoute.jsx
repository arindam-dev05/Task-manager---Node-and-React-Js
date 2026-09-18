// components/PrivateRoute.jsx
// Wraps any route that requires login. If there's no user in context,
// it redirects to /login instead of rendering the protected page.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

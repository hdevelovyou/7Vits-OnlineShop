import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null; // hoặc loading spinner
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

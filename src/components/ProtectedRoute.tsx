import React from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  element: any;
  allowedRole: string; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, allowedRole }) => {
  const role = Cookies.get("role"); 

  if (!role) {
    return <Navigate to="/auth/login" replace />;
  }

  if (role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return element;
};

export default ProtectedRoute;

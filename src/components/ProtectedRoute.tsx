// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getDecryptedItem } from "../utils/storageHelper";

interface ProtectedRouteProps {
  element: any;
  allowedRole: string; // Role allowed to access this route
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  allowedRole,
}) => {
  // Retrieve the user role from encrypted storage
  const role = getDecryptedItem<string>("role");

  // If no role, redirect to login
  if (!role) {
    return <Navigate to="/auth/login" replace />;
  }

  // If role does not match, redirect to unauthorized page
  if (role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Role is allowed, render the element
  return element;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';

type UserType = 'organizer' | 'visitor';

export default function RoleProtected(
  { userType, children }:
  { userType: UserType; children: JSX.Element }
) {
  const userStr = localStorage.getItem('user');
  let user: any = {};
  try {
    user = userStr ? JSON.parse(userStr) : {};
  } catch {
    user = {};
  }
  console.log('RoleProtected user:', user);

  if (!user.userType) {
    // Not logged in or user info missing
    return <Navigate to="/login" replace />;
  }

  // Only allow access for the specified userType
  if (user.userType !== userType) {
    return <Navigate to="/" replace />;
  }

  return children;
}

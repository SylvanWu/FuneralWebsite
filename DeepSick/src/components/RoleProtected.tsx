import React from 'react';
import { Navigate } from 'react-router-dom';

type UserType = 'organizer' | 'visitor' | 'lovedOne';

export default function RoleProtected(
  { userType, children }:
  { userType: UserType; children: JSX.Element }
) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.userType === userType ? children : <Navigate to="/login" replace />;
}

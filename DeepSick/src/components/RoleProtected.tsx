import React from 'react';
import { Navigate } from 'react-router-dom';

type Role = 'visitor' | 'organizer' | 'admin' | 'remembered person';

export default function RoleProtected(
  { allow, children }:
  { allow: Role[]; children: JSX.Element }
) {
  const role = localStorage.getItem('role') as Role | null;
  return role && allow.includes(role) ? children : <Navigate to="/" replace />;
}

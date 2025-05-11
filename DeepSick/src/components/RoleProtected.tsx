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
    // 未登录或user丢失
    return <Navigate to="/login" replace />;
  }

  // 只允许指定 userType 访问
  if (user.userType !== userType) {
    return <Navigate to="/" replace />;
  }

  return children;
}

import React from 'react';
import { Navigate } from 'react-router-dom';

type UserType = 'organizer' | 'visitor' | 'lovedOne';

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
  if (user.userType !== userType) {
    // 已登录但无权限
    return <Navigate to="/" replace />;
  }
  return children;
}

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

  // 只有 lovedOne 需要特殊处理
  if (userType === 'lovedOne' && user.userType !== 'lovedOne') {
    return <Navigate to="/" replace />;
  }

  return children;
}

import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function LovedOneDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">亲友中心</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 遗嘱查看卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">遗嘱查看</h2>
          <p className="text-gray-600 mb-4">查看和访问相关遗嘱内容</p>
          <Link 
            to="/loved-one-dashboard/wills" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            查看遗嘱
          </Link>
        </div>

        {/* 梦想清单卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">梦想清单</h2>
          <p className="text-gray-600 mb-4">查看和管理梦想清单</p>
          <Link 
            to="/loved-one-dashboard/dreamlist" 
            className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
          >
            查看梦想清单
          </Link>
        </div>

        {/* 个人资料卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">个人资料</h2>
          <p className="text-gray-600 mb-4">管理您的个人信息</p>
          <Link 
            to="/profile" 
            className="inline-block bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
          >
            编辑资料
          </Link>
        </div>
      </div>

      {/* 子路由内容 */}
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

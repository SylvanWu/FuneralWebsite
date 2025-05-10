import React from 'react';
import { Link } from 'react-router-dom';

export default function VisitorDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">访客中心</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 纪念馆访问卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">纪念馆</h2>
          <p className="text-gray-600 mb-4">访问纪念馆，缅怀逝者</p>
          <Link 
            to="/hall" 
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            进入纪念馆
          </Link>
        </div>

        {/* 互动功能卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">互动功能</h2>
          <p className="text-gray-600 mb-4">参与纪念馆的互动活动</p>
          <Link 
            to="/interactive" 
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            进入互动页面
          </Link>
        </div>

        {/* 房间访问卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">房间访问</h2>
          <p className="text-gray-600 mb-4">访问纪念馆内的房间</p>
          <Link 
            to="/room" 
            className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
          >
            进入房间
          </Link>
        </div>

        {/* 首页卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">返回首页</h2>
          <p className="text-gray-600 mb-4">返回系统首页</p>
          <Link 
            to="/" 
            className="inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            返回首页
          </Link>
        </div>

        {/* 个人资料卡片 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">个人资料</h2>
          <p className="text-gray-600 mb-4">管理您的个人信息和访问记录</p>
          <Link 
            to="/profile" 
            className="inline-block bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
          >
            编辑资料
          </Link>
        </div>
      </div>
    </div>
  );
}

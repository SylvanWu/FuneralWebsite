// 愿望列表主组件
// src/components/DreamList/DreamList.tsx
import React, { useState } from 'react';

export function DreamList() {
  return (
    <div className="dream-list-container">
      <h1 className="dream-list-title">愿望清单</h1>
      <div className="dream-list-content">
        <p>这里是梦想清单内容</p>
      </div>
      <style jsx>{`
        .dream-list-container {
          position: relative;
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        .dream-list-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }
        
        .dream-list-container::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #3b82f6, #ec4899);
        }
        
        .dream-list-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .dream-list-content {
          font-size: 1.125rem;
          color: #4b5563;
          min-height: 100px;
          padding: 1rem;
          borderRadius: 8px;
          backgroundColor: #f9fafb;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}

export default DreamList;
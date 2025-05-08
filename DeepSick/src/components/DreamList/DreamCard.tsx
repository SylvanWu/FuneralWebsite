// drag with the mouse can move the wish box鼠标拖拽功能
import React, { useEffect, useRef } from 'react';
import '../DreamList/DreamList.css';

export const DreamCard = ({ children }: { children: React.ReactNode }) => {
  // 使用useRef引用DOM元素，用于后续操作
  const dragRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  // 标记是否正在拖拽
  const isDragging = useRef(false);


  // 组件挂载后执行的副作用
  useEffect(() => {
    // 获取引用的DOM元素
    const divElement = dragRef.current;
    if (divElement) {
      // 为元素添加鼠标按下.抬起.移动事件监听
      divElement.addEventListener('mousedown', handleMouseDown);
      // 为整个文档添加鼠标释放事件监听
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);

      // 组件卸载时执行的清理函数
      return () => {
        // 移除事件监听，防止内存泄漏
        divElement.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []); // 空依赖数组表示只在挂载和卸载时执行

  // 鼠标按下handleMouseDown function
  const handleMouseDown = (e: MouseEvent) => {
    if (dragRef.current) {
      startX.current = e.clientX;
      startY.current = e.clientY;
      // 正在拖拽
      isDragging.current = true;
    }
  };

  // 鼠标移动handleMouseMove function
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && dragRef.current) {
      const dx = e.clientX - startX.current;
      const dy = e.clientY - startY.current;

      const div = dragRef.current;

      // 获取元素当前值并加上移动距离，得到新的值
      const left = parseInt(div.style.left || '0', 10) + dx;
      const top = parseInt(div.style.top || '0', 10) + dy;

      // 设置元素新的位置
      div.style.left = `${left}px`;
      div.style.top = `${top}px`;

      // 更新鼠标位置记录，用于下一次移动计算
      startX.current = e.clientX;
      startY.current = e.clientY;
    }
  };

  // 鼠标释放handleMouseUp function
  const handleMouseUp = () => {
    // 停止拖拽
    isDragging.current = false;
  };

  return (
    <div
      ref={dragRef} // 将ref绑定到这个div
      className="dream-card "
      style={{
        position: 'absolute', // 使用绝对定位以便拖拽
        top: 100, // 初始顶部位置
        left: 100, // 初始左侧位置
        cursor: 'grab' // 鼠标悬停时显示抓手图标
      }}
    >
      {children}
    </div>
  )


}
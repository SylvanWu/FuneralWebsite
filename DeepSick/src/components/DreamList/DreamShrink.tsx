import React, { useRef, useState } from 'react';
import DreamList from './DreamList'; // 引入愿望列表组
import '../DreamList/DreamList.css';// 引入样式文件
import pokemon from '../../assets/5IPv.gif';
import { DreamCard } from './DreamCard'; // ✅ 使用可拖拽的外层

const DreamShrink = () => {
  const [isShrunk, setIsShrunk] = useState(false); // 控制是否收缩

  // 用于检测是否点击（非拖动）
  const clickStart = useRef({ x: 0, y: 0 });

  //切换 isShrunk 状态的值
  const toggleShrink = () => {
    setIsShrunk(!isShrunk);
  };

  // 记录点击起点
  const handleMouseDown = (e: React.MouseEvent) => {
    clickStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - clickStart.current.x);
    const dy = Math.abs(e.clientY - clickStart.current.y);
    const isClick = dx < 5 && dy < 5;
    if (isClick) {
      toggleShrink();
    }
  };

  // 判断是否是“真正的点击”
  const handleClick = (e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - clickStart.current.x);
    const dy = Math.abs(e.clientY - clickStart.current.y);
    const isClick = dx < 5 && dy < 5; // 移动很小才算点击

    if (isClick) {
      toggleShrink(); // 只有是真点击才切换状态
    }
  };

  return (
    <DreamCard shrunk={isShrunk}>
      <div className={`dream-shrink-container ${isShrunk ? 'shrunk' : ''}`}>
        {/* 第一层：按钮或皮卡丘图标 */}
        <div>
          {isShrunk ? (
            <img
              src={pokemon}
              alt="皮卡丘"
              className="jirachi-icon-shrunk"
              onMouseDown={handleMouseDown} // 新增
              onMouseUp={handleMouseUp}     // 新增
            // onClick={toggleShrink}
            />
          ) : (
            <button className="shrink-button" onClick={toggleShrink}>
              -
            </button>
          )}
        </div>

        {/* 第二层：愿望列表栏 */}
        <div style={{ display: isShrunk ? 'none' : 'block' }}>
          <DreamList />
        </div>
      </div>
    </DreamCard>
  );
};

export default DreamShrink;





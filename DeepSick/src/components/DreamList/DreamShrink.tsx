import React, { useState } from 'react';
import DreamList from './DreamList'; // 引入愿望列表组
import '../DreamList/DreamList.css';// 引入样式文件
import pokemon from '../../assets/5IPv.gif';

const DreamShrink = () => {
  const [isShrunk, setIsShrunk] = useState(false); // 控制是否收缩

  //切换 isShrunk 状态的值
  const toggleShrink = () => {
    setIsShrunk(!isShrunk);
  };

  return (
    <div className="dream-shrink-container">
      {/* {!isShrunk && (
        <button className="shrink-button" onClick={toggleShrink}>
          -
        </button>
      )} */}

      {isShrunk ? (
        <img
          src={pokemon}
          alt="基拉祈图标"
          className="jirachi-icon-shrunk"
          onClick={toggleShrink}
        // style={{
        //   position: 'absolute',
        //   top: '10px',
        //   left: '10px',
        //   zIndex: 10
        // }}
        />
      ) : (
        <DreamList onShrink={toggleShrink} />
      )}
    </div>
  );
};

export default DreamShrink;



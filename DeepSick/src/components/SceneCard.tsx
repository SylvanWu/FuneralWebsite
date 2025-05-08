import React from 'react';

export interface SceneType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface SceneCardProps {
  scene: SceneType;
  isSelected: boolean;
  onSelect: (scene: SceneType) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, isSelected, onSelect }) => {
  // 为每种场景类型定义默认颜色
  const getBgColorByType = (id: string) => {
    const colors: Record<string, string> = {
      'church': '#e0f2fe', // 浅蓝色
      'garden': '#dcfce7', // 浅绿色
      'forest': '#d1fae5', // 浅青色
      'seaside': '#dbeafe', // 浅蓝色
      'starry-night': '#f3e8ff', // 浅紫色
      'chinese-traditional': '#fee2e2' // 浅红色
    };
    return colors[id] || '#f3f4f6'; // 默认为浅灰色
  };

  return (
    <div 
      className={`
        bg-gray-200 border rounded-lg overflow-hidden shadow-md transition-all duration-200 cursor-pointer h-full
        ${isSelected 
          ? 'border-blue-500 ring-2 ring-blue-300 transform scale-[1.02]' 
          : 'border-gray-200 hover:shadow-lg hover:border-gray-300'
        }
      `}
      onClick={() => onSelect(scene)}
    >
      <div 
        className="relative h-48 overflow-hidden" 
        style={{ backgroundColor: getBgColorByType(scene.id) }}
      >
        {scene.imageUrl && scene.imageUrl.startsWith('http') ? (
          <img 
            src={scene.imageUrl} 
            alt={scene.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {/* 简单的图标占位符 */}
            <div className="text-center">
              <div className="mx-auto w-20 h-20 mb-2 rounded-full bg-white flex items-center justify-center">
                {scene.id === 'church' && (
                  <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 1L1 8h2v11h14V8h2L10 1zm0 2l5 4v1h-2v7h-6v-7H5V7l5-4z" />
                  </svg>
                )}
                {scene.id === 'garden' && (
                  <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                )}
                {scene.id === 'forest' && (
                  <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 7.5l5-5 5 5H5zM3 10l2-2.5h10l2 2.5H3zM1 12.5L3 10h14l2 2.5H1zM6 18v-5.5h8V18H6z" />
                  </svg>
                )}
                {(scene.id !== 'church' && scene.id !== 'garden' && scene.id !== 'forest') && (
                  <span className="text-gray-500 text-xl font-medium">{scene.name.charAt(0)}</span>
                )}
              </div>
            </div>
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{scene.name}</h3>
        <p className="text-gray-600 text-sm">{scene.description}</p>
      </div>
    </div>
  );
};

export default SceneCard; 
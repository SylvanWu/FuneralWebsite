import React, { useState, useEffect } from 'react';
import './VectorToolbar.css';

// Import decoration images
import chocolateImage from '../assets/small picture/chocolate.png';
import milkImage from '../assets/small picture/milk.png';
import strawberryMilkImage from '../assets/small picture/streberry milk.png';
import blueFlowerImage from '../assets/small picture/blue flower.png';
import redTreeImage from '../assets/small picture/red tree.png';
import bianfuImage from '../assets/small picture/bianfu.png';

// Define interfaces
interface VectorItem {
  id: string;
  category: string;
  name: string;
  src: string;
  description?: string;
}

interface VectorToolbarProps {
  onItemDragStart: (e: React.DragEvent<HTMLDivElement>, item: VectorItem) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  onItemClick?: (item: VectorItem) => void;
}

// Define categories
const CATEGORIES = [
  { key: 'plants', label: 'Plants' },
  { key: 'food', label: 'Food' },
  { key: 'symbols', label: 'Symbols' },
];

// Vector items with actual images
const VECTOR_ITEMS: VectorItem[] = [
  // Plants category
  { 
    id: 'blue-flower',
    category: 'plants',
    name: 'Blue Flower',
    src: blueFlowerImage,
    description: 'Elegant blue flowers to express remembrance'
  },
  { 
    id: 'red-tree',
    category: 'plants',
    name: 'Memorial Tree',
    src: redTreeImage,
    description: 'A symbolic tree for growth and lasting memory'
  },
  
  // Food category
  { 
    id: 'chocolate',
    category: 'food',
    name: 'Memorial Chocolate',
    src: chocolateImage,
    description: 'Chocolate offering for the deceased'
  },
  { 
    id: 'milk',
    category: 'food',
    name: 'Milk Offering',
    src: milkImage,
    description: 'Pure milk to symbolize purity and nourishment'
  },
  { 
    id: 'strawberry-milk',
    category: 'food',
    name: 'Strawberry Milk',
    src: strawberryMilkImage,
    description: 'Sweet strawberry milk for comfort'
  },
  
  // Symbols category
  { 
    id: 'bianfu',
    category: 'symbols',
    name: 'Spiritual Symbol',
    src: bianfuImage,
    description: 'A spiritual symbol for protection and guidance'
  },
];

export const VectorToolbar: React.FC<VectorToolbarProps> = ({ onItemDragStart, onCollapseChange, onItemClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [draggedItem, setDraggedItem] = useState<VectorItem | null>(null);

  // Filter items based on search and category
  const filteredItems = VECTOR_ITEMS.filter(item => 
    item.category === activeCategory &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: VectorItem) => {
    setDraggedItem(item);
    
    // Create a drag image
    const dragImage = new Image();
    dragImage.src = item.src;
    dragImage.style.width = '32px';
    dragImage.style.height = '32px';
    e.dataTransfer.setDragImage(dragImage, 16, 16);
    
    // Call parent handler
    onItemDragStart(e, item);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Toggle collapse
  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  return (
    <div className={`vector-toolbar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="toolbar-header">
        {!isCollapsed && (
          <input
            type="text"
            className="search-input"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
        <button 
          className="collapse-button"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Categories */}
      <div className="toolbar-categories">
        {CATEGORIES.map(category => (
          <button
            key={category.key}
            className={`category-button ${activeCategory === category.key ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => setActiveCategory(category.key)}
            title={isCollapsed ? category.label : undefined}
          >
            {!isCollapsed && category.label}
            {isCollapsed && category.label[0]} {/* Show only first letter when collapsed */}
          </button>
        ))}
      </div>

      {/* Vector Items Grid */}
      <div className="toolbar-items">
        {filteredItems.length > 0 ? (
          // Group items by pairs (2 columns)
          Array.from(
            { length: Math.ceil(filteredItems.length / 2) },
            (_, rowIndex) => {
              const rowItems = filteredItems.slice(rowIndex * 2, rowIndex * 2 + 2);
              return (
                <div className="vector-row" key={`row-${rowIndex}`}>
                  {rowItems.map(item => (
                    <div
                      key={item.id}
                      className={`vector-item ${draggedItem?.id === item.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onItemClick?.(item)}
                      title={item.description || item.name}
                    >
                      <img src={item.src} alt={item.name} className="vector-icon" />
                      {!isCollapsed && <span className="vector-label">{item.name}</span>}
                    </div>
                  ))}
                </div>
              );
            }
          )
        ) : (
          <div className="empty-message">
            {searchTerm ? 'No matching items found' : 'No items in this category'}
          </div>
        )}
      </div>
    </div>
  );
};

export type { VectorItem, VectorToolbarProps }; 
import React, { useState, useEffect } from 'react';
import './VectorToolbar.css';

// Import decoration images
import chocolateImage from '../assets/small picture/chocolate.png';
import milkImage from '../assets/small picture/milk.png';
import strawberryMilkImage from '../assets/small picture/streberry milk.png';
import blueFlowerImage from '../assets/small picture/blue flower.png';
import redTreeImage from '../assets/small picture/red tree.png';
import bianfuImage from '../assets/small picture/bianfu.png';
import man1Image from '../assets/small picture/man1.png';
import man2Image from '../assets/small picture/man2.png';
import man3Image from '../assets/small picture/man3.png';
import man4Image from '../assets/small picture/man4.png';
import man5Image from '../assets/small picture/man5.png';
import man6Image from '../assets/small picture/man6.png';
import woman1Image from '../assets/small picture/woman1.png';
import woman2Image from '../assets/small picture/woman2.png';
import woman3Image from '../assets/small picture/woman3.png';
import woman4Image from '../assets/small picture/woman4.png';
import woman5Image from '../assets/small picture/woman5.png';
import woman6Image from '../assets/small picture/woman6.png';
import man7Image from '../assets/small picture/man7.png';
import man8Image from '../assets/small picture/man8.png';
import girl1Image from '../assets/small picture/girl1.png';
import girl2Image from '../assets/small picture/girl2.png';
import grandpa1Image from '../assets/small picture/grandpa1.png';
import grandma1Image from '../assets/small picture/grandma1.png';
import boy1Image from '../assets/small picture/boy1.png';
import boy2Image from '../assets/small picture/boy2.png';
import man9Image from '../assets/small picture/man9.png';
import woman7Image from '../assets/small picture/woman7.png';
import woman8Image from '../assets/small picture/woman8.png';
import boy3Image from '../assets/small picture/boy3.png';
import criedboyImage from '../assets/small picture/cried boy.png';
import girl3Image from '../assets/small picture/girl3.png';
import man10Image from '../assets/small picture/man10.png';
import girl4Image from '../assets/small picture/girl4.png';
import woman9Image from '../assets/small picture/woman9.png';
import boyImage from '../assets/small picture/boy.png';
import girlImage from '../assets/small picture/girl.png';
import SantaClausImage from '../assets/small picture/Santa Claus.png';
import snowmanImage from '../assets/small picture/snowman.png';
import ChristmastreeImage from '../assets/small picture/Christmastree.png';
import elkImage from '../assets/small picture/elk.png';
import redtelevisionImage from '../assets/small picture/redtelevision.png';
import pinktelevisionImage from '../assets/small picture/pinktelevision.png';
import greentelevisionImage from '../assets/small picture/greentelevision.png';
import woman10Image from '../assets/small picture/woman10.png';
import girl5Image from '../assets/small picture/girl5.png';
import girl6Image from '../assets/small picture/girl6.png';
import girl7Image from '../assets/small picture/girl7.png';
import bagImage from '../assets/small picture/bag.png';
import dogImage from '../assets/small picture/dog.png';
import heartImage from '../assets/small picture/heart.png';
import bombImage from '../assets/small picture/Bomb.png';
import womanImage from '../assets/small picture/woman.png';
import woman11Image from '../assets/small picture/woman11.png';
import man0Image from '../assets/small picture/man.png';
import man11Image from '../assets/small picture/man11.png';
import woman12Image from '../assets/small picture/woman12.png';
import man12Image from '../assets/small picture/man12.png';
import man13Image from '../assets/small picture/man13.png';
import man14Image from '../assets/small picture/man14.png';
import man15Image from '../assets/small picture/man15.png';
import man16Image from '../assets/small picture/man16.png';
import man17Image from '../assets/small picture/man17.png';
import cowImage from '../assets/small picture/cow.png';
import cow1Image from '../assets/small picture/cow1.png';
import cattleImage from '../assets/small picture/cattle.png';
import yellowpigImage from '../assets/small picture/yellowpig.png';
import pinkpigImage from '../assets/small picture/pinkpig.png';
import greypigImage from '../assets/small picture/greypig.png';
import chickenImage from '../assets/small picture/chicken.png';
import chicken1Image from '../assets/small picture/chicken1.png';
import chicken2Image from '../assets/small picture/chicken3.png';
import treeImage from '../assets/small picture/tree.png';
import grassImage from '../assets/small picture/grass.png';
import man18Image from '../assets/small picture/man18.png';
import man19Image from '../assets/small picture/man19.png';
import man20Image from '../assets/small picture/man20.png';
import man21Image from '../assets/small picture/man21.png';
import man22Image from '../assets/small picture/man22.png';
import man23Image from '../assets/small picture/man23.png';
import man24Image from '../assets/small picture/man24.png';
import man25Image from '../assets/small picture/man25.png';
import man26Image from '../assets/small picture/man26.png';
import man27Image from '../assets/small picture/man27.png';
import woman13Image from '../assets/small picture/woman13.png';
import woman14Image from '../assets/small picture/woman14.png';
import woman15Image from '../assets/small picture/woman15.png';
import man28Image from '../assets/small picture/man28.png';
import brotherImage from '../assets/small picture/brothers.png';
import driverImage from '../assets/small picture/driver.png';
import driver1Image from '../assets/small picture/driver1.png';
import driver2Image from '../assets/small picture/driver2.png';
import driver3Image from '../assets/small picture/driver3.png';
import grapesImage from '../assets/small picture/grapes.png';
import kiwifruitImage from '../assets/small picture/kiwifruit.png';
import pineappleImage from '../assets/small picture/pineapple.png';
import cherryImage from '../assets/small picture/cherry.png';
import hamimelonImage from '../assets/small picture/hamimelon.png';
import orangeImage from '../assets/small picture/orange.png';
import appleImage from '../assets/small picture/apple.png';
import lemonImage from '../assets/small picture/lemon.png';
import forkliftImage from '../assets/small picture/forklift.png';
import forklift1Image from '../assets/small picture/forklift1.png';
import loaderImage from '../assets/small picture/loader.png';
import loader1Image from '../assets/small picture/loader1.png';
import man29Image from '../assets/small picture/man29.png';
import man30Image from '../assets/small picture/man30.png';
import fireImage from '../assets/small picture/fire.png';
import bonfireImage from '../assets/small picture/bonfire.png';
import fenceImage from '../assets/small picture/fence.png';
import cactusImage from '../assets/small picture/cactus.png';
import blackcatImage from '../assets/small picture/blackcat.png';
import catImage from '../assets/small picture/cat.png';
import treasurechestImage from '../assets/small picture/treasurechest.png';
import treasurechest1Image from '../assets/small picture/treasurechest1.png';
import appletreeImage from '../assets/small picture/appletree.png';
import tree1Image from '../assets/small picture/tree1.png';

interface VectorItem {
  id: string;
  category: string;
  name: string;
  src: string;
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
  { key: 'fruits', label: 'Fruits' },
  { key: 'symbols', label: 'Symbols' },
  { key: 'character', label: 'Character' },
  { key: 'animals', label: 'Animals' },
  { key: 'objects', label: 'Objects' },
];

// Vector items with actual images
const VECTOR_ITEMS: VectorItem[] = [
  // Plants category
  { 
    id: 'blue-flower',
    category: 'plants',
    name: 'Blue Flower',
    src: blueFlowerImage,
  },
    
  { 
    id: 'red-tree',
    category: 'plants',
    name: 'Memorial Tree',
    src: redTreeImage
  },
  { 
    id: 'tree',
    category: 'plants',
    name: 'Tree',
    src: treeImage
  }, 
  { 
    id: 'Christmastree',
    category: 'plants',
    name: 'Christmas Tree',
    src: ChristmastreeImage
  }, 
  { 
    id: 'grass',
    category: 'plants',
    name: 'Grass',
    src: grassImage
  },
  { 
    id: 'cactus',
    category: 'plants',
    name: 'Cactus',
    src: cactusImage
  },
  { 
    id: 'appletree',
    category: 'plants',
    name: 'Apple Tree',
    src: appletreeImage
  },
  { 
    id: 'tree1',
    category: 'plants',
    name: 'Tree',
    src: tree1Image
  },
  // Food category
  { 
    id: 'chocolate',
    category: 'food',
    name: 'Memorial Chocolate',
    src: chocolateImage
  },
  { 
    id: 'milk',
    category: 'food',
    name: 'Milk Offering',
    src: milkImage
  },
  { 
    id: 'strawberry-milk',
    category: 'food',
    name: 'Strawberry Milk',
    src: strawberryMilkImage
  },
  // Fruits category
  { 
    id: 'grapes',
    category: 'fruits',
    name: 'Grapes',
    src: grapesImage
  },
  { 
    id: 'kiwifruit',
    category: 'fruits',
    name: 'Kiwi Fruit',
    src: kiwifruitImage
  },
  { 
    id: 'pineapple',
    category: 'fruits',
    name: 'Pineapple',
    src: pineappleImage
  },
  { 
    id: 'cherry',
    category: 'fruits',
    name: 'Cherry',
    src: cherryImage
  },
  { 
    id: 'hamimelon',
    category: 'fruits',
    name: 'Hamimelon',
    src: hamimelonImage
  },
  { 
    id: 'orange',
    category: 'fruits',
    name: 'Orange',
    src: orangeImage
  },
  { 
    id: 'apple',
    category: 'fruits',
    name: 'Apple',
    src: appleImage
  },
  { 
    id: 'lemon',
    category: 'fruits',
    name: 'Lemon',
    src: lemonImage
  },
  // Symbols category
  { 
    id: 'heart',
    category: 'symbols',
    name: 'Heart',
    src: heartImage
  },
  { 
    id: 'fire',
    category: 'symbols',
    name: 'Fire',
    src: fireImage
  },
  { 
    id: 'bonfire',
    category: 'symbols',
    name: 'Bonfire',
    src: bonfireImage
  },
  
  // Animals category
  { 
    id: 'bianfu',
    category: 'animals',
    name: 'Bat',
    src: bianfuImage
  },
  { 
    id: 'elk',
    category: 'animals',
    name: 'Elk',
    src: elkImage
  },
  { 
    id: 'dog',
    category: 'animals',
    name: 'Dog',
    src: dogImage
  },
  { 
    id: 'cow',
    category: 'animals',
    name: 'Cow',
    src: cowImage
  },
  { 
    id: 'cow1',
    category: 'animals',
    name: 'Cow',
    src: cow1Image
  },
  { 
    id: 'cattle',
    category: 'animals',
    name: 'Cattle',
    src: cattleImage
  },
  { 
    id: 'yellowpig',
    category: 'animals',
    name: 'Yellow Pig',
    src: yellowpigImage
  },
  { 
    id: 'pinkpig',
    category: 'animals',
    name: 'Pink Pig',
    src: pinkpigImage
  },
  { 
    id: 'greypig',
    category: 'animals',
    name: 'Grey Pig',
    src: greypigImage
  },
  { 
    id: 'chicken',
    category: 'animals',
    name: 'Chicken',
    src: chickenImage
  },
  { 
    id: 'chicken1',
    category: 'animals',
    name: 'Chicken',
    src: chicken1Image
  },
  { 
    id: 'chicken2',
    category: 'animals',
    name: 'Chicken',
    src: chicken2Image
  },
  { 
    id: 'blackcat',
    category: 'animals',
    name: 'Black Cat',
    src: blackcatImage
  },
  { 
    id: 'cat',
    category: 'animals',
    name: 'Cat',
    src: catImage
  },
  // Objects category
  { 
    id: 'redtelevision',
    category: 'objects',
    name: 'Red Television',
    src: redtelevisionImage
  },
  { 
    id: 'pinktelevision',
    category: 'objects',
    name: 'Pink Television',
    src: pinktelevisionImage
  },
  { 
    id: 'greentelevision',
    category: 'objects',
    name: 'Green Television',
    src: greentelevisionImage
  },
  { 
    id: 'snowman',
    category: 'objects',
    name: 'Snowman',
    src: snowmanImage
  },
  { 
    id: 'bag',
    category: 'objects',
    name: 'Bag',
    src: bagImage
  },
  { 
    id: 'bomb',
    category: 'symbols',
    name: 'Bomb',
    src: bombImage
  },
  { 
    id: 'forklift',
    category: 'objects',
    name: 'Forklift',
    src: forkliftImage
  },
  { 
    id: 'forklift1',
    category: 'objects',
    name: 'Forklift',
    src: forklift1Image
  },
  { 
    id: 'loader',
    category: 'objects',
    name: 'Loader',
    src: loaderImage
  },
  { 
    id: 'loader1',
    category: 'objects',
    name: 'Loader',
    src: loader1Image
  },
  { 
    id: 'fence',
    category: 'objects',
    name: 'Fence',
    src: fenceImage
  },
  { 
    id: 'treasurechest',
    category: 'objects',
    name: 'Treasure Chest',
    src: treasurechestImage
  },
  { 
    id: 'treasurechest1',
    category: 'objects',
    name: 'Treasure Chest',
    src: treasurechest1Image
  },
  // Character category
  { 
    id: 'man1',
    category: 'character',
    name: 'Man',
    src: man1Image
  },
  { 
    id: 'man2',
    category: 'character',
    name: 'Man',
    src: man2Image
  },
  { 
    id: 'man3',
    category: 'character',
    name: 'Man',
    src: man3Image
  },
  { 
    id: 'woman1',
    category: 'character',
    name: 'Woman',
    src: woman1Image
  },
  { 
    id: 'woman2',
    category: 'character',
    name: 'Woman',
    src: woman2Image
  },
  { 
    id: 'woman3',
    category: 'character',
    name: 'Woman',
    src: woman3Image
  },
  { 
    id: 'man4',
    category: 'character',
    name: 'Man',
    src: man4Image
  },
  { 
    id: 'man5',
    category: 'character',
    name: 'Man',
    src: man5Image
  },
  { 
    id: 'man6',
    category: 'character',
    name: 'Man',
    src: man6Image
  },
  { 
    id: 'woman4',
    category: 'character',
    name: 'Woman',
    src: woman4Image
  },
  { 
    id: 'woman5',
    category: 'character',
    name: 'Woman',
    src: woman5Image
  },
  { 
    id: 'woman6',
    category: 'character',
    name: 'Woman',
    src: woman6Image
  },
  { 
    id: 'man7',
    category: 'character',
    name: 'Man',
    src: man7Image
  },
  { 
    id: 'man8',
    category: 'character',
    name: 'Man',
    src: man8Image
  },
  { 
    id: 'girl1',
    category: 'character',
    name: 'Girl',
    src: girl1Image
  },
  { 
    id: 'girl2',
    category: 'character',
    name: 'Girl',
    src: girl2Image
  },
  { 
    id: 'grandpa1',
    category: 'character',
    name: 'Grandpa',
    src: grandpa1Image
  },
  { 
    id: 'grandma1',
    category: 'character',
    name: 'Grandma',
    src: grandma1Image
  },
  { 
    id: 'boy1',
    category: 'character',
    name: 'Boy',
    src: boy1Image
  },
  { 
    id: 'boy2',
    category: 'character',
    name: 'Boy',
    src: boy2Image
  },
  { 
    id: 'man9',
    category: 'character',
    name: 'Man',
    src: man9Image
  },
  { 
    id: 'woman7',
    category: 'character',
    name: 'Woman',
    src: woman7Image
  },
  { 
    id: 'woman8',
    category: 'character',
    name: 'Woman',
    src: woman8Image
  },
  { 
    id: 'boy3',
    category: 'character',
    name: 'Boy',
    src: boy3Image
  },
  { 
    id: 'criedboy',
    category: 'character',
    name: 'CriedBoy',
    src: criedboyImage
  },
  { 
    id: 'girl3',
    category: 'character',
    name: 'Girl',
    src: girl3Image
  },
  { 
    id: 'man10',
    category: 'character',
    name: 'Man',
    src: man10Image
  },
  { 
    id: 'girl4',
    category: 'character',
    name: 'Girl',
    src: girl4Image
  },
  { 
    id: 'woman9',
    category: 'character',
    name: 'Woman',
    src: woman9Image
  },
  { 
    id: 'boy',
    category: 'character',
    name: 'Boy',
    src: boyImage
  },
  { 
    id: 'girl',
    category: 'character',
    name: 'Girl',
    src: girlImage
  },
  { 
    id: 'SantaClaus',
    category: 'character',
    name: 'Santa Claus',
    src: SantaClausImage
  },
  { 
    id: 'woman10',
    category: 'character',
    name: 'Woman',
    src: woman10Image
  },
  { 
    id: 'girl5',
    category: 'character',
    name: 'Girl',
    src: girl5Image
  },
  { 
    id: 'girl6',
    category: 'character',
    name: 'Girl',
    src: girl6Image
  },
  { 
    id: 'girl7',
    category: 'character',
    name: 'Girl',
    src: girl7Image
  },
  { 
    id: 'woman',
    category: 'character',
    name: 'Woman',
    src: womanImage
  },
  { 
    id: 'woman11',
    category: 'character',
    name: 'Woman',
    src: woman11Image
  },
  { 
    id: 'man0',
    category: 'character',
    name: 'Man',
    src: man0Image
  },
  { 
    id: 'man11',
    category: 'character',
    name: 'Man',
    src: man11Image
  },
  { 
    id: 'woman12',
    category: 'character',
    name: 'Woman',
    src: woman12Image
  },
  { 
    id: 'man12',
    category: 'character',
    name: 'Man',
    src: man12Image
  },
  { 
    id: 'man13',
    category: 'character',
    name: 'Man',
    src: man13Image
  },
  { 
    id: 'man14',
    category: 'character',
    name: 'Man',
    src: man14Image
  },
  { 
    id: 'man15',
    category: 'character',
    name: 'Man',
    src: man15Image
  },
  { 
    id: 'man16',
    category: 'character',
    name: 'Man',
    src: man16Image
  },
  { 
    id: 'man17',
    category: 'character',
    name: 'Man',
    src: man17Image
  },
  { 
    id: 'man18',
    category: 'character',
    name: 'Man',
    src: man18Image
  },
  { 
    id: 'man19',
    category: 'character',
    name: 'Man',
    src: man19Image
  },
  { 
    id: 'man20',
    category: 'character',
    name: 'Man',
    src: man20Image
  },
  { 
    id: 'man21',
    category: 'character',
    name: 'Man',
    src: man21Image
  },
  { 
    id: 'man22',
    category: 'character',
    name: 'Man',
    src: man22Image
  },
  { 
    id: 'man23',
    category: 'character',
    name: 'Man',
    src: man23Image
  },
  { 
    id: 'man24',
    category: 'character',
    name: 'Man',
    src: man24Image
  },
  { 
    id: 'man25',
    category: 'character',
    name: 'Man',
    src: man25Image
  },
  { 
    id: 'man26',
    category: 'character',
    name: 'Man',
    src: man26Image
  },
  { 
    id: 'man27',
    category: 'character',
    name: 'Man',
    src: man27Image
  },
  { 
    id: 'woman13',
    category: 'character',
    name: 'Woman',
    src: woman13Image
  },
  { 
    id: 'woman14',
    category: 'character',
    name: 'Woman',
    src: woman14Image
  },
  { 
    id: 'woman15',
    category: 'character',
    name: 'Woman',
    src: woman15Image
  },
  { 
    id: 'man28',
    category: 'character',
    name: 'Man',
    src: man28Image
  },
  { 
    id: 'brothers',
    category: 'character',
    name: 'Brothers',
    src: brotherImage
  },
  { 
    id: 'driver',
    category: 'character',
    name: 'Driver',
    src: driverImage
  },
  { 
    id: 'driver1',
    category: 'character',
    name: 'Driver',
    src: driver1Image
  },
  { 
    id: 'driver2',
    category: 'character',
    name: 'Driver',
    src: driver2Image
  },
  { 
    id: 'driver3',
    category: 'character',
    name: 'Driver',
    src: driver3Image
  },
  { 
    id: 'man29',
    category: 'character',
    name: 'Man',
    src: man29Image
  },
  { 
    id: 'man30',
    category: 'character',
    name: 'Man',
    src: man30Image
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
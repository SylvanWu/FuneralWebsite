import React, { useState, useEffect } from 'react';
import './TabSelector.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabSelectorProps {
  tabs: TabItem[];
  activeTabId?: string;
  onChange: (tabId: string) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  activeTabId,
  onChange,
  className = '',
  orientation = 'horizontal'
}) => {
  // If no active tab is provided, use the first tab
  const [selectedTabId, setSelectedTabId] = useState<string>(activeTabId || (tabs[0]?.id || ''));
  
  // Update selected tab when activeTabId prop changes
  useEffect(() => {
    if (activeTabId && activeTabId !== selectedTabId) {
      setSelectedTabId(activeTabId);
    }
  }, [activeTabId, selectedTabId]);
  
  // Handle tab selection
  const handleTabClick = (tabId: string) => {
    setSelectedTabId(tabId);
    onChange(tabId);
  };
  
  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === selectedTabId);
    let nextIndex = -1;
    
    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      }
    } else { // vertical
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      }
    }
    
    if (nextIndex !== -1) {
      const nextTabId = tabs[nextIndex].id;
      setSelectedTabId(nextTabId);
      onChange(nextTabId);
    }
  };
  
  // Early return for empty tabs
  if (tabs.length === 0) {
    return null;
  }
  
  return (
    <div 
      className={`tab-selector ${orientation} ${className}`}
      role="tablist"
      aria-orientation={orientation}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          aria-selected={selectedTabId === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          tabIndex={selectedTabId === tab.id ? 0 : -1}
          className={`tab-button ${selectedTabId === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
          onClick={() => !tab.disabled && handleTabClick(tab.id)}
          onKeyDown={(e) => !tab.disabled && handleKeyDown(e, tab.id)}
          disabled={tab.disabled}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabSelector; 
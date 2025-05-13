import React from 'react';
import './TabContent.css';

interface TabContentProps {
  id: string;
  activeId: string;
  children: React.ReactNode;
  className?: string;
}

const TabContent: React.FC<TabContentProps> = ({
  id,
  activeId,
  children,
  className = ''
}) => {
  const isActive = id === activeId;
  
  if (!isActive) return null;
  
  return (
    <div
      id={`tabpanel-${id}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}`}
      className={`tab-content ${className}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
};

interface TabContentSectionProps {
  activeTabId: string;
  children: React.ReactElement<TabContentProps> | React.ReactElement<TabContentProps>[];
  className?: string;
}

export const TabContentSection: React.FC<TabContentSectionProps> = ({
  activeTabId,
  children,
  className = ''
}) => {
  return (
    <div className={`tab-content-section ${className}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<TabContentProps>(child)) return null;
        
        return React.cloneElement(child, {
          activeId: activeTabId
        });
      })}
    </div>
  );
};

export default TabContent; 
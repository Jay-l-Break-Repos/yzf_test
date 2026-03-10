import React from 'react';
import './BrowserElement.css';

interface BrowserElementProps {
  children?: React.ReactNode;
}

export const BrowserElement: React.FC<BrowserElementProps> = ({ children }) => {
  return (
    <div className="browser-element">
      <div className="topbar"></div>
      {children}
    </div>
  );
};

export default BrowserElement;

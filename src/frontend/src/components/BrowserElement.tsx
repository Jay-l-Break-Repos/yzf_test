import React from 'react';
import './BrowserElement.css';

interface BrowserElementProps {
  children?: React.ReactNode;
  iframeSrc?: string;
}

export const BrowserElement: React.FC<BrowserElementProps> = ({ children, iframeSrc }) => {
  return (
    <div className="browser">
      <div className="topbar"></div>
      {iframeSrc ? (
        <iframe className="content" name="content" src={iframeSrc} title="Browser Content" />
      ) : (
        children
      )}
    </div>
  );
};

export default BrowserElement;

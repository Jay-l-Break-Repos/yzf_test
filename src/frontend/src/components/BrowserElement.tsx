import React from 'react';
import './BrowserElement.css';

interface BrowserElementProps {
  iframeSrc?: string;
}

export const BrowserElement: React.FC<BrowserElementProps> = ({ iframeSrc }) => {
  return (
    <div className="browser">
      <div className="topbar"></div>
      <iframe
        className="content"
        name="content"
        src={iframeSrc || 'about:blank'}
        title="Browser Content"
      />
    </div>
  );
};

export default BrowserElement;

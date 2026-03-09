import React from 'react';
import './Blog.css';

interface BlogProps {
  title: string;
  detail: string;
}

export const Blog: React.FC<BlogProps> = ({ title, detail }) => {
  return (
    <div className="blog-container">
      <h2 className="blog-title">{title}</h2>
      <p className="blog-detail">{detail}</p>
    </div>
  );
};

export default Blog;

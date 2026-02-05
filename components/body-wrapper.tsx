'use client';

import React from 'react';

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleCut = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSelectStart = (e: React.SyntheticEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
      e.preventDefault();
    }
  };

  return (
    <div
      onCopy={handleCopy}
      onCut={handleCut}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onSelectStart={handleSelectStart}
      className="contents"
    >
      {children}
    </div>
  );
}

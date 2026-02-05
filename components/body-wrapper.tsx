'use client';

import React, { useEffect, useRef } from 'react';

export function BodyWrapper({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
        e.preventDefault();
      }
    };

    const wrapper = wrapperRef.current;
    if (wrapper) {
      wrapper.addEventListener('selectstart', handleSelectStart);
    }

    return () => {
      if (wrapper) {
        wrapper.removeEventListener('selectstart', handleSelectStart);
      }
    };
  }, []);

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

  return (
    <div
      ref={wrapperRef}
      onCopy={handleCopy}
      onCut={handleCut}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      className="contents"
    >
      {children}
    </div>
  );
}

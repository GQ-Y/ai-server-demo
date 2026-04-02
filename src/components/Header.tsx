import React from 'react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20 flex justify-between items-center w-full px-6 h-16">
      <div className="flex items-center gap-4 min-w-0">
        <h1 className="text-lg font-bold text-primary-container tracking-wide font-headline truncate">
          安全风险质量知识库
        </h1>
      </div>
    </header>
  );
}

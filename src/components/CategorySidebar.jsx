import React from 'react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/mockData';

export default function CategorySidebar({
  activeCategory,
  onSelectCategory,
  activeView,
  setActiveView,
  categories = DEFAULT_CATEGORIES
}) {
  const categoriesList = categories.filter((c) => c.id !== 'custom-studio');

  return (
    <aside className="sidebar-container">
      <h2 className="sidebar-title">Categories</h2>

      <ul className="category-list">
        {categoriesList.map((cat) => {
          const isSelected = activeView === 'catalog' && activeCategory === cat.id;

          let btnClass = 'category-btn';
          if (cat.isPillAccent) {
            btnClass += ' active-pink';
          } else if (isSelected) {
            btnClass += ' active';
          }

          return (
            <li key={cat.id}>
              <button
                className={btnClass}
                onClick={() => {
                  setActiveView('catalog');
                  onSelectCategory(cat.id);
                }}
              >
                <span>{cat.icon || '🪵'}</span>
                <span>{cat.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

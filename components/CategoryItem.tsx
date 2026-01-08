
import React from 'react';
import { Category } from '../types';
import { EditIcon, TrashIcon } from './Icons';

interface CategoryItemProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, onEdit, onDelete }) => {
  return (
    <div className="group animate-slide-up relative bg-white dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
               #{category.orderIndex}
             </span>
             {category.status === 'OPEN' ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 uppercase">
                  Faol
                </span>
             ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 uppercase">
                  {category.status}
                </span>
             )}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-snug">
            {category.nameUz}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
            {category.nameRu || 'No description'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => onEdit(category)}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 transition-colors"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onDelete(category.id)}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryItem;

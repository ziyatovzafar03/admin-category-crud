
import React, { useState, useEffect } from 'react';
import { Category, CategoryRequest } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryRequest) => void;
  initialData?: Category | null;
  chatId: number;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSubmit, initialData, chatId }) => {
  const [formData, setFormData] = useState<CategoryRequest>({
    nameUz: '',
    nameUzCyrillic: '',
    nameRu: '',
    nameEn: '',
    orderIndex: 0,
    chatId: chatId,
    parentId: null
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nameUz: initialData.nameUz,
        nameUzCyrillic: initialData.nameUzCyrillic,
        nameRu: initialData.nameRu,
        nameEn: initialData.nameEn,
        orderIndex: initialData.orderIndex,
        chatId: chatId,
        parentId: initialData.parentId
      });
    } else {
      setFormData({
        nameUz: '',
        nameUzCyrillic: '',
        nameRu: '',
        nameEn: '',
        orderIndex: 0,
        chatId: chatId,
        parentId: null
      });
    }
  }, [initialData, isOpen, chatId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-6 sm:hidden" />
        
        <h2 className="text-2xl font-bold mb-6">
          {initialData ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        </h2>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4 pb-10 sm:pb-0">
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">Kategoriya nomi (O'zb)</label>
            <input 
              required
              value={formData.nameUz}
              onChange={(e) => setFormData({...formData, nameUz: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              placeholder="Masalan: Meva va sabzavotlar"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">Kategoriya nomi (Кирилл)</label>
            <input 
              value={formData.nameUzCyrillic}
              onChange={(e) => setFormData({...formData, nameUzCyrillic: e.target.value})}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              placeholder="Мeva ва сабзавотлар"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">Ruscha nomi</label>
              <input 
                value={formData.nameRu}
                onChange={(e) => setFormData({...formData, nameRu: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                placeholder="Фрукты"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">Inglizcha nomi</label>
              <input 
                value={formData.nameEn}
                onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                placeholder="Fruits"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2 ml-1">Tartib raqami</label>
            <input 
              type="number"
              value={formData.orderIndex}
              onChange={(e) => setFormData({...formData, orderIndex: parseInt(e.target.value) || 0})}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all outline-none"
            />
          </div>

          <div className="flex gap-3 pt-6 sticky bottom-0 bg-white dark:bg-slate-900 pb-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-[2] px-6 py-4 rounded-2xl font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-xl shadow-brand-500/20 transition-all active:scale-95"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;

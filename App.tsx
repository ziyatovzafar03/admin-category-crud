
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from './services/api';
import { User, Category, CategoryRequest, Theme } from './types';
import LoadingScreen from './components/LoadingScreen';
import AccessDenied from './components/AccessDenied';
import CategoryItem from './components/CategoryItem';
import CategoryModal from './components/CategoryModal';
import { PlusIcon, SunIcon, MoonIcon, SearchIcon } from './components/Icons';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Use state for chatId to make it reactive to hash changes
  const [chatId, setChatId] = useState<string | null>(() => {
    const hash = window.location.hash;
    const match = hash.match(/chatId=([^&]+)/);
    return match ? match[1] : null;
  });

  // Handle Hash Redirect & Listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const match = hash.match(/chatId=([^&]+)/);
      setChatId(match ? match[1] : null);
    };

    // Redirect if accessing root / or missing chatId
    if (!window.location.hash || !window.location.hash.includes('chatId=')) {
      window.location.replace('#chatId=123456789');
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Theme Toggler
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      document.documentElement.classList.toggle('dark', newTheme === Theme.DARK);
      return newTheme;
    });
  }, []);

  // Initialization
  useEffect(() => {
    const init = async () => {
      if (!chatId) {
        // Only set error if we aren't in the process of redirecting
        if (window.location.hash.includes('chatId=')) {
          setIsError(true);
          setErrorMessage('URL orqali chatId topilmadi. Iltimos, qayta urinib ko\'ring.');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const userData = await apiService.findUserByChatId(chatId);
        setUser(userData);
        
        if (userData.status === 'CONFIRMED') {
          const catData = await apiService.getCategories();
          setCategories(catData);
        }
      } catch (err) {
        console.error(err);
        setIsError(true);
        setErrorMessage('Server bilan bog\'lanishda xatolik yuz berdi yoki foydalanuvchi topilmadi.');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [chatId]);

  // CRUD Handlers
  const handleAddOrEdit = async (formData: CategoryRequest) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      if (editingCategory) {
        const updated = await apiService.editCategory(editingCategory.id, {
           nameUz: formData.nameUz,
           nameUzCyrillic: formData.nameUzCyrillic,
           nameRu: formData.nameRu,
           nameEn: formData.nameEn,
           orderIndex: formData.orderIndex
        });
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await apiService.addCategory({
           ...formData,
           chatId: user.chatId
        });
        setCategories(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      alert('Amalni bajarishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatdan ham bu kategoriyani oʻchirmoqchimisiz?')) return;
    
    try {
      setIsLoading(true);
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      alert('Kategoriya muvaffaqiyatli o‘chirildi');
    } catch (err) {
      alert('O‘chirishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.nameRu.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.orderIndex - b.orderIndex);
  }, [categories, searchQuery]);

  if (isLoading && !user) return <LoadingScreen />;
  if (isError) return <AccessDenied message={errorMessage} />;
  if (user && user.status !== 'CONFIRMED') return <AccessDenied />;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Boshqaruv Paneli</p>
          <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">Kategoriyalar</h1>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={toggleTheme}
             className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm text-slate-600 dark:text-slate-400 transition-transform active:scale-90"
           >
             {theme === Theme.LIGHT ? <MoonIcon /> : <SunIcon />}
           </button>
           <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-bold truncate max-w-[120px]">{user?.firstname}</span>
              <span className="text-[10px] text-slate-400">@{user?.username}</span>
           </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text"
            placeholder="Kategoriyalarni izlash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 rounded-3xl border-none shadow-sm focus:ring-2 focus:ring-brand-500/20 transition-all outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat) => (
            <CategoryItem 
              key={cat.id} 
              category={cat} 
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <SearchIcon className="w-8 h-8 text-slate-300 dark:text-slate-700" />
             </div>
             <p className="text-slate-400 font-medium">Hech qanday kategoriya topilmadi</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-6 left-6 flex justify-center pointer-events-none">
        <button 
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-brand-500/40 transition-all active:scale-95 active:shadow-lg"
        >
          <PlusIcon className="w-6 h-6" />
          <span>Kategoriya qo'shish</span>
        </button>
      </div>

      {/* Forms Modal */}
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleAddOrEdit}
        initialData={editingCategory}
        chatId={user?.chatId || 0}
      />

      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
           <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default App;

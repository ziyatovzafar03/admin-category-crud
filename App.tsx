
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from './services/api';
import { User, Category, CategoryRequest, Theme } from './types';
import LoadingScreen from './components/LoadingScreen';
import AccessDenied from './components/AccessDenied';
import CategoryItem from './components/CategoryItem';
import CategoryModal from './components/CategoryModal';
import { PlusIcon, SunIcon, MoonIcon, SearchIcon } from './components/Icons';

function App() {
  const DEFAULT_CHAT_ID = '7882316826';
  
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // URL'dan chatId olish funksiyasi
  const getChatIdFromURL = () => {
    const hash = window.location.hash;
    const match = hash.match(/chatId=([^&]+)/);
    return match ? match[1] : null;
  };

  const [chatId, setChatId] = useState<string | null>(getChatIdFromURL());

  // Redirect va Hash mantiqi
  useEffect(() => {
    const handleNavigation = () => {
      const currentChatId = getChatIdFromURL();
      const currentPath = window.location.pathname;

      // Agar noto'g'ri path yoki chatId bo'lmasa redirect
      if (currentPath !== '/' || !currentChatId) {
        window.location.hash = `chatId=${currentChatId || DEFAULT_CHAT_ID}`;
        if (currentPath !== '/') window.history.replaceState(null, '', '/');
      }

      if (currentChatId !== chatId) {
        setChatId(currentChatId || DEFAULT_CHAT_ID);
      }
    };

    handleNavigation();
    window.addEventListener('hashchange', handleNavigation);
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, [chatId]);

  // Ma'lumotlarni yuklash
  useEffect(() => {
    const loadData = async () => {
      if (!chatId) return;

      setIsLoading(true);
      try {
        const userData = await apiService.findUserByChatId(chatId);
        setUser(userData);
        
        if (userData.status === 'CONFIRMED') {
          const catData = await apiService.getCategories();
          setCategories(catData);
          setIsError(false);
        } else {
          setIsError(true);
          setErrorMessage('Profilingiz tasdiqlanmagan.');
        }
      } catch (err) {
        console.error('Data loading error:', err);
        setIsError(true);
        setErrorMessage('Foydalanuvchi topilmadi yoki server xatosi.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [chatId]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const newTheme = prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      document.documentElement.classList.toggle('dark', newTheme === Theme.DARK);
      return newTheme;
    });
  }, []);

  const handleAddOrEdit = async (formData: CategoryRequest) => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (editingCategory) {
        const updated = await apiService.editCategory(editingCategory.id, formData);
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await apiService.addCategory({ ...formData, chatId: user.chatId });
        setCategories(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (err) {
      alert('Xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Oʻchirmoqchimisiz?')) return;
    setIsLoading(true);
    try {
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter(c => c.nameUz.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [categories, searchQuery]);

  // Render bosqichlari
  if (isLoading && !user) return <LoadingScreen />;
  if (isError) return <AccessDenied message={errorMessage} />;
  if (!user) return <LoadingScreen />; // Faqat xavfsizlik uchun

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">Panel</p>
          <h1 className="text-xl font-extrabold">Kategoriyalar</h1>
        </div>
        <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm transition-transform active:scale-90">
          {theme === Theme.LIGHT ? <MoonIcon /> : <SunIcon />}
        </button>
      </header>

      <div className="px-6 pt-6 pb-2">
        <div className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 rounded-3xl outline-none shadow-sm focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(cat => (
            <CategoryItem key={cat.id} category={cat} onEdit={(c) => { setEditingCategory(c); setIsModalOpen(true); }} onDelete={handleDelete} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <SearchIcon className="w-12 h-12 mb-2" />
            <p>Ma'lumot topilmadi</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-8 right-6 left-6 flex justify-center pointer-events-none">
        <button 
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-[2rem] font-bold shadow-2xl transition-all active:scale-95"
        >
          <PlusIcon />
          <span>Qo'shish</span>
        </button>
      </div>

      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleAddOrEdit}
        initialData={editingCategory}
        chatId={user.chatId}
      />

      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-white/20 dark:bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default App;


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

  /**
   * Extract chatId from URL path variable
   * Format expected: /chatId=12345678
   */
  const getChatIdFromURL = useCallback(() => {
    const path = window.location.pathname;
    const match = path.match(/\/chatId=([^/&]+)/);
    return match ? match[1] : null;
  }, []);

  const [chatId, setChatId] = useState<string | null>(() => getChatIdFromURL());

  // 1. Navigation & Redirect Logic
  useEffect(() => {
    const checkRedirect = () => {
      const currentChatId = getChatIdFromURL();
      
      // If the path doesn't contain chatId=... or it's just the root, redirect
      if (!currentChatId) {
        const targetPath = `/chatId=${DEFAULT_CHAT_ID}`;
        window.history.replaceState(null, '', targetPath);
        setChatId(DEFAULT_CHAT_ID);
      } else if (currentChatId !== chatId) {
        setChatId(currentChatId);
      }
    };

    checkRedirect();
    
    // Listen for manual URL changes (back/forward)
    window.addEventListener('popstate', checkRedirect);
    return () => window.removeEventListener('popstate', checkRedirect);
  }, [chatId, getChatIdFromURL]);

  // 2. Data Fetching Logic
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      // Don't fetch until we have a chatId determined by the redirect effect
      if (!chatId) return;

      setIsLoading(true);
      setIsError(false);
      setErrorMessage('');

      try {
        console.log(`Fetching user for chatId: ${chatId}`);
        const userData = await apiService.findUserByChatId(chatId);
        
        if (!isMounted) return;
        setUser(userData);
        
        if (userData.status === 'CONFIRMED') {
          try {
            const catData = await apiService.getCategories();
            if (isMounted) setCategories(catData);
          } catch (catErr) {
            console.error('Failed to load categories:', catErr);
            if (isMounted) {
              setIsError(true);
              setErrorMessage('Kategoriyalarni yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang.');
            }
          }
        } else {
          if (isMounted) {
            setIsError(true);
            setErrorMessage(`Profilingiz holati: ${userData.status}. Kirish uchun faqat tasdiqlangan (CONFIRMED) foydalanuvchilarga ruxsat beriladi.`);
          }
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        if (isMounted) {
          setIsError(true);
          setErrorMessage(err.message || 'Foydalanuvchi ma\'lumotlarini olishda xatolik. Chat ID noto\'g\'ri bo\'lishi mumkin.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
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
      alert('Amalni bajarishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatdan ham oʻchirmoqchimisiz?')) return;
    setIsLoading(true);
    try {
      await apiService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Oʻchirishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .filter(c => c.nameUz.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [categories, searchQuery]);

  // View logic
  if (isLoading && !user && !isError) return <LoadingScreen />;
  if (isError) return <AccessDenied message={errorMessage} />;
  if (!user && !isLoading) return <AccessDenied message="Foydalanuvchi tizimda topilmadi." />;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-col">
          <p className="text-[10px] font-bold text-brand-500 uppercase tracking-widest leading-none mb-1">Kategoriya</p>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">Boshqaruv</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden xs:flex flex-col items-end mr-1">
             <span className="text-xs font-bold dark:text-slate-200">{user?.firstname}</span>
             <span className="text-[9px] text-slate-400">ID: {user?.chatId}</span>
          </div>
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-transform active:scale-90"
            aria-label="Rang rejimini o'zgartirish"
          >
            {theme === Theme.LIGHT ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </header>

      <div className="px-6 pt-6 pb-2">
        <div className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          <input 
            type="text"
            placeholder="Kategoriyalarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 rounded-[1.75rem] outline-none shadow-sm focus:ring-4 focus:ring-brand-500/10 text-slate-800 dark:text-slate-100 transition-all border border-transparent focus:border-brand-500/20"
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4 pb-32">
        {filteredCategories.length > 0 ? (
          filteredCategories.map(cat => (
            <CategoryItem 
              key={cat.id} 
              category={cat} 
              onEdit={(c) => { setEditingCategory(c); setIsModalOpen(true); }} 
              onDelete={handleDelete} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 opacity-40 text-slate-500 dark:text-slate-400">
            <SearchIcon className="w-16 h-16 mb-4 stroke-1" />
            <p className="font-medium">Hech narsa topilmadi</p>
          </div>
        )}
      </main>

      <div className="fixed bottom-8 right-6 left-6 flex justify-center pointer-events-none">
        <button 
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-[2rem] font-bold shadow-2xl shadow-brand-500/30 transition-all active:scale-95 active:shadow-lg"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        onSubmit={handleAddOrEdit}
        initialData={editingCategory}
        chatId={user?.chatId || 0}
      />

      {/* API Interaction Overlay */}
      {isLoading && user && (
        <div className="fixed inset-0 z-[100] bg-slate-950/20 backdrop-blur-[2px] flex items-center justify-center">
           <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export default App;

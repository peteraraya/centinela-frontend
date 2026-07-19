import { useState } from 'react';
import { useFilterStore } from '../../store/useFilterStore';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchLocationQuery } from '../../api';

export const SearchBar = ({ onSearchComplete }: { onSearchComplete?: () => void }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { setFlyToLocation } = useFilterStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Search specifically in Chile
      const data = await fetchLocationQuery(query);
      
      if (data && data.length > 0) {
        const result = data[0];
        setFlyToLocation({
          longitude: parseFloat(result.lon),
          latitude: parseFloat(result.lat),
          zoom: 13
        });
        setQuery('');
        if (onSearchComplete) onSearchComplete();
      } else {
        alert(t('app.locationNotFound'));
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert(t('app.searchError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('app.searchPlaceholder')}
        className="w-full p-2 border rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-600 transition-colors"
      />
      <button 
        type="submit" 
        disabled={loading}
        className="bg-blue-600 dark:bg-blue-700 text-white p-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-900 transition-colors flex items-center justify-center"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
};

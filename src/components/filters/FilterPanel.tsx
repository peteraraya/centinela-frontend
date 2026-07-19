import { useFilterStore } from '../../store/useFilterStore';
import { SearchBar } from './SearchBar';

const FILTERS = [
  { id: 'fire', label: 'Incendios' },
  { id: 'accident', label: 'Accidentes' },
  { id: 'utility', label: 'Cortes Suministro' },
  { id: 'rain', label: 'Lluvias' },
  { id: 'alert', label: 'Alertas (SENAPRED)' },
  { id: 'earthquake', label: 'Sismos' }
];

export const FilterPanel = () => {
  const { hiddenFilters, toggleFilter } = useFilterStore();

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-md w-80 flex flex-col gap-4">
      <div>
        <h2 className="font-bold mb-2 text-gray-800">Ubicación</h2>
        <SearchBar />
      </div>

      <hr className="border-gray-200" />

      <div>
        <h2 className="font-bold mb-2">Filtros</h2>
        <div className="space-y-2">
          {FILTERS.map((filter) => (
            <label key={filter.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={!hiddenFilters.includes(filter.id)}
                onChange={() => toggleFilter(filter.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{filter.label}</span>
            </label>
          ))}
        </div>
        {hiddenFilters.length === 0 && (
          <p className="text-xs text-gray-500 mt-4">Todos los incidentes mostrados.</p>
        )}
      </div>
    </div>
  );
};

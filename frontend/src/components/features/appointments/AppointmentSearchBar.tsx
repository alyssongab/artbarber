import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

interface AppointmentSearchBarProps {
  onSearch: (searchTerm: string) => void;
  onClear: () => void;
  isSearching: boolean;
  placeholder?: string;
}

export default function AppointmentSearchBar({
  onSearch,
  onClear,
  isSearching,
  placeholder = "Buscar por nome do cliente..."
}: AppointmentSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 0) {
      onSearch(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onClear();
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          disabled={isSearching}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={isSearching || searchTerm.trim().length === 0}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isSearching ? 'Buscando...' : 'Buscar'}
      </Button>
    </form>
  );
}

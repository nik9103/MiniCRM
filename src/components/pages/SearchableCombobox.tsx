import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../ui/utils';

interface Option {
  id: number;
  name: string;
}

interface SearchableComboboxProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  allLabel?: string;
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = 'Выбрать...',
  searchPlaceholder = 'Поиск...',
  emptyText = 'Не найдено',
  allLabel = 'Все',
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.name.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const selectedOption = value === 'all' ? null : options.find((opt) => opt.id.toString() === value);
  const displayValue = value === 'all' ? allLabel : selectedOption?.name || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 px-3 font-normal"
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex flex-col">
          <div className="border-b p-2">
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            <button
              onClick={() => {
                onChange('all');
                setOpen(false);
                setSearchQuery('');
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100 cursor-pointer"
            >
              <Check
                className={cn(
                  'h-4 w-4',
                  value === 'all' ? 'opacity-100' : 'opacity-0'
                )}
              />
              {allLabel}
            </button>
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">{emptyText}</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id.toString());
                    setOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-gray-100 cursor-pointer"
                >
                  <Check
                    className={cn(
                      'h-4 w-4',
                      value === option.id.toString() ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.name}
                </button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

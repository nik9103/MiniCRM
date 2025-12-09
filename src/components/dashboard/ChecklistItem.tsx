import { Check } from 'lucide-react';

interface ChecklistItemProps {
  label: string;
  checked: boolean;
}

export function ChecklistItem({ label, checked }: ChecklistItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-blue-600 border-blue-600'
            : 'bg-white border-gray-300'
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={checked ? 'text-gray-900' : 'text-gray-600'}>{label}</span>
    </div>
  );
}

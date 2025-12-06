import { Check } from 'lucide-react';

const Checkbox = ({
  label,
  checked = false,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={`
            w-5 h-5 rounded border-2 transition-all duration-200
            flex items-center justify-center
            ${checked
              ? 'bg-green-600 border-green-600'
              : 'bg-white border-gray-300 hover:border-gray-400'
            }
          `}
        >
          {checked && <Check size={14} className="text-white" />}
        </div>
      </div>
      {label && (
        <span className="ml-2 text-sm text-gray-600">{label}</span>
      )}
    </label>
  );
};

export default Checkbox;

import React from 'react';

type SelectProps = {
    label: string;
    value: string;
    options: string[];
    error?: string;
    className?: string;
    onChange: (value: string) => void;
};
  
const SelectInput: React.FC<SelectProps> = ({ label, value, options, error, onChange, className }) => {
 
    return (
      <div className={className}>
        <label className="cd-block cd-text-lg cd-pt-2 cd-font-sans cd-font-medium">
          {label}
        </label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="cd-mt-1 cd-text-gray-900 dark:cd-text-gray-200 cd-font-sans  cd-block cd-w-full cd-text-lg cd-px-2 cd-py-3 cd-border cd-border-gray-300 dark:cd-border-gray-500 dark:cd-bg-zinc-700 cd-rounded-md cd-shadow-sm focus:cd-outline-none focus:cd-ring-indigo-500 focus:cd-border-indigo-500 lg:cd-text-lg"
        >
          {options.map((option) => (
            <option className=" cd-text-lg" key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
  
        {error && <p className="cd-mt-2 cd-text-sm cd-text-red-600">{error}</p>}
      </div>
    );
  };
  
  export default SelectInput;
  
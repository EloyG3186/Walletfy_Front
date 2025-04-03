import React from 'react'

type NumberInputProps = {
    label: string;
    value: number;
    error?: string;
    className?: string;
    onChange: (value: number) => void;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    (props, ref) => {
        const { label, value, onChange, error, className } = props;
        return (
            <div className={className}>
                <label className="cd-block cd-text-lg cd-pt-2 cd-font-sans cd-font-medium cd-text-gray-800 dark:cd-text-gray-100">
                    {label}
                </label>
                <input
                    ref={ref}
                    type="number"
                    value={value}
                    onChange={
                        (e)=> {
                            onChange(e.target.value ? parseFloat(e.target.value) : 0);
                        }
                    }
                    className="cd-mt-1 cd-px-3 cd-font-sans cd-block cd-w-full cd-text-gray-900 dark:cd-text-gray-200 cd-py-2 dark:cd-bg-zinc-700 cd-border cd-border-gray-300 dark:cd-border-gray-500 cd-rounded-md cd-shadow-sm focus:cd-outline-none fous:cd-ring-indigo"
                />
                {error && <p className="cd-mt-2 cd-text-sm cd-text-red-600">{error}</p>}
            </div>
        );
    }
);

export default NumberInput;
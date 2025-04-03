import moment from "moment";
import { $ } from "@utils/styles";

type DateProps = {
    label: string;
    value: number;
    error?: string;
    className?: string;
    onChange: (value: number) => void;
}

const InputDate = (props: DateProps ) => { 
    const {label, value, error, onChange, className} = props;


    return (
        <div className={`input-date-container ${className}`}>
            <label className="input-date-label cd-pt-2 cd-block cd-text-lg cd-font-sans cd-font-medium ">
                {label}
            </label>
            <input
                type="date"
                value={moment.unix(value).format('YYYY-MM-DD')}
                onChange={(e) => onChange(moment(e.target.value).unix())}
                className={$("input-date  cd-text-gray-900 ",
                            "dark:cd-text-gray-200 cd-font-sans ",
                            "cd-mt-1 cd-block cd-w-full cd-px-3 cd-py-2 ",
                            "dark:cd-bg-zinc-700 cd-border cd-border-gray-300 ",
                            "dark:cd-border-gray-500 cd-rounded-md ",
                            "cd-shadow-sm focus:cd-outline-none ",
                            "fous:cd-ring-indigo")}
            />
            {error && 
            <p className="cd-mt-2 cd-text-sm cd-text-red-600">{error}</p> }
        </div>
    )

};

export default InputDate;
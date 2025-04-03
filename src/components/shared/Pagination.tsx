import { $ } from "@utils/styles"

type PaginationProps<T> = {
    data: T[];
    totalPages: number;
    currentPage: number;
    onChange: (page: number) => void;
    renderItem: (item: T, index: number) => React.ReactNode
};

export const Pagination = <T,>(props: PaginationProps<T>) => {
    const { data, totalPages, currentPage, onChange, renderItem } = props;

    return (

        <div className="cd-flex cd-flex-col cd-gap-y-4 cd-mt-[2rem]">
            <div className="cd-flex cd-flex-row cd-justify-center cd-gap-x-[1rem]">
                {data.map((item, index) => renderItem(item, index))}
            </div>
            <div className="cd-flex cd-justify-center cd-gap-x-4">
                <button
                    className={$('cd-bg-gray-200 cd-px-4 cd-py-2 cd-rounded-lg',
                        currentPage === 1 && 'cd-cursor-not-allowed'
                    )}
                    disabled={currentPage === 1}
                    onClick={() => onChange(currentPage - 1)}
                >
                    Anterior
                </button>
                <button
                    className={$('cd-bg-gray-200 cd-px-4 cd-py-2 cd-rounded-lg',
                        currentPage === totalPages && 'cd-cursor-not-allowed'
                    )}
                    disabled={currentPage === totalPages}
                    onClick={() => onChange(currentPage + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
}
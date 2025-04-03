import React from "react";

type PaginationParams<T> = {
    data?: T[];
    pageSize?: number;
}

export const usePagination = <T>(params: PaginationParams<T>) => {

    const { data = [], pageSize = 3 } = params;
    const [currentPage, setCurrentPage] = React.useState(1);

    const [totalPages, setTotalPages] = React.useState(
        Math.ceil(data.length / pageSize)
    );

    React.useEffect(() => {
        setTotalPages(Math.ceil(data.length / pageSize))
    }, [data,pageSize]);

    const pageData = React.useMemo(() =>{
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;

        return data.slice(start, end);
    }, [data, currentPage, pageSize])

    return {
        currentPage,
        pageData,
        totalPages,
        totalItems: data.length,
        nextPage,
        prevPage,
        goToPage,
    } as const;

    function nextPage(){
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    function prevPage(){
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    }

    function goToPage(page: number){
        setCurrentPage(Math.min(Math.max(page, 1), totalPages))
    }
}
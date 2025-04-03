import { UseQueryResult } from "@tanstack/react-query";

export const isLoadingQuery = (...results: UseQueryResult[]) =>{
    return results.some((result) => result.isLoading);
}

export const isLoadingOrRefetchQuery = (...results: UseQueryResult[]) => {
    return results.some((result) => result.isLoading || result.isFetching);
}

export const isRefethingQuery = (...results: UseQueryResult[]) => {
    return results.some((result) => result.isFetching)
}

export const isLoadingMutation = (...results: any[]) => {
    return results.some((result) => result.isPending && result.isIdle)
}  
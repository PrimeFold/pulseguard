export interface PaginationResponse<T>{
    data:T[];
    pagination:{
        page:number;
        limit:number;
        total:number;
        totalPages:number;
        hasNextPage:boolean;
        hasPreviousPage:boolean;
    }
}

export interface TeamPaginationResponse<T>{
    data:T[];
    metadata:{
        page:number,
        limit:number,
        total:number,
        totalPages:number,
        hasNextPage:boolean;
        hasPreviousPage:boolean;
    }
}


type Pagination = {
    page : number;
    limit : number;
}

export function parsePaginatio(
    searchParams:URLSearchParams
):Pagination{
    const page = Math.max(1 , Number(searchParams.get("page")) || 1);
    const limit = Math.min(8,Math.max(1,Number(searchParams.get("limit") || 8)));

    return{
        page:Math.floor(page),
        limit:Math.floor(limit),
    }
}
import { QueryRequest } from "../models/query.models.js";

export function parseJWT(jwt: string): string {
    const payload = jwt.split('.')[1];
    const json = JSON.parse(atob(payload));
    return json.aid;
}

export function parseQuery(query: qs.ParsedQs): QueryRequest {
    return {
        q: typeof query.q === "string" ? query.q : "",
        in: typeof query.in === "string" ? query.in.split(',') : undefined,
        nin: typeof query.nin === "string" ? query.nin.split(',') : undefined,
        page: typeof query.page === "string" && Number.parseInt(query.page) ? Math.max(1, Number.parseInt(query.page)) : 1,
    }
}
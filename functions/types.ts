/** הטיפוסים המינימליים של Cloudflare Pages Functions ו-D1 שבהם משתמשים כאן */
export interface D1Stmt { bind(...v: unknown[]): D1Stmt; run(): Promise<unknown>; first<T>(): Promise<T | null> }
export interface Env { DB: { prepare(sql: string): D1Stmt } }
export interface Ctx { request: Request; env: Env; next(): Promise<Response> }

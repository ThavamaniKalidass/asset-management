declare const pool: import("pg").Pool;
export default pool;
export declare function query(text: string, params?: any[]): Promise<import("pg").QueryResult<any>>;
export declare function getClient(): Promise<import("pg").PoolClient>;
//# sourceMappingURL=db.d.ts.map
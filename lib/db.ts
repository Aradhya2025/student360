import { neon } from "@neondatabase/serverless";

// Single cached connection — reused across requests in the same runtime
const sql = neon(process.env.DATABASE_URL!);

export default sql;

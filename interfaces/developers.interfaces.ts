import { QueryResult } from "pg";

interface IDeveloperRequest {
    name: string
    email: string
}

interface IDeveloper extends IDeveloperRequest {
    developerInfoId: number | null
}

type IDeveloperRequiredKeys = 'name' | 'email'
type DeveloperResult = QueryResult<IDeveloper>

export { IDeveloperRequest, IDeveloper, DeveloperResult, IDeveloperRequiredKeys }
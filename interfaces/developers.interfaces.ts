import { QueryResult } from "pg";

interface IDeveloperRequest {
    name : string
    email: string
}

interface IDeveloper extends IDeveloperRequest {
    id: number | null
}

type IDeveloperRequiredKeys = 'name' | 'email'
type DeveloperResult        = QueryResult<IDeveloper>

interface IDeveloperWithInfo extends IDeveloper {
    developerInfoDeveloperSince: Date
    developerInfoPreferredOS   : string
}

type DeveloperInfoResult = QueryResult<IDeveloperWithInfo>

interface IDeveloperInfo {
    DeveloperSince: Date
    PreferredOS   : string
}

type DeveloperInfoRequiredKeys = {
    developerInfoDeveloperSince: string;
    developerInfoPreferredOS   : string;
    id                         : number;
}

export { IDeveloperRequest, IDeveloper, DeveloperResult, IDeveloperRequiredKeys, IDeveloperWithInfo, IDeveloperInfo, DeveloperInfoResult, DeveloperInfoRequiredKeys }
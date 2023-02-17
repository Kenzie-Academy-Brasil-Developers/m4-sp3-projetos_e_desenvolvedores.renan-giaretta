import { QueryResult } from "pg";

interface IDeveloperRequest {
    developerName: string
    developerEmail: string
}

interface IDeveloper extends IDeveloperRequest {
    developerInfoId: number | null
}

type IDeveloperRequiredKeys = 'developerName' | 'developerEmail'
type DeveloperResult = QueryResult<IDeveloper>

interface IDeveloperWithInfo extends IDeveloper {
    developerInfoDeveloperSince: Date
    developerInfoPreferredOS: string
}

type DeveloperInfoResult = QueryResult<IDeveloperWithInfo>

interface IDeveloperInfo {
    developerInfoDeveloperSince: Date
    developerInfoPreferredOS: string
}


type DeveloperInfoRequiredKeys = {
    developerInfoDeveloperSince: string;
    developerInfoPreferredOS: string;
    id: number;
}
export { IDeveloperRequest, IDeveloper, DeveloperResult, IDeveloperRequiredKeys, IDeveloperWithInfo, IDeveloperInfo, DeveloperInfoResult, DeveloperInfoRequiredKeys }
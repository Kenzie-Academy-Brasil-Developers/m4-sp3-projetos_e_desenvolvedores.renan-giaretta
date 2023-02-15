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




interface IDeveloperInfo extends IDeveloper {
    developerInfoDeveloperSince: Date
    developerInfoPreferredOS: string
}


type DeveloperInfoResult = QueryResult<IDeveloperInfo>



export { IDeveloperRequest, IDeveloper, DeveloperResult, IDeveloperRequiredKeys, IDeveloperInfo, DeveloperInfoResult }
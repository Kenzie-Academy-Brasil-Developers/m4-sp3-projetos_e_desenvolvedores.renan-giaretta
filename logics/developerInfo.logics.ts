import { QueryResult } from 'pg';
import { QueryConfig } from 'pg';
import { Request, Response } from "express"
import { client } from "../database/config"
import format from 'pg-format';
import { IDeveloperWithInfo } from '../interfaces/developers.interfaces';


const createNewDeveloperInfo = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const developerInfoDataRequest: IDeveloperWithInfo = request.body
        const developerInfoData: IDeveloperWithInfo        = {
            ...developerInfoDataRequest
        }
        const queryString: string = format(`
            INSERT INTO
                developers_info(%I)
            VALUES 
                (%L)
            RETURNING*;    
        `,
        Object.keys(developerInfoData),
        Object.values(developerInfoData)
        )
        const queryResult             = await client.query(queryString)
        const developerInfoId: number = parseInt(queryResult.rows[0].id)
        const developerId: number     = parseInt(request.params.id)
        const queryStringInfo: string = `
            UPDATE
                developers
            SET
                "developerInfoId" = ($1)
            WHERE
                "id" = $2
            RETURNING *;
        `
        const queryConfig: QueryConfig = {
            text  : queryStringInfo,
            values: [ developerInfoId, developerId ]
        }
        await client.query(queryConfig)
        return response.status(201).json(queryResult.rows[0])
    } catch (error) {
        if (error instanceof Error){
            if(error.message === "duplicate key value violates unique constraint \"developers_email_key\""){
                return response.status(400).json('E-mail already exists.')
            }
        } else if (error instanceof Error) {
            return response.status(400).json({
                message: 'BAD REQUEST'
            })
        }
    return response.status(500).json('Internal server error.')
    }
}

const validateDeveloperInfoUpdateData = (payload: any) => {
    const requiredKeys: Array<string> = ['developerSince', 'preferredOS']
    const containRequiredKey: boolean = requiredKeys.some(key=> key in payload)
    if(!containRequiredKey) {
        throw new Error ('Required keys are developerSince or preferredOS.')
    } 
    const filteredKeys = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'developerSince' | 'preferredOS'] = payload[key]
    return acc
    }, {} as { developerSince: Date, preferredOS: string })
    return filteredKeys
}

const updateDeveloperInfo = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const developerId: number           = parseInt(request.params.id)
        const developerInfoDataRequest: any = validateDeveloperInfoUpdateData(request.body)
        const developerInfoData             = {
        ...developerInfoDataRequest
        }
        const queryString = `
            SELECT
                *
            FROM
                developers
            WHERE
                "id" = $1
        `
        const queryConfigDev: QueryConfig = {
            text  : queryString,
            values: [developerId]
        }
        const queryResultDev: QueryResult = await client.query(queryConfigDev)
        const developerInfoId: number     = parseInt(queryResultDev.rows[0].developerInfoId)
        const queryFormatUpdateInfo       = format(`
            UPDATE
                developers_info
            SET 
                (%I) = ROW (%L)
            WHERE
                "id" = (%L)
            RETURNING *;
        `,
        Object.keys(developerInfoData),
        Object.values(developerInfoData),developerInfoId
        );
        const queryResultUpdateInfo: QueryResult = await client.query(queryFormatUpdateInfo)
        return response.status(200).json(queryResultUpdateInfo.rows[0])
    } catch (error) {
        if(error instanceof Error) {
            if( error.message === "invalid input value for enum \"OS\": \"Other OS\"" ){
                return response.status(400).json({
                    message: 'Preferred OS must be Windows, Linux or MacOS'
                })
            }}
        if ( error instanceof Error){
            return response.status(400).json({
                message: error.message
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


export { createNewDeveloperInfo, updateDeveloperInfo, }
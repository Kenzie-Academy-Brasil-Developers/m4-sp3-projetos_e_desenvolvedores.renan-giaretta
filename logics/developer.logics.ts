import { QueryConfig, QueryResult } from 'pg';
import format from 'pg-format'
import { DeveloperInfoResult, DeveloperResult, IDeveloper, IDeveloperRequest } from './../interfaces/developers.interfaces'
import { client } from './../database/config'
import { Request, Response } from 'express'

const validateDeveloperData = (payload: any) => {
    const requiredKeys: Array<string> = ['name', 'email']
    const payloadKeys: any            = Object.keys(payload)

    if (!requiredKeys.every(key => payloadKeys.includes(key))) {
        throw new Error(`Required keys are ${requiredKeys}`)
    }
    const filteredKeys: IDeveloperRequest = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'name' | 'email'] = payload[key]
    return acc
    }, {} as { name: string, email: string })
    return filteredKeys
}

const createNewDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const developerDataRequest: IDeveloperRequest = validateDeveloperData(request.body)
        const developerData: IDeveloperRequest        = {
            ...developerDataRequest
        }
        const queryString: string = format(`
        INSERT INTO
            developers(%I)
        VALUES 
            (%L)
            RETURNING *;  
        `,
        Object.keys(developerData),
        Object.values(developerData)        
        )
        const queryResult: DeveloperResult = await client.query(queryString)
        const newDeveloper: IDeveloper     = queryResult.rows[0]
        return response.status(201).json(newDeveloper)
    } catch (error) {
        if(error instanceof Error){
            if(error.message === "duplicate key value violates unique constraint \"developers_email_key\""){
                return response.status(400).json('E-mail already exists.')
            }
            return response.status(400).json({
                message: error.message
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


const getAllDevelopers = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const queryString: string = `
        SELECT dev."id", dev."name", dev."email", di."id" AS "developerInfoId", to_char(di."developerSince", 'MM/DD/YYYY') AS                "developerInfoDeveloperSince", di."preferredOS" AS "developerInfoPreferredOS"
        FROM developers dev
        LEFT JOIN developers_info di ON dev."developerInfoId" = di."id"
        `
        const queryResult: DeveloperInfoResult = await client.query(queryString)
        return response.status(200).json(queryResult.rows)
    } catch (error) {
        if( error instanceof Error) {
            return response.status(400).json({
                message: 'BAD REQUEST'
            })
        }
        return response.status(500).json({
            message: 'Internal server error.'
        })
    }
}


const getDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    try {
    const developerId: number = Number(request.params.id)
    const queryString: string = `
    SELECT 
        dev."id", dev."name", dev."email", di."id" AS "developerInfoId", to_char(di."developerSince", 'MM/DD/YYYY') AS                "developerInfoDeveloperSince", di."preferredOS" AS "developerInfoPreferredOS"
    FROM 
        developers dev
    LEFT JOIN developers_info di ON dev."developerInfoId" = di."id"
    WHERE
        dev."id" = $1
    `
    const QueryConfig: QueryConfig = {
        text  : queryString,
        values: [developerId]
    };
        const queryResult: DeveloperInfoResult = await client.query(QueryConfig)
        if(queryResult.rows.length === 0 ){
            return response.status(404).json('Developer not found.')
        }else{
            return response.status(200).json(queryResult.rows[0])
        }
    } catch (error) {
        if(error instanceof Error){
            return response.status(400).json({
                message: 'BAD REQUEST'
            })
        }
    }
    return response.status(500).json({
        message: 'internal server error'
    })
}


const validateDeveloperUpdateData = (payload: any) => {
    const requiredKeys: Array<string> = ['name', 'email']
    const containRequiredKey: boolean = requiredKeys.some(key=> key in payload)
    if(!containRequiredKey) {
        throw new Error ('Required keys are name or email.')
    }
    const filteredKeys = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'name' | 'email'] = payload[key]
    return acc
    }, {} as { name: string, email: string })
    return filteredKeys
}


const updateDeveloper = async ( request: Request, response: Response ): Promise<Response> => {

    try {
    const developerId: number                     = parseInt(request.params.id)
    const developerDataRequest: IDeveloperRequest = validateDeveloperUpdateData(request.body)
    const developerData                           = {
        ...developerDataRequest
    }
    const queryString: string = format(`
    UPDATE
        developers
    SET
        (%I) = ROW (%L)
    WHERE
        "id" = $1
        RETURNING*;
    `,
    Object.keys(developerData),
    Object.values(developerData)    
    )
    const QueryConfig: QueryConfig = {
        text  : queryString,
        values: [developerId]
    }
    const queryResult: QueryResult = await client.query(QueryConfig)
    return response.status(200).json(queryResult.rows[0])
    } catch (error) {
        if (error instanceof Error){
            if(error.message === "duplicate key value violates unique constraint \"developers_email_key\""){
                return response.status(409).json({
                    message: 'Email already exists'
                })
            }
        } if( error instanceof Error) {
            return response.status(400).json({
                message: error.message
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


const deleteDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    try {
    const developerId: number = parseInt(request.params.id)
    const queryString: string = `
    DELETE FROM
        developers
    WHERE 
        "id" = $1
    `
    const queryConfig = {
        text  : queryString,
        values: [developerId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    if(queryResult.rowCount === 1){
        return response.status(204).json()
    }
    else {
        return response.status(400).json('BAD REQUEST')
    }
    } catch (error) {
        return response.status(500).json({
            message: 'Internal server error.'
        })
    }
}

export { createNewDeveloper, getDeveloper, getAllDevelopers, updateDeveloper, deleteDeveloper, }
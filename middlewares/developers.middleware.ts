import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";


const verifyDeveloperInfoData = async (request: Request, response: Response, next: NextFunction) =>{
    const developerId: number = parseInt(request.params.id)
    const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE 
            "id" = ($1)
    `
    const queryConfig: QueryConfig = {
        text  : queryString,
        values: [developerId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    if(queryResult.rows.length === 0){
        return response.status(404).json('Developer not found')
    } else if (queryResult.rows[0].developerInfoId !== null){
        return response.status(409).json({
            message: 'Developer info already exists.'
        })
    } else if ( request.body.preferredOS !== 'Linux' && request.body.preferredOS !== 'Windows' && request.body.preferredOS !== 'MacOS' )
        return response.status(400).json({
            message: 'Preferred OS must be Windows, Linux or MacOS'
    })
    next()
}

const checkDeveloperId = async ( request:Request, response: Response, next: NextFunction  ) =>{
    const developerId: number = parseInt(request.params.id)
    const queryString: string = `
        SELECT
            *
        FROM
            developers
        WHERE
            "id" = $1
    `;
    const queryConfig: QueryConfig = {
        text  : queryString,
        values: [developerId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    if (!queryResult.rows[0]){
        return response.status(404).json({
            message: 'Developer Not Found.'
        })
    }
    next()
}

const checkDeveloperEmail = async ( request: Request, response: Response, next: NextFunction ) => {
    const developerEmail: string = request.body.email
    const queryString: string    = `
        SELECT
            *
        FROM
            developers
        WHERE
            "email" = $1
    `;
    const queryConfig: QueryConfig = {
        text  : queryString,
        values: [developerEmail]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    if(queryResult.rows[0]) {
        return response.status(409).json({
            message: 'E-mail already exists.'
        })
    }
    next()
}

export { verifyDeveloperInfoData, checkDeveloperId, checkDeveloperEmail }
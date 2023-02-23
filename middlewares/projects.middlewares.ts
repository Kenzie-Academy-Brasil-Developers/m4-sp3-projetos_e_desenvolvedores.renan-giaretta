import { NextFunction, Request, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import { client } from "../database";


const checkProjectsDeveloperId = async ( request:Request, response: Response, next: NextFunction  ) =>{
    try {
        const developerId: number = parseInt(request.body.developerId)
        const queryString         = `
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
                message: `Developer not found.`
            })
        }
    } catch (error) {
    }
    next()
}


const checkProjectId = async ( request: Request, response: Response, next: NextFunction ) => {
    const projectId: number = parseInt(request.params.id)
    const queryString       = `
        SELECT
            *
        FROM
            projects
        WHERE
            "id" = $1
    `
    const queryConfig: QueryConfig = {
        text  : queryString,
        values: [projectId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    if(!queryResult.rows[0]){
        return response.status(404).json({
            message: 'Project not found.'
        })
    }
    next()
}


export { checkProjectsDeveloperId, checkProjectId }
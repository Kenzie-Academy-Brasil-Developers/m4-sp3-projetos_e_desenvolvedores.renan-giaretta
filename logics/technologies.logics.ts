import { Request, Response } from "express"
import { QueryConfig, QueryResult } from "pg"
import format from "pg-format"
import { client } from "../database/config"


const registerTechnologyOnProject = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const projectId: number       = parseInt(request.params.id)
        const technologyData          = request.body
        const queryStringTech: string = `
            SELECT
                *
            FROM
                technologies
            WHERE
                name = $1
        `
        const queryConfigTech: QueryConfig = {
            text  : queryStringTech,
            values: [technologyData.name]
        }
        const queryResultTech: QueryResult = await client.query(queryConfigTech)
        const addTech                      = {
            addedIn     : new Date().toLocaleDateString(),
            projectId   : projectId,
            technologyId: Number(queryResultTech.rows[0].id)
        }
        const queryFormat = format(`
            INSERT INTO
                projects_technologies (%I)
            VALUES
                (%L)
            RETURNING *;
        `,
        Object.keys(addTech),
        Object.values(addTech)
        )
        const queryResultAddTech: QueryResult = await client.query(queryFormat)
        return response.status(200).json(queryResultAddTech.rows)
    } catch (error) {
        if ( error instanceof Error ) {
            if( error.message === "Cannot read properties of undefined (reading 'id')" ){
                return response.status(400).json({
                    message: 'Technology not supported'
                })
            }
        }
        if( error instanceof Error) {
            return response.status(400).json({
                message: 'BAD REQUEST'
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}

const deleteTechnologyFromProject = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const projectId: number   = parseInt(request.params.id)
        const queryString: string = `
            SELECT
                *
            FROM
                technologies
            WHERE
                name = $1
        `
        const queryConfig: QueryConfig = {
            text  : queryString,
            values: [request.params.name]
        }
        const queryResult: QueryResult  = await client.query(queryConfig)
        const techId: number            = parseInt(queryResult.rows[0].id)
        const queryStringVerify: string = `
            SELECT
                *
            FROM projects_technologies
            WHERE "technologyId" = $1 AND "projectId" = $2
        `
        const queryConfigVerify: QueryConfig = {
            text  : queryStringVerify,
            values: [techId, projectId]
        }
        const queryResultVerify: QueryResult = await client.query(queryConfigVerify)
        const deleteTechId: number           = parseInt(queryResultVerify.rows[0].id)
        const queryStringDelete: string      = `
            DELETE FROM
                projects_technologies
            WHERE
                "id" = $1
        `
        const queryConfigDelete: QueryConfig = {
            text  : queryStringDelete,
            values: [deleteTechId]
        }
        await client.query(queryConfigDelete)
        return response.status(204).json()
    } catch (error) {
        if ( error instanceof Error ) {
            if ( error.message === "Cannot read properties of undefined (reading 'id')" ){
                return response.status(404).json({
                    message: 'Technology not supported'
                })
            }
        }
        if ( error instanceof Error ) {
            return response.status(400).json({
                message: error.message
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


export { registerTechnologyOnProject, deleteTechnologyFromProject }
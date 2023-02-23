import { Request, Response } from 'express';
import { QueryConfig, QueryResult } from 'pg';
import format from "pg-format"
import { client } from '../database/config';


const validateProjectData = ( payload: any) => {
    const requiredKeys: Array<string> = ['name', 'description', 'estimatedTime', 'repository', 'startDate', 'developerId']
    const payloadKeys: any            = Object.keys(payload)
    if (!requiredKeys.every(key => payloadKeys.includes(key))) {
        throw new Error(`Required keys are ${requiredKeys}`)
    }
    const filteredKeys = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'name' | 'email' | 'description' | 'estimatedTime' | 'repository' | 'startDate' | 'developerId'  ] = payload[key]
    return acc
    }, {} as { name: string, email: string, description: string, estimatedTime: Date, repository: string, startDate: Date, developerId: string })
    return filteredKeys
}


const createNewProject = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const projectDataRequest = validateProjectData(request.body)
        const projectData        = {
            ...projectDataRequest
        }
        const queryFormat = format(`
            INSERT INTO
                projects(%I)
            VALUES(%L)
            RETURNING*;    
        `,
        Object.keys(projectData),
        Object.values(projectData)
        )
        const queryResult: QueryResult = await client.query(queryFormat)
        return response.status(201).json(queryResult.rows[0])
        } catch (error) {
            if(error instanceof Error){
                return response.status(400).json({
                    message: error.message
                })
            }
        }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


const validateUpdateProjectData = ( payload: any ) => {
    const requiredKeys: Array<string> = ['endDate', 'estimatedTime']
    const payloadKeys: any            = Object.keys(payload)
    if (!requiredKeys.some(key => payloadKeys.includes(key))) {
        const keys = requiredKeys.join(', ')
        throw new Error(`Required keys are ${keys}`)
    }
    const filteredKeys: any = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'endDate' |'estimatedTime'  ] = payload[key]
    return acc
    }, {} as { endDate: Date, estimatedTime: string})
    return filteredKeys
}


const getProject = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const projectId: number   = parseInt(request.params.id)
        const queryString: string = `
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
        return response.status(209).json(queryResult.rows[0])
    } catch (error) {
        if( error instanceof Error ) {
            return response.status(400).json({
                message: 'BAD REQUEST'
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error'
    })
}


const getAllProjects = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const queryString: string = `
            SELECT
                *
            FROM
                projects
        `
        const queryResult = await client.query(queryString)
        return response.status(200).json(queryResult.rows)
    } catch (error) {
        if (error instanceof Error){
            return response.status(400).json({
                message: 'BAD REQUEST'
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


const updateProject = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const projectId: number  = parseInt(request.params.id)
        const projectDataRequest = validateUpdateProjectData(request.body)
        const projectData        = {
            ...projectDataRequest
        }
        const queryFormat = format(`
            UPDATE
                projects
            SET
                (%I) = ROW (%L)
            WHERE
                "id" = $1
        `,
        Object.keys(projectData),
        Object.values(projectData)
        )
        const queryConfig: QueryConfig = {
            text  : queryFormat,
            values: [projectId]
        }
        const queryResult: QueryResult = await client.query(queryConfig)
        return response.status(200).json(projectData)
    } catch (error) {
        if( error instanceof Error) {
            return response.status(400).json({
                message: error.message
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


const deleteProject = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const projectId: number   = parseInt(request.params.id)
        const projectDataRequest  = request.body
        const projectData         = {
            ...projectDataRequest
        }
        const queryString: string = format(`
            DELETE FROM
                projects
            WHERE
                "id" = $1
            RETURNING*;
        `,
        Object.keys(projectData),
        Object.values(projectData)
        )
        const queryConfig: QueryConfig = {
            text  : queryString,
            values: [projectId]
        }
        await client.query(queryConfig)
        return response.status(204).json()
    } catch (error) {
        if (error instanceof Error) {
            return response.status(400).json({
                message: 'BAD REQUEST'
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


const getAllProductsFromDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const developerId: number = parseInt(request.params.id)
        const queryString: string = `
            SELECT
                dev."id" AS "developerID",
                dev."name" AS "developerName",
                dev."email" AS "developerEmail",
                dev."developerInfoId" AS "developerInfoID",
                to_char(di."developerSince", 'YYYY/MM/DD') AS "developerInfoSince",
                di."preferredOS" AS "developerInfoPreferredOS",
                proj."id" AS "projectID",
                proj."name" AS "projectName",
                proj."description" AS "projectDescription",
                proj."estimatedTime" AS "projectEstimatedTime",
                proj."repository" AS "projectRepository",
                to_char(proj."startDate", 'YYYY/MM/DD') AS "projectStartDate",
                to_char(proj."endDate", 'YYYY/MM/DD') AS "projectEndDate",
                proj."developerId" AS "projectDeveloperID",
                tech."id" AS "technologyID",
                tech."name" AS "technologyName"
            FROM
                projects proj
            LEFT JOIN
                projects_technologies pt ON pt."projectId" = proj."id"
            LEFT JOIN
                technologies tech ON tech."id" = pt."technologyId"
            LEFT JOIN
                developers dev ON dev."id" = proj."developerId"
            LEFT JOIN
                developers_info di ON di."id" = dev."developerInfoId"
            WHERE
                proj."developerId" = $1
        `
        const queryConfig: QueryConfig = {
            text  : queryString,
            values: [developerId]
        }
        const queryResult: QueryResult = await client.query(queryConfig)
        if ( queryResult.rows.length === 0 ) {
            return response.status(200).json({
                message: 'Developer does not belong to any project.'
            })
        }else {
            return response.status(200).json(queryResult.rows)
        }
    } catch (error) {
        if ( error instanceof Error ) {
            return response.status(400).json({
                message: 'BAD REQUEST'
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


export { createNewProject, updateProject, deleteProject, getAllProductsFromDeveloper,   getProject, getAllProjects, }
import { Request, response, Response } from "express";
import { QueryConfig, QueryResult } from "pg";
import format from "pg-format";
import { client } from "../database";
import { IDeveloperRequest, IDeveloper, DeveloperResult, IDeveloperRequiredKeys, IDeveloperInfo, DeveloperInfoResult, IDeveloperWithInfo, DeveloperInfoRequiredKeys } from './../interfaces/developers.interfaces'



const validateDeveloperData = (payload: any) => {
    const requiredKeys: Array<string> = ['developerName', 'developerEmail']
    const payloadKeys = Object.keys(payload)

    if (!requiredKeys.every(key => payloadKeys.includes(key))) {
        throw new Error(`Required keys are ${requiredKeys}`)
    }
    const filteredKeys = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'developerInfoDeveloperSince' | 'developerEmail'] = payload[key]
    return acc
    }, {} as { developerInfoDeveloperSince: string, developerEmail: string })
    return filteredKeys
}

const createNewDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const developerDataRequest = validateDeveloperData(request.body)
        const developerData = {
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
        const newDeveloper: IDeveloperRequest = queryResult.rows[0]
        console.log(queryResult.rows[0])
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
        SELECT dev."developerId", dev."developerName", dev."developerEmail", dev."developerInfoId", di."developerInfoDeveloperSince", di."developerInfoPreferredOS"
            FROM developers dev
        LEFT JOIN developer_infos di ON dev."developerInfoId" = di."id";
        `
        const queryResult: DeveloperInfoResult = await client.query(queryString)
        return response.status(200).json(queryResult.rows)
    } catch (error) {
        if( error instanceof Error) {
            return response.status(400).json({
                message: 'BAD REQUEST.'
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
    SELECT dev."developerId", dev."developerName", dev."developerEmail", dev."developerInfoId", di."developerInfoDeveloperSince", di."developerInfoPreferredOS"
    FROM developers dev
    LEFT JOIN developer_infos di ON dev."developerInfoId" = di."id"
    WHERE 
    "developerId" = $1
    `
    const QueryConfig: QueryConfig = {
        text: queryString,
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
                message: error.message
            })
        }
    }
    return response.status(500).json({
        message: 'internal server error'
    })
}


const getAllProductsFromDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const updateDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    const developerId: number = parseInt(request.params.id)
    const developerDataRequest = request.body
    const developerData = {
        ...developerDataRequest
    }
    const queryString: string = format(`
    UPDATE
        developers
    SET
        (%I) = ROW (%L)
    WHERE
        "developerId" = $1
        RETURNING*;
    `,
    Object.keys(request.body),
    Object.values(request.body)    
    )
    const QueryConfig: QueryConfig = {
        text: queryString,
        values: [developerId]
    }
    const queryResult: QueryResult = await client.query(QueryConfig)



    return response.status(201).json(queryResult.rows[0])
}

const deleteDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const developerId: number = parseInt(request.params.id)
    const queryString: string = `
    DELETE FROM
        developers
    WHERE 
        "developerId" = $1    
    `
    const queryConfig = {
        text: queryString,
        values: [developerId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    console.log(queryResult.rowCount)
    if(queryResult.rowCount === 1){
        return response.status(204).json()
    }
    else {
        return response.status(404).json('Developer not found.')
    }
    } catch (error) {
        return response.status(500).json({
            message: 'Internal server error.'
        })
    }
}

const validateDeveloperInfoData = (payload: any) => {
    const keys = Object.keys(payload)
    const requiredKeys = ['developerInfoDeveloperSince', 'developerInfoPreferredOS', 'id'];
    const containsAllrequired: boolean = requiredKeys.every(key => {
        return keys.includes(key)
    })
    if (!containsAllrequired || keys.length > 3) {
        throw new Error (`Required Keys are ${requiredKeys}`)
    }
    return payload
}


const createNewDeveloperInfo = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const developerInfoDataRequest = validateDeveloperInfoData(request.body)
    const developerInfoData = {
        ...developerInfoDataRequest
    }
    const queryString: string = format(`
    INSERT INTO
        developer_infos(%I)
    VALUES 
        (%L)
    RETURNING*;    
    `,
    Object.keys(developerInfoData),
    Object.values(developerInfoData)
    )
    const queryResult = await client.query(queryString)
    const newDeveloperInfo = queryResult.rows[0] 
    return response.status(201).json(newDeveloperInfo)
    } catch (error) {
        if (error instanceof Error) {
            return response.status(400).json({
                message: error.message
            })
        }
    }
    return response.status(500).json('Internal server error.')
}

const updateDeveloperInfo = async ( request: Request, response: Response ): Promise<Response> => {
    const developerId: number = parseInt(request.params.id)
    const developerDataRequest: IDeveloperInfo = (request.body)
    const developerData = {
        ...developerDataRequest
    }
    const queryFormat = format(`
    UPDATE
        developer_infos
    SET 
        (%I) = ROW (%L)
    WHERE
        "id" = $1
    `,
    Object.keys(developerData),
    Object.values(developerData)
    )
    const QueryConfig: QueryConfig = {
        text: queryFormat,
        values: [developerId]
    }
    const queryResult: QueryResult = await client.query(QueryConfig)
    return response.status(200).json(queryResult.rows[0])

}

// PROJECTS

const createNewProject = async ( request: Request, response: Response ): Promise<Response> => {
    const projectDataRequest = request.body
    const projectData = {
        ...projectDataRequest
    }
    const queryFormat = format(`
    INSERT INTO
        projects(%I)
    VALUES(%L)
    RETURNING*;    
    `,
    Object.keys(request.body),
    Object.values(request.body)
    )
    const queryResult: QueryResult = await client.query(queryFormat)
    return response.status(201).json(queryResult.rows[0])
}

const getProject = async ( request: Request, response: Response ): Promise<Response> => {
    const projectId: number = parseInt(request.params.id)
    const queryString = `
    SELECT 
        *
    FROM
        projects
    WHERE
        "projectsId" = $1
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    return response.status(209).json(queryResult.rows[0])
}

const getAllProjects = async ( request: Request, response: Response ): Promise<Response> => {
    const queryString: string = `
    SELECT
        *
    FROM
        projects
    `
    const queryResult = await client.query(queryString)
    return response.status(200).json(queryResult.rows)
}

const updateProject = async ( request: Request, response: Response ): Promise<Response> => {
    const projectId: number = parseInt(request.params.id)
    const projectDataRequest = request.body
    const projectData = {
        ...projectDataRequest
    }
    const queryFormat = format(`
    UPDATE
        projects
    SET
        (%I) = ROW (%L)
    WHERE
        "projectsId" = $1
    `,
    Object.keys(projectData),
    Object.values(projectData)
    )
    const queryConfig: QueryConfig = {
        text: queryFormat,
        values: [projectId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    return response.status(200).json(projectData)
}

const deleteProject = async ( request: Request, response: Response ): Promise<Response> => {
    const projectId = parseInt(request.params.id)
    const projectDataRequest = request.body
    const projectData = {
        ...projectDataRequest
    }
    const queryString: string = format(`
    DELETE FROM
        projects
    WHERE
        "projectsId" = $1
    RETURNING*;
    `,
    Object.keys(projectData),
    Object.values(projectData)
    )
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [projectId]
    }
    const queryResult: QueryResult = await client.query(queryConfig)
    return response.status(200).json(queryResult.rows[0]) 
}

const registerTechnologyOnProject = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const deleteTechnologyFromProject = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}



export { createNewDeveloper, getDeveloper, getAllDevelopers, getAllProductsFromDeveloper, updateDeveloper, deleteDeveloper, createNewDeveloperInfo, updateDeveloperInfo, createNewProject, getProject, getAllProjects, updateProject, deleteProject, registerTechnologyOnProject, deleteTechnologyFromProject }
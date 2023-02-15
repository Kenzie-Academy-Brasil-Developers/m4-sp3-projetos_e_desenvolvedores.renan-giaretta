import { Request, response, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import { IDeveloperRequest, IDeveloper, DeveloperResult, IDeveloperRequiredKeys, IDeveloperInfo, DeveloperInfoResult } from './../interfaces/developers.interfaces'



const validateDeveloperData = (payload: any) => {
    const requiredKeys: Array<string> = ['developerName', 'developerEmail']
    const payloadKeys = Object.keys(payload)

    if (!requiredKeys.every(key => payloadKeys.includes(key))) {
        throw new Error(`Required keys are ${requiredKeys}`)
    }
    const filteredKeys = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'developerName' | 'developerEmail'] = payload[key]
    return acc
    }, {} as { developerName: string, developerEmail: string })
    return filteredKeys
}

const createNewDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const developerDataRequest: IDeveloperRequest = validateDeveloperData(request.body)
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
            return response.status(400).json({
                message: error.message
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}


// ------UNFINISHED------
const getAllDevelopers = async ( request: Request, response: Response ): Promise<Response> => {
    try {
        const queryString: string = `
        SELECT dev."developerId", dev."developerName", dev."developerEmail", di."developerInfoDeveloperSince", di."developerInfoPreferredOS"
            FROM developers dev
        LEFT JOIN developer_infos di ON dev."developerInfoId" = di."id";
        `
        const queryResult: DeveloperInfoResult = await client.query(queryString)
        return response.status(200).json(queryResult.rows)
    } catch (error) {
        if( error instanceof Error) {
            return response.status(400).json({
                message: error.message
            })
        }
        return response.status(500).json({
            message: 'Internal server error.'
        })
    }
}

const getDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const getAllProductsFromDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const updateDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const deleteDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const createNewDeveloperInfo = async ( request: Request, response: Response ): Promise<Response> => {
    const developerInfoDataRequest: IDeveloperInfo = request.body
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
    return response.status(201).json({ newDeveloperInfo })
}

const updateDeveloperInfo = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

// PROJECTS

const createNewProject = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const getProject = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const getAllProjects = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const updateProject = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
}

const deleteProject = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
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
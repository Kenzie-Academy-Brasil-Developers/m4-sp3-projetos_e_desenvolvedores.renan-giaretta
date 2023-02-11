import { Request, response, Response } from "express";
import format from "pg-format";
import { client } from "../database";
import { IDeveloperRequest, IDeveloper, DeveloperResult, IDeveloperRequiredKeys } from './../interfaces/developers.interfaces'



const validateDeveloperData = (payload: any) => {
    const requiredKeys: Array<string> = ['name', 'email']
    const payloadKeys = Object.keys(payload)

    if (!requiredKeys.every(key => payloadKeys.includes(key))) {
        throw new Error(`Required keys are ${requiredKeys}`)
    }
    const filteredKeys = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'name' | 'email'] = payload[key]
    return acc
    }, {} as { name: string, email: string })
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
                message: `O email ${request.body.email} já está cadastrado.`
            })
        }
    }
    return response.status(500).json({
        message: 'Internal server error.'
    })
}

const getAllDevelopers = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
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

const createNewInfo = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
    })
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



export { createNewDeveloper, getDeveloper, getAllDevelopers, getAllProductsFromDeveloper, updateDeveloper, deleteDeveloper, createNewInfo, updateDeveloperInfo, createNewProject, getProject, getAllProjects, updateProject, deleteProject, registerTechnologyOnProject, deleteTechnologyFromProject }
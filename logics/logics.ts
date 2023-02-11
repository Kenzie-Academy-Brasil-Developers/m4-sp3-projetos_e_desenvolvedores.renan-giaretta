import { Request, Response } from "express";
import format from 'pg-format'




const createNewDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
    return response.status(201).json({
        message: 'aaa'
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
import { Request, Response } from 'express';
import { QueryConfig, QueryResult } from 'pg';
import format from 'pg-format';
import { client } from '../database';
import { IDeveloperRequest, IDeveloper, DeveloperResult, DeveloperInfoResult } from './../interfaces/developers.interfaces'



const validateDeveloperData = (payload: any) => {
    const requiredKeys: Array<string> = ['name', 'email']
    const payloadKeys: any            = Object.keys(payload)

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
        const developerData                           = {
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
    const payloadKeys: any            = Object.keys(payload)

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



const createNewDeveloperInfo = async ( request: Request, response: Response ): Promise<Response> => {
    try {
    const developerInfoDataRequest = request.body
    const developerInfoData        = {
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
    const queryResult = await client.query(queryString)

    const developerInfoId: number = parseInt(queryResult.rows[0].id)
    const developerId: number     = parseInt(request.params.id)
    
    const putInfoOnDeveloper: string = `
    UPDATE
        developers
    SET
        "developerInfoId" = ($1)
    WHERE
        "id" = $2
    RETURNING *;
    `
    const queryConfig: QueryConfig = {
        text  : putInfoOnDeveloper,
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
                message: 'cla'
            })
    }
    return response.status(500).json('Internal server error.')
}
}

const validateDeveloperInfoUpdateData = (payload: any) => {
    const requiredKeys: Array<string> = ['developerSince', 'preferredOS']
    const payloadKeys: any            = Object.keys(payload)

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


        const queryFormatUpdateInfo = format(`
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


  // PROJECTS--------------------------------------------------------------------------------------------------------------


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
    const filteredKeys = Object.keys(payload).filter(key => requiredKeys.includes(key)).reduce((acc, key) => {
    acc[key as 'endDate' |'estimatedTime'  ] = payload[key]
    return acc
    }, {} as { endDate: Date, estimatedTime: string})
    return filteredKeys

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


const getProject = async ( request: Request, response: Response ): Promise<Response> => {
    try {
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



const deleteProject = async ( request: Request, response: Response ): Promise<Response> => {
    try {
    const projectId          = parseInt(request.params.id)
    const projectDataRequest = request.body
    const projectData        = {
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
    const queryResult: QueryResult = await client.query(queryConfig)
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
    const developerId = parseInt(request.params.id)
    const queryString = `
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

    const addTech = {
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
    const projectId           = parseInt(request.params.id)
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
    const queryResult: QueryResult = await client.query(queryConfig)
    const techId: number           = parseInt(queryResult.rows[0].id)

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

    const deleteTechId: number = parseInt(queryResultVerify.rows[0].id)

    const queryStringDelete: string = `
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



export { createNewDeveloper, getDeveloper, getAllDevelopers, getAllProductsFromDeveloper, updateDeveloper, deleteDeveloper, createNewDeveloperInfo, updateDeveloperInfo, createNewProject, getProject, getAllProjects, updateProject, deleteProject, registerTechnologyOnProject, deleteTechnologyFromProject }
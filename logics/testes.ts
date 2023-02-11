// const validateDeveloperData = (payload: any): IDeveloperRequest =>{
//     const keys: Array<string> = Object.keys(payload)
//     const requiredKeys: Array<IDeveloperRequiredKeys> = ['name', 'email']
//     const containsAllRequired: boolean = (requiredKeys.every((key: string) =>{
//         return keys.includes(key)
//     } ) )
//     if(!containsAllRequired || keys.length > 2){
//         throw new Error(`Required keys are ${requiredKeys}`)
//     }
//     console.log(`O payload é ${payload}`)
//     return payload
// }

// const createNewDeveloper = async ( request: Request, response: Response ): Promise<Response> => {
//     try {
//         const developerDataRequest: IDeveloperRequest = validateDeveloperData(request.body)
//         const developerData = {
//             ...developerDataRequest
//         }
//         const queryString: string = format(`
//         INSERT INTO
//             developers(%I)
//         VALUES 
//             (%L)
//             RETURNING *;  
//         `,
//         Object.keys(developerData),
//         Object.values(developerData)        
//         )
//         const queryResult: DeveloperResult = await client.query(queryString)
//         const newDeveloper: IDeveloperRequest = queryResult.rows[0]
//         console.log(queryResult.rows[0])
//         return response.status(201).json(newDeveloper)
//     } catch (error) {
//         if(error instanceof Error){
//             return response.status(400).json({
//                 message: error.message
//             })
//         }
//     }
//     return response.status(500).json({
//         message: 'Internal server error.'
//     })
// }
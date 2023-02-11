// import { NextFunction, RequestHandler } from 'express'
// import { IDeveloperRequest, IDeveloperRequiredKeys,  } from './../interfaces/developers.interfaces'



// const validateDeveloperData: RequestHandler = (request, response, next) =>{
//     try {
//         const payload: any = request.body
//         const keys: Array<string> = Object.keys(payload)
//         const requiredKeys: Array<IDeveloperRequiredKeys> = ['name', 'email']
//         const containsAllRequired: boolean = (requiredKeys.every((key: string) =>{
//         return keys.includes(key)
//     } ) )
//     if(!containsAllRequired || keys.length > 2){
//         throw new Error(`Required keys are ${requiredKeys}`)
//     }else {
//         console.log(`O payload é ${payload}`)
//     }
//     } catch (error) {
//         console.log('error')
//     }
    
//     next()
// }

// export { validateDeveloperData }
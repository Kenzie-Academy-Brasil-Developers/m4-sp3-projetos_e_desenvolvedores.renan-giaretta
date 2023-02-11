import * as express from 'express'


declare global {
    namespace Express {
        interface Request {
            indexList   : number
            validateDeveloperData: {
            name        : string,
            email    : string
            }
        }
        interface Response {
            status      : number
        }
    }
}
import express, { Application, Request, Response } from 'express'
import { startDatabase } from './../database'



const app: Application = express()
app.use(express.json())

app.listen( 3000, async () => {
    await startDatabase()
    console.log('Server is online.')
} )

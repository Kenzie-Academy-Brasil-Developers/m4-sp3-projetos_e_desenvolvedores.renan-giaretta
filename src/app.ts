import express, { Application } from 'express'
import { startDatabase } from './../database'
import { createNewDeveloper, createNewDeveloperInfo, createNewProject, deleteDeveloper, deleteProject, deleteTechnologyFromProject, getAllDevelopers, getAllProductsFromDeveloper, getAllProjects, getDeveloper, getProject, registerTechnologyOnProject, updateDeveloper, updateDeveloperInfo, updateProject } from './../logics/logics'
import { checkDeveloperEmail, checkDeveloperId, verifyDeveloperInfoData } from './../middlewares/developers.middleware'

const app: Application = express()
app.use(express.json())

app.post('/developers', createNewDeveloper)
app.get('/developers', getAllDevelopers)
app.get('/developers/:id', getDeveloper)
app.get('/developers/:id/projects', getAllProductsFromDeveloper)
app.patch('/developers/:id', checkDeveloperId, updateDeveloper)
app.delete('/developers/:id', deleteDeveloper)
app.post('/developers/:id/infos', verifyDeveloperInfoData, createNewDeveloperInfo)
app.patch('/developers/:id/infos', updateDeveloperInfo)

app.post('/projects', createNewProject)
app.get('/projects/:id', getProject)
app.get('/projects', getAllProjects)
app.patch('/projects/:id', updateProject)
app.delete('/projects/:id', deleteProject)
app.post('/projects/:id/technologies', registerTechnologyOnProject)
app.delete('/projects/:id/technologies/:name', deleteTechnologyFromProject)

app.listen( 3000, async () => {
    await startDatabase()
    console.log('Server is online.')
} )

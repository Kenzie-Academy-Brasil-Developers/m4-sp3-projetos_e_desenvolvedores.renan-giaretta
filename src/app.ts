import express, { Application } from 'express'
import { startDatabase } from './../database'
import { createNewDeveloper, deleteDeveloper, getAllDevelopers, getDeveloper, updateDeveloper } from './../logics/developer.logics'
import { createNewDeveloperInfo, updateDeveloperInfo } from './../logics/developerInfo.logics'
import { createNewProject, deleteProject, getAllProductsFromDeveloper, getAllProjects, getProject, updateProject } from './../logics/projects.logics'
import { deleteTechnologyFromProject, registerTechnologyOnProject } from './../logics/technologies.logics'
import { checkDeveloperEmail, checkDeveloperId, verifyDeveloperInfoData } from './../middlewares/developers.middleware'
import { checkProjectId, checkProjectsDeveloperId } from './../middlewares/projects.middlewares'

const app: Application = express()
app.use(express.json())

app.post('/developers', createNewDeveloper)
app.get('/developers', getAllDevelopers)
app.get('/developers/:id', getDeveloper)
app.patch('/developers/:id', checkDeveloperId, updateDeveloper)
app.delete('/developers/:id', checkDeveloperId, deleteDeveloper) 
app.post('/developers/:id/infos', verifyDeveloperInfoData, createNewDeveloperInfo)
app.patch('/developers/:id/infos', checkDeveloperId, updateDeveloperInfo)

app.get('/developers/:id/projects', checkDeveloperId, getAllProductsFromDeveloper)
app.post('/projects', checkProjectsDeveloperId, createNewProject)
app.get('/projects/:id', checkProjectId, getProject)
app.get('/projects', getAllProjects)
app.patch('/projects/:id', checkProjectId, checkProjectsDeveloperId, updateProject)
app.delete('/projects/:id', checkProjectId, deleteProject)
app.post('/projects/:id/technologies', checkProjectId, registerTechnologyOnProject)
app.delete('/projects/:id/technologies/:name', checkProjectId, deleteTechnologyFromProject)

app.listen( 3000, async () => {
    await startDatabase()
    console.log('Server is online.')
} )

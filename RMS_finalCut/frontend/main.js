import express from 'express'
 
const app = express()
 
import path from 'path'
const staticPath = path.join(process.cwd(),'dist')
app.use(express.static(staticPath))
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'))
})
 
app.listen(82, () => {
    console.log('listening on port http://localhost:82')
})
 
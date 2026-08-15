const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/todos/', async (req, res) => {
  const {search_q = '', priority = '', status = ''} = req.query
  const a = `
  select
  *
  from 
  todo
  where
  status like "%${status}%" and
  priority like "%${priority}%" and
  todo like "%${search_q}%"
    `
  const aa = await db.all(a)
  res.send(aa)
})

app.get('/todos/:todoId', async (req, res) => {
  const {todoId} = req.params
  const a = `
  select
  *
  from 
  todo
  where
  id=${todoId}
    `
  const aa = await db.get(a)
  res.send(aa)
})

app.put('/todos/:todoId', async (req, res) => {
  const {todoId} = req.params
  const {status, priority, todo} = req.body
  if (status !== undefined) {
    const a = `
  update
  todo
  set
  status="${status}"
  where
  id=${todoId}
    `
    await db.run(a)
    res.send('Status Updated')
  } else if (priority !== undefined) {
    const a = `
  update
  todo
  set
  priority="${priority}"
  where
  id=${todoId}
    `
    await db.run(a)
    res.send('Priority Updated')
  } else if (todo !== undefined) {
    const a = `
  update
  todo
  set
  todo="${todo}"
  where
  id=${todoId}
    `
    await db.run(a)
    res.send('Todo Updated')
  }
})
app.post('/todos/', async (req, res) => {
  const {id, todo, priority, status} = req.body
  const a = `
  insert into todo(id,todo,priority,status)
  values(${id},"${todo}","${priority}","${status}")
  `
  await db.run(a)
  res.send('Todo Successfully Added')
})

app.delete('/todos/:todoId', async (req, res) => {
  const {todoId} = req.params
  const a = `
  delete from todo
  where
  id=${todoId}
    `
  await db.run(a)
  res.send('Todo Deleted')
})

module.exports = app

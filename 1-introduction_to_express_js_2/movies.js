const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
const port = 3000
const intialiseAndDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(port, () => {
      console.log(`Server is running ${port}`)
    })
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}
intialiseAndDBServer()

app.get('/movies/', async (req, res) => {
  const a = `
    select
    movie_name as movieName
    from
    movie
    `
  const aa = await db.all(a)
  res.send(aa)
})

app.post('/movies/', async (req, res) => {
  const {directorId, movieName, leadActor} = req.body
  const a = `
  insert into movie(director_id,movie_name,lead_actor)
  values(${directorId},"${movieName}","${leadActor}")
  `
  const aa = await db.run(a)
  res.send('Movie Successfully Added')
})

app.get('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  const a = `
    select
    movie_id as movieId,
    director_id as directorId,
    movie_name as movieName,
    lead_actor as leadActor
    from
    movie natural join director
    where
    movie_id=${movieId}
    `
  const aa = await db.get(a)
  res.send(aa)
  console.log(aa)
})
app.put('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  const {directorId, movieName, leadActor} = req.body
  const a = `
    update
    movie
    set
    director_id=${directorId},
    movie_name="${movieName}",
    lead_actor="${leadActor}"
    where
    movie_id=${movieId}
    `

  const aa = await db.run(a)
  res.send('Movie Details Updated')
})
app.delete('/movies/:movieId', async (req, res) => {
  const {movieId} = req.params
  const a = `
    delete from 
    movie
    where
    movie_id=${movieId}
    `

  const aa = await db.run(a)
  res.send('Movie Removed')
})

app.get('/directors/', async (req, res) => {
  const a = `
    select
    director_id as directorId,
    director_name as directorName
    from
    director
    `
  const aa = await db.all(a)
  res.send(aa)
  console.log(aa)
})

app.get('/directors/:directorId/movies/', async (req, res) => {
  const {directorId} = req.params

  const movies = await db.all(
    `SELECT movie_name AS movieName
         FROM movie natural join director
         WHERE director_id = '${directorId}' 
          `,
  )

  res.send(movies)
  console.log(movies)
})

module.exports = app
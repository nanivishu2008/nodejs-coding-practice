const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')

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

app.get('/players/', async (req, res) => {
  const a = `
    select
    player_id as playerId,
    player_name as playerName
    from
    player_details
    `
  const aa = await db.all(a)
  res.send(aa)
})

app.get('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  const a = `
    select
    player_id as playerId,
    player_name as playerName
    from
    player_details
    where
    player_id=${playerId}
    `
  const aa = await db.get(a)
  res.send(aa)
})

app.put('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  const {playerName} = req.body
  const a = `
    update
    player_details
    set
    player_name="${playerName}"
    where
    player_id=${playerId}
    `
  const aa = await db.run(a)
  res.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (req, res) => {
  const {matchId} = req.params
  const a = `
    select
    match_id as matchId,
    match,
    year
    from
    match_details
    where
    match_id=${matchId}
    `
  const aa = await db.get(a)
  res.send(aa)
})

app.get('/players/:playerId/matches', async (req, res) => {
  const {playerId} = req.params
  const a = `
    select
    match_id as matchId,
    match,
    year
    from
    match_details natural join player_match_score
    where
    player_id=${playerId}
    
    `
  const aa = await db.all(a)
  res.send(aa)
})

app.get('/matches/:matchId/players', async (req, res) => {
  const {matchId} = req.params
  const a = `
    select
    player_id as playerId,
    player_name as playerName
    from
    player_details natural join player_match_score
    where
    match_id=${matchId}
    `
  const aa = await db.all(a)
  res.send(aa)
})

app.get('/players/:playerId/playerScores', async (req, res) => {
  const {playerId} = req.params
  const a = `
    select
    player_id as playerId,
    player_name as playerName,
    sum(score) as totalScore,
    sum(fours) as totalFours,
    sum(sixes) as totalSixes
    from
    player_details natural join player_match_score
    where
    player_id=${playerId}
    
    `
  const aa = await db.get(a)
  res.send(aa)
})

module.exports = app

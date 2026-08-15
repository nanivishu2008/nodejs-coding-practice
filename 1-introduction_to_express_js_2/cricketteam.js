const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null
const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('The server is running on 3000')
    })
  } catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}
initialiseDBAndServer()

app.get('/players/', async (req, res) => {
  const a = `
    select
    player_id as playerId,
    player_name as playerName,
    jersey_number as jerseyNumber,
    role as role
    from
    cricket_team`
  const aa = await db.all(a)
  res.send(aa)
})

app.post('/players/', async (req, res) => {
  const {playerName, jerseyNumber, role} = req.body
  const a = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES (
      '${playerName}',
      ${jerseyNumber},
      '${role}'
    )
    `
  await db.run(a)
  res.send('Player Added to Team')
})

app.get('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  const a = `
    select
    player_id as playerId,
    player_name as playerName,
    jersey_number as jerseyNumber,
    role as role
    from
    cricket_team
    where
    player_id=${playerId}`
  const aa = await db.get(a)
  res.send(aa)
})
app.put('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  const {playerName, jerseyNumber, role} = req.body
  const a = `
    update
    cricket_team
    set
    player_name='${playerName}',
    jersey_number='${jerseyNumber}',
    role='${role}'
    where
    player_id=${playerId}
    `
  await db.run(a)
  res.send('Player Details Updated')
})
app.delete('/players/:playerId', async (req, res) => {
  const {playerId} = req.params
  const {playerName, jerseyNumber, role} = req.body
  const a = `
    delete from
    cricket_team
    where
    player_id=${playerId}
    `
  await db.run(a)
  res.send('Player Removed')
})

module.exports = app
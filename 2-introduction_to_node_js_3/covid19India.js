const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'covid19India.db')

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

app.get('/states/', async (req, res) => {
  const a = `
    select
    state_id as stateId,
    state_name as stateName,
    population
    from
    state`
  const aa = await db.all(a)
  res.send(aa)
})

module.exports = app

app.get('/states/:stateId', async (req, res) => {
  const {stateId} = req.params
  const a = `
    select
    state_id as stateId,
    state_name as stateName,
    population
    from
    state
    where
    state_id=${stateId}
    `
  const aa = await db.get(a)
  res.send(aa)
})

app.post('/districts/', async (req, res) => {
  const {districtName, stateId, cases, cured, active, deaths} = req.body
  const a = `
    insert into district(district_name,state_id,cases,cured,active,deaths)
    values("${districtName}",${stateId},"${cases}","${cured}","${active}","${deaths}")
    `
  const aa = await db.run(a)
  res.send('District Successfully Added')
})

app.get('/districts/:districtId', async (req, res) => {
  const {districtId} = req.params
  const a = `
    select
    district_id as districtId,
    district_name as districtName,
    state_id as stateId,
    cases,
    cured,
    active,
    deaths
    from
    district
    where
    district_id=${districtId}
    `
  const aa = await db.get(a)
  res.send(aa)
})

app.delete('/districts/:districtId', async (req, res) => {
  const {districtId} = req.params
  const a = `
    delete from district
    where
    district_id=${districtId}
    `
  const aa = await db.run(a)
  res.send('District Removed')
})

app.put('/districts/:districtId', async (req, res) => {
  const {districtId} = req.params
  const {districtName, stateId, cases, cured, active, deaths} = req.body
  const a = `
    update
    district
    set
    district_name="${districtName}",
    state_id=${stateId},
    cases="${cases}",
    cured="${cured}",
    active="${active}",
    deaths="${deaths}"
    where
    district_id=${districtId}
    `
  const aa = await db.run(a)
  res.send('District Details Updated')
})

app.get('/states/:stateId/stats', async (req, res) => {
  const {stateId} = req.params
  const a = `
    select
    sum(cases) as totalCases,sum(cured) as totalCured, sum(active) as totalActive, sum(deaths) as totalDeaths
    from
    district
    where
    state_id=${stateId}
    group by
    state_id
    `
  const aa = await db.get(a)
  res.send(aa)
})

app.get('/districts/:districtId/details/', async (req, res) => {
  const {districtId} = req.params
  const a = `
    select
    state_name as stateName
    from
    district inner join state on district.state_id=state.state_id
    where
    district_id=${districtId}
    group by
    district_id
    `
  const aa = await db.get(a)
  res.send(aa)
})

module.exports = app

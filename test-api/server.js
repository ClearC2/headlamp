import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import cors from 'cors'
import fs from 'fs'
import document from '../src/api-route-provider'

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.put('/ticket/2.0/workorder/update', function (req, res) {
  return res.status(201).json({
    'message': 'Work order updated successfully.'
  })
})

app.put('/companies/:unid/workorder/:id/foobar', function (req, res) {
  return res.status(201).json({
    'message': 'Work order updated successfully.'
  })
})

document(app, {
  routes: path.resolve(__dirname, 'routes'),
  src: path.resolve(__dirname, '..', 'test-src'),
  server: path.resolve(__dirname, '..', 'test-api'),
  // title: 'Example API Docs',
  description: String(fs.readFileSync(path.resolve(__dirname, '..', 'readme.md'))),
  hidePath: path.resolve(__dirname, '..'),
  responses: [
    {
      title: 'Error',
      description: 'Typical error',
      status: 400,
      response: {
        errors: [
          {detai: 'Something went wrong :('}
        ]
      }
    },
    () => ({
      title: 'Critical Error',
      description: 'Typical error',
      status: 500,
      response: {
        errors: [
          {detai: 'Something went realllly wrong >:('}
        ]
      }
    })
  ]
})

const PORT = process.env.PORT || 5033
app.listen(PORT, () => {
  console.log('Dev Express server running at localhost:' + PORT) // eslint-disable-line
})

module.exports = {
  path: '/puppy/:id',
  method: 'GET',
  responses: [{
    title: 'ok',
    status: 200,
    response: {puppy: {name: 'Cooper'}}
  }]
}

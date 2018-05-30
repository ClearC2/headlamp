module.exports = {
  path: '/people/:id',
  description: '[Google](http://google.com)',
  params: {
    id: {
      value: 'abc',
      help: 'this is some help text'
    }
  },
  query: {
    startDate: {
      help: 'Format MM-DD-YYYY'
    }
  },
  methods: ['post', 'put', 'get'],
  title: 'Get all people',
  payload: {
    data: {
      blah: 'blah blah'
    }
  },
  response: (req, res) => {
    if (req.method === 'POST') {
      return res.status(400).json({
        errors: [
          {detail: 'Something went wrong :('}
        ]
      })
    }

    if (req.method === 'PUT') {
      return res.status(500).json({
        errors: [
          {detail: 'CRITICAL FAILURE'}
        ]
      })
    }
    return res.status(200).json({
      test: 123,
      foo: false,
      people: [
        {
          name: 'John Doe'
        },
        {
          name: 'Bob Smith'
        }
      ]
    })
  }
}

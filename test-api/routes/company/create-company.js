const description = `

This *is* some **text**. Action can be found at \`company/actions.saveCompany()\`.

test
`

module.exports = {
  path: '/companies',
  methods: ['post'],
  title: 'Create a company',
  description: description,
  payload: {
    data: {
      blah: 'blah blah'
    }
  },
  response: (req, res) => {
    return res.status(200).json({
      company: {
        name: 'blah blah'
      }
    })
  },
  responses: [
    {
      title: 'All good',
      description,
      status: 200,
      response: {
        foo: 'bar'
      }
    },
    () => ({
      title: 'Unauthorized',
      status: 401,
      response: require('./_dummy')
    }),
    {
      title: 'No bueno',
      status: 500,
      response: {
        errors: [
          {error: 'Something went wrong :('}
        ]
      }
    }
  ]
}

# Headlamp

Generate express api documentation automagically.

## Requirements
This issues grep commands to search code. If you would like to use the source code searching feature, your system must
have [grep](https://www.gnu.org/software/grep/manual/grep.html) installed.

## Install
```
yarn add -D ClearC2/headlamp
```

Create a new `routes` directory.

```
server/
  routes/
  server.js
```

In your express api bootstrap file:

```js
// server/server.js

import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import shine from 'headlamp'

const app = express()
app.use(cors())
app.use(bodyParser.json())

// old routes here

shine(app, {
  title: 'IOP API Docs',
  description: String(fs.readFileSync(path.resolve(__dirname, '..', 'readme.md'))),
  routes: path.resolve(__dirname, 'routes'),
  src: path.resolve(__dirname, '..', 'src'),
  server: [
    path.resolve(__dirname),
    path.resolve(__dirname, '..', 'src', 'redux', 'server')
  ],
  hidePath: path.resolve(__dirname, '..'),
  responses: [
    {
      title: 'Invalid request',
      status: 400,
      response: {
        errors: [
          {error: 'Invalid request'}
        ]
      }
    },
    {
      title: 'Server error',
      status: 500,
      response: {
        errors: [
          {error: 'Something went wrong.'}
        ]
      }
    }
  ]
})

const PORT = process.env.PORT || 5033
app.listen(PORT, () => {
  console.log('Dev Express server running at localhost:' + PORT)
})
```

After starting your mock server, you will have an api explorer at `http://localhost:<port>/_docs`.

## Configuration
The second argument to the `documentAPI` function is a configuration object. All are optional.

#### `title`
Turns into the header of the api explorer.

#### `description`
General api description/documentation. Supports markdown.

#### `routes`
The directory to the route files. See route file documentation below.

#### `src`
The source code path. Can be a single path or array of paths.

#### `server`
The mock server path. Can be a single path or array of paths.

#### `hidePath`
Removes the path from the file names in the api explorer.

#### `responses`
Default responses that will be associated with every route. Useful for documenting error responses. Should be an array of
error objects. See the `responses` documentation below.

## Route files
This package gives you a new way to define mock endpoints through route files. Route files can be nested in the `routes` directory. Example:

```
server/
  routes/
    auth-info.js
    companies/
      get-companies.js
      save-company.js
  server.js
```
The files will automatically get incorporated into the mock server as functional endpoints.

### Structure
Route files can either be a `.js` file that exports an object or a `.json` file. See this example route file.
```js
// server/routes/companies/employees.js

export default {
  path: '/companies/:companyUnid/employees',
  methods: ['GET'],
  title: 'Company employees',
  description: 'Fetches all active employees',
  response: {
    employees: [
      {
        name: 'John Doe'
      },
      {
        name: 'Bob Smith'
      }
    ]
  }
}
```

The equivalent json file of the above would look like below and behave identically.

```json
{
  "path": "/companies/:companyUnid/employees",
  "methods": ["GET"],
  "title": "Company employees",
  "description": "Fetches all active employees",
  "response": {
    "employees": [
      {
        "name": "John Doe"
      },
      {
        "name": "Bob Smith"
      }
    ]
  }
}
```

#### `path`
This must be a valid express route path.

#### `method`
A single http verb that this endpoint responds to. Ex. `POST`

#### `methods`
Routes can respond to multiple http methods. This must be an array of http verbs that this endpoint responds to.
Ex. `['GET', 'POST', 'PUT', 'PATCH', 'DELETE']`

#### `title`
Only used for documentation in the api explorer ui.

#### `description`
Only used for documentation in the api explorer ui. Supports markdown.

#### `params`
URL params are the tokens prefixed by `:` in the path. These params can be further defined:
```js
export default {
  path: '/companies/:companyUnid/employees',
  params: {
    companyUnid: 'abcdef'
  }
  // ...
}
```

The above will prepopulate this param's input in the api explorer. You can provide additional help text by using an object.
```js
export default {
  path: '/companies/:companyUnid/employees',
  params: {
    companyUnid: {
      value: 'abcdef',
      help: 'Company Unid'
    }
  }
  // ...
}
```
The `help` text will show up directly beneath the param's input in the api explorer.

#### `query`
Query params can be defined in the same way.
```js
export default {
  path: '/companies/:companyUnid/employees',
  query: {
    hiredAfter: {
      value: '01-01-2018',
      help: 'Format MM-DD-YYYY'
    }
  }
  // ...
}
```

#### `payload`
`POST`, `PUT`, and `PATCH` methods allow for example payloads. These payloads will populate the payload input in the api explorer.
```js
export default {
  path: '/contact',
  methods: ['POST'],
  payload: {
    contact: {
      firstName: 'John',
      lastName: 'Doe'
    }
  }
  // ...
}
```

In the case of endpoints accepting both `POST` and `PUT` requests, you can define unique payloads for both.
```js
export default {
  path: '/contact',
  methods: ['POST', 'PUT'],
  payload: {
    POST: {
      contact: {
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    PUT: {
      contact: {
        id: 'abcded',
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  }
  // ...
}
```

#### `response`
Responses can be simple javascript objects...
```js
export default {
  path: '/people',
  methods: ['GET'],
  response: {
    people: {
      [
        {name: 'John Doe'},
        {name: 'Bob Smith'}
      ]
    }
  }
}
```

Or come from fixture files...
```js
export default {
  path: '/people',
  methods: ['GET'],
  response: require('./_people.json')
}
```

Or dynamically generated based on the request...

```js
export default {
  path: '/people',
  methods: ['GET', 'POST', 'PUT'],
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

    return res.status(200).json(require('./_people.json'))
  }
}
```

Unless a function is provided, a 200 status code will be sent.

#### `responses`
Instead of, or in conjunction with, the `response` key, you can provide static responses.
```js
export default {
  path: '/people',
  method: 'POST',
  responses: [
    {
      title: 'All good',
      description: 'Some **markdown** describing this response',
      status: 200,
      response: {
        foo: 'bar'
      }
    },
    () => ({
      title: 'Unauthorized',
      status: 401,
      response: require('./_bigData') // large fixture that doesn't need to be loaded into memory right away
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
```
#### `globalResponses`
Boolean to determine whether to concat the globally defined responses to this route. Defaults `true`.

### Response objects
Static responses must either be an object or a function that returns an object. Static response objects have the following fields:

##### `title`
The title of the static response.

##### `description`
The description of the static response. Supports markdown.

##### `status`
The status http status code.

##### `response`
The response payload.

## Response resolution
The following priority is used to determine which response to use.

- If activated response, use it
- If `response` object/function exists, use it
- If first response in `responses` exists, use it
- Sends error response

## Fixtures
Fixture files can be nested in the `routes` directory but their file names must be prefixed with an underscore
to not be interpreted as a route file.

```sh
server/
  routes/
    people/
      get-people/
        _people.json     # will not be interpreted as a route file
        route.js         # will be interpreted as a route file
      save-person.js     # will be interpreted as a route file
      update-person.json # will be interpreted as a route file
```

## Explorer features

### Search
Searching in the frontend is case-insensitive. You can omit path variables and simply provide a colon. Ex.

```
/companies/:/employees/:/address
```

The above would match:


```
/companies/:companyUnid/employees/:unid/address
```

### Git dates
Hovering over file names will show the last modified date according to git.

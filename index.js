require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

morgan.token('body', (request) => ((request.method === 'POST') || (request.method === 'PUT')) ? JSON.stringify(request.body) : ' ')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// const generateId = () => {
//   const max = Number.MAX_SAFE_INTEGER
//   const min = 1
//   return Math.floor(Math.random() * (max - min) + min)
// }

// let persons = [
//   {
//     id: 1,
//     name: 'Arto Hellas',
//     number: '040-123456'
//   },
//   {
//     id: 2,
//     name: 'Ada Lovelace',
//     number: '39-44-5323523'
//   },
//   {
//     id: 3,
//     name: 'Dan Abramov',
//     number: '12-43-234345'
//   },
//   {
//     id: 4,
//     name: 'Mary Poppendick',
//     number: '39-23-6423122'
//   }
// ]

// app.get('/api/persons', (request, response) => {
//   response.json(persons)
// })

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

// app.get('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id)
//   const person = persons.find(person => person.id === id)

//   if (person) {
//     response.json(person)
//   } else {
//     response.status(404).end()
//   }
// })

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

// app.delete('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id)
//   persons = persons.filter(person => person.id !== id)

//   response.status(204).end()
// })

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// app.post('/api/persons', (request, response) => {
//   const body = request.body

//   if (!body.name) {
//     return response.status(400).json({
//       error: 'name missing'
//     })
//   }

//   if (!body.number) {
//     return response.status(400).json({
//       error: 'number missing'
//     })
//   }

//   if (persons.find(person => person.name == body.name)) {
//     return response.status(400).json({
//       error: 'name must be unique'
//     })
//   }

//   const person = {
//     id: generateId(),
//     name: body.name,
//     number: body.number
//   }

//   persons = persons.concat(person)

//   response.json(person)
// })

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(result => {
      response.send(`
      <p>Phonebook has info for ${result} person</p>
      <p>${new Date().toString()}</p>
      `)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

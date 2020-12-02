const mongoose = require('mongoose')

if ((process.argv.length !== 3) && (process.argv.length !== 5)) {
  console.log(`
    Usage:
    node mongo.js <password> : show phonebook
    node mongo.js <password> <new name> <new number> : add new person to phonebook
  `)
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://atlas:${password}@cluster0.v4i2v.mongodb.net/phonebook?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => console.log(`${person.name} ${person.number}`))
    mongoose.connection.close()
  })
}

if (process.argv.length === 5) {
  mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then(result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}

// on importe le module express
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const filePath = path.join(__dirname, '../mocks/user.json')

router.get('/profil/:id', (request, response) => {
  const users = require(filePath)
  const profil = users.find(profil => profil.id === Number(request.params.id))
  sendUser(response, profil)
})

router.get('/my-profil', (request, response) => {
  if (request.session.user === undefined || request.session.user.id === undefined || request.session.user === 0) {
    return response.status(404).end('not found')
  }
  const users = require(filePath)
  const profil = users.find(profil => profil.id === request.session.user.id)
  response.json(profil)
})

router.post('/sign-in', (req, res, next) => {
  const users = require(filePath)
  // does user exists ?
  console.log('Login : ', req.body.login, 'Mot de passe : ' + req.body.password)
  const user = users.find(u => req.body.login === u.email)

  // Error handling
  if (!user) {
    return res.json({error: 'User not found'})
  }

  if (user.password !== req.body.password) {
    return res.json({error: 'Wrong password'})
  }

  // else, set the user into the session
  req.session.user = user
  console.log('Connexion : ', user)
  return sendCurrentUser(req, res)
})

router.get('/session', (req, res, next) => {
  return sendCurrentUser(req, res)
})

router.get('/sign-out', (req, res) => {
  req.session.user = {}
  return sendCurrentUser(req, res)
})

router.post('/modify-profil/:id', (request, response, next) => {
  if (request.session.user === undefined || request.session.user.id === undefined || request.session.user === 0) {
    return response.status(404).end('not found')
  }
  const id = request.session.user.id
  readFile(filePath, 'utf8')
    .then(JSON.parse)
    .then(user => {
      user.forEach(element => {
        if (id === element.id) {
          element.email = request.body.email
          element.password = request.body.password
        }
      })
      const content = JSON.stringify(user, null, 2)
      return writeFile(filePath, content, 'utf8')
    })
    .then(() => response.end('OKay'))
    .catch(next)
})

router.post('/register', (request, response, next) => {
  readFile(filePath, 'utf8')
    .then(JSON.parse)
    .then(user => {
      user.push({
        id: user.length + 1,
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        createdAt: Date.now()
      })
      const content = JSON.stringify(user, null, 2)
      return writeFile(filePath, content, 'utf8')
    })
    .then(() => response.end('OK'))
    .catch(next)
})

module.exports = router

/**
 * Crée une réponse JSON avec l'utilisateur courant et le retourne
 * @param req Requête de la page
 * @param res Réponse de la page
 * @returns {*}
 */
function sendCurrentUser (req, res) {
  const user = (req.session.user && req.session.user.id > 0) ? req.session.user : {}
  if (req.session.user && req.session.user.id > 0) {
    console.log(req.session.user.id)
  }
  console.log('sendCurrentUser', user)
  return sendUser(res, user)
}

/**
 * Retourne l'utilisateur au client
 * @param res
 * @param user
 */
function sendUser (res, user) {
  if (user === undefined) return res.json({})
  const userData = {
    name: user.name,
    email: user.email,
    id: user.id,
    createdAt: user.createdAt
  }
  return res.json(userData)
}

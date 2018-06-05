// on importe le module express
const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const filePath = path.join(__dirname, '../mocks/user.json')


router.get('/my-profil', (request, response) => {
  if (request.session.user === undefined || request.session.user.id === undefined || request.session.user === 0) {
    return response.status(404).end('not found')
  }
  const users = require(filePath)
  const profil = users.find(profil => profil.id === request.session.user.id)
  if (profil === undefined) return response.status(404).end('not found')
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

router.post('/update-my-profil', (request, response, next) => {
  if (request.session.user === undefined || request.session.user.id === undefined || request.session.user === 0) {
    return response.status(404).end('not found')
  }
  const users = require(filePath, 'utf8')
  const user = users.find(element => request.session.user.id === element.id)
  if (user === undefined) return response.status(404).end('not found')

  user.email = request.body.email
  user.password = request.body.password

  const content = JSON.stringify(users, null, 2)
  return writeFile(filePath, content, 'utf8')
    .then(() => response.end('Ok'))
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
  //req.session.reload()
  const user = (req.session.user && req.session.user.id > 0) ? req.session.user : {}
  if (req.session.user && req.session.user.id > 0) {
    console.log(req.session.user.id)
  }
  //req.session.save();
  console.log('req.session', req.session, req.session.id)
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

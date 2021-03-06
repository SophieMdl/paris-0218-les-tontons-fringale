import { profilPage } from './composants/user.js'
import { getFetchUrl } from './fetch.js'

const profilElement = document.getElementById('mon-profil')

window.fetch(`${getFetchUrl}/my-profil`, {credentials: 'include'})
  .then(res => res.json())
  .then(user => {
    console.log(user)
    profilElement.innerHTML = profilPage(user)

    const validate = document.getElementById('valid')
    validate.disabled = true
    const modify = document.getElementById('modify')
    modify.addEventListener('click', () => {
      const inputs = profilElement.querySelectorAll('input')
      for (let input of inputs) {
        input.removeAttribute('disabled')
      }
      modify.disabled = true
      validate.disabled = false
    })

    const form = document.getElementById('profil-form')
    form.addEventListener('submit', e => {
      e.preventDefault()
      const email = document.getElementById('mail-input').value
      const password = document.getElementById('password-input').value
      const name = document.getElementById('name-input').value
      window.fetch(`${getFetchUrl}/update-my-profil/`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          password: password,
          name: name
        })
      }).then(res => res.json())
        .then(res => {
          if (res === 'ok') {
            window.location.reload()
          }
        })
    })
  })

export const getCurrentUser = () => {
  return new Promise(resolve =>
    window.fetch('https://wild-and-hungry.herokuapp.com/session',
      {credentials: 'include'})
      .then(res => res.json())
      .then(user => {
        if (user.id) {
          user.createdAt = new Date(user.createdAt)
          user.previousConnection = (user.previousConnection) ? new Date(user.previousConnection) : null
          user.lastConnection = (user.lastConnection) ? new Date(user.lastConnection) : null
          resolve(user)
        }
        resolve(null)
      })
  )
}

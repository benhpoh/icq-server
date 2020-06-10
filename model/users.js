const users = []

const addUser = ({ id, name, channel }) => {

  name = name.trim().toLowerCase()
  channel = channel.trim().toLowerCase()

  const nameTaken = users.find(user => {
    return user.channel === channel && user.name === name
  })

  if (nameTaken) {
    name = name + "1"
  }

  const user = { id, name, channel }

  users.push(user)

  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex(user => user.id === id)

  if (index != -1) {
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  return users.find(user => user.id === id)
}

const getUsersInChannel = (channel) => {
  return users.filter(user => user.channel === channel)
}

const getChannels = () => {
  let channels = users.map(user => user.channel)
  return [...new Set(channels)]
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInChannel,
  getChannels
}
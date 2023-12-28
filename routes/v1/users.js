let express = require('express')
var Router = express.Router()
var userController = require('../../controller/users')
const { authenticateToken } = require('../../helpers/JWTToken')

Router.post('/addUser', authenticateToken, userController.addUser)
Router.post('/getUser',authenticateToken, userController.getUser)
Router.post('/updateUser',authenticateToken, userController.updateUser)
Router.post('/deleteUser',authenticateToken, userController.deleteUser)

module.exports = Router
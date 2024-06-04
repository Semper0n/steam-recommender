const Router = require('express')
const router = new Router()
const userController = require("../controllers/userController")

router.get('/GetInfo/:steamid', userController.getUserInfo)
router.get('/Check/:steamid', userController.checkUser)
router.post('/getRecommendedAppsData', userController.getRecommendedAppsData)
router.post('/getFilteredData', userController.getFilteredData)

module.exports = router
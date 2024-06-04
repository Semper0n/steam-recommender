const Router = require('express')
const router = new Router()
const appsController = require("../controllers/appsController")

router.get('/apps', appsController.getAppsListInDB)
router.get('/apps/:id', appsController.getAppInDB)
router.get('/ParseAppsList', appsController.parseAppsList)
router.get('/ParseAppsData', appsController.parseAppsData)

module.exports = router
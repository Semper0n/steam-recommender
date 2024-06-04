const Router = require('express')
const router = new Router()
const appsRouter = require("./appsRouter")
const userRouter = require("./userRouter")

router.use('/', appsRouter)
router.use('/user', userRouter)

module.exports = router
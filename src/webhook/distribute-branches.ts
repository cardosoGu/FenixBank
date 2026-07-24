
import { Router, request, response } from 'express'


const router = Router()

router.post('/distribute/prod', (req: request, res: response) => {
    req.body
    res.status(200).send("pong")
})

export default router

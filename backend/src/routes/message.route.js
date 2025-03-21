import { Router } from "express";

import { getOldMessages } from "../controllers/message.controller.js";

const router = Router()


router.route('/:userId').get(getOldMessages)



export default router

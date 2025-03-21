import { Router } from "express";

import { getOfflineUser, registerUser, userLogin, userLogOut, userProfile } from "../controllers/user.controller.js";

const router =  Router();


router.route("/register").post(registerUser)
router.route("/profile").get(userProfile)
router.route("/login").post(userLogin)
router.route("/logout").post(userLogOut)
router.route('/people').get(getOfflineUser)






export default router
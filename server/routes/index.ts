import { Router } from "express";
import postcards from "./postcardsRoutes"

const router = Router()

router.use("/", postcards)

export default router
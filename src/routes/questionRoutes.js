import { Router } from "express";

import {
  listarQuestoes
} from "../controllers/questionController.js";

const router = Router();

router.get("/", listarQuestoes);

export default router;
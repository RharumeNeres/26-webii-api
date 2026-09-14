import { Router } from "express";

import {
  listarMaterias,
  getSubjectById
} from "../controllers/subjectController.js";

const router = Router();

router.get("/", listarMaterias);

router.get("/:id", getSubjectById);

export default router;
import express from "express";
import * as questionController from "../controllers/questionController.js";
import validate from "../middlewares/validate.js";
import {
  createQuestionSchema,
  updateQuestionSchema,
} from "../schemas/questionSchema.js";
import { idParamSchema } from "../schemas/idSchema.js";

const router = express.Router();

router.post("/", validate(createQuestionSchema), questionController.create);
router.get("/", questionController.getAll);
router.get(
  "/:id",
  validate(idParamSchema, "params"),
  questionController.getById,
);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateQuestionSchema),
  questionController.update,
);
router.delete(
  "/:id",
  validate(idParamSchema, "params"),
  questionController.remove,
);

export default router;

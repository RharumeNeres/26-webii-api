import { z } from "zod";
import { positiveIdSchema } from "./idSchema.js";

const subjectFields = {
  nome: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  professorId: positiveIdSchema,
  ativa: z.boolean().optional(),
};

export const createSubjectSchema = z.object(subjectFields).strict();

export const updateSubjectSchema = z
  .object(subjectFields)
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualização",
  });

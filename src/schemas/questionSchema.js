import { z } from "zod";
import { numericInputSchema, positiveIdSchema } from "./idSchema.js";

const dificuldadeSchema = numericInputSchema.pipe(
  z.coerce.number().int().min(1).max(3),
);

const respostaCorretaSchema = z
  .string()
  .trim()
  .min(1, "Resposta correta não pode ser vazia")
  .max(500, "Resposta correta deve ter no máximo 500 caracteres")
  .nullable()
  .optional();

export const createQuestionSchema = z
  .object({
    enunciado: z
      .string()
      .trim()
      .min(1, "Enunciado é obrigatório")
      .max(500, "Enunciado deve ter no máximo 500 caracteres"),
    dificuldade: dificuldadeSchema,
    respostaCorreta: respostaCorretaSchema,
    subjectId: positiveIdSchema,
    authorId: positiveIdSchema,
    ativa: z.boolean().optional(),
  })
  .strict();

export const updateQuestionSchema = z
  .object({
    enunciado: z
      .string()
      .trim()
      .min(1, "Enunciado não pode ser vazio")
      .max(500, "Enunciado deve ter no máximo 500 caracteres")
      .optional(),
    dificuldade: dificuldadeSchema.optional(),
    respostaCorreta: respostaCorretaSchema,
    subjectId: positiveIdSchema.optional(),
    authorId: positiveIdSchema.optional(),
    ativa: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envie ao menos um campo para atualização",
  });

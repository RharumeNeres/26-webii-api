import * as questionService from "../services/questionService.js";

const allowedPatchFields = [
  "enunciado",
  "dificuldade",
  "respostaCorreta",
  "subjectId",
  "authorId",
  "ativa",
];

function toPositiveInt(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function hasAllowedPatchField(body) {
  return allowedPatchFields.some((field) => Object.hasOwn(body, field));
}

function hasInvalidQuestionFields({
  enunciado,
  dificuldade,
  respostaCorreta,
  subjectId,
  authorId,
  ativa,
}) {
  const difficultyNumber =
    dificuldade !== undefined ? Number(dificuldade) : undefined;

  return (
    (enunciado !== undefined &&
      (typeof enunciado !== "string" || !enunciado.trim())) ||
    (dificuldade !== undefined &&
      (!Number.isInteger(difficultyNumber) ||
        difficultyNumber < 1 ||
        difficultyNumber > 3)) ||
    (respostaCorreta !== undefined &&
      respostaCorreta !== null &&
      typeof respostaCorreta !== "string") ||
    (subjectId !== undefined && !toPositiveInt(subjectId)) ||
    (authorId !== undefined && !toPositiveInt(authorId)) ||
    (ativa !== undefined && typeof ativa !== "boolean")
  );
}

export const create = async (req, res) => {
  try {
    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      subjectId,
      authorId,
      ativa,
    } = req.body;

    const subjectIdNumber = toPositiveInt(subjectId);
    const authorIdNumber = toPositiveInt(authorId);
    const difficultyNumber = Number(dificuldade);

    if (
      typeof enunciado !== "string" ||
      !enunciado.trim() ||
      !subjectIdNumber ||
      !authorIdNumber ||
      !Number.isInteger(difficultyNumber) ||
      difficultyNumber < 1 ||
      difficultyNumber > 3 ||
      hasInvalidQuestionFields({
        enunciado,
        dificuldade,
        respostaCorreta,
        subjectId,
        authorId,
        ativa,
      })
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Enunciado, dificuldade entre 1 e 3, subjectId e authorId válidos são obrigatórios",
      });
    }

    const result = await questionService.createQuestion({
      enunciado,
      dificuldade: difficultyNumber,
      respostaCorreta,
      subjectId: subjectIdNumber,
      authorId: authorIdNumber,
      ativa,
    });

    if (!result.ok && result.reason === "SUBJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${subjectIdNumber} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "AUTHOR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Autor com ID ${authorIdNumber} não encontrado`,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Questão criada com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao criar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao criar questão",
    });
  }
};

export const getAll = async (_req, res) => {
  try {
    const questoes = await questionService.getAllQuestions();

    return res.status(200).json({
      success: true,
      data: questoes,
      total: questoes.length,
    });
  } catch (error) {
    console.error("Erro ao listar questões:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao listar questões",
    });
  }
};

export const getById = async (req, res) => {
  try {
    const questionId = toPositiveInt(req.params.id);

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const questao = await questionService.getQuestionById(questionId);

    if (!questao) {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      data: questao,
    });
  } catch (error) {
    console.error("Erro ao buscar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar questão",
    });
  }
};

export const update = async (req, res) => {
  try {
    const questionId = toPositiveInt(req.params.id);

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    if (
      !hasAllowedPatchField(req.body) ||
      hasInvalidQuestionFields(req.body)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Envie ao menos um campo válido: enunciado, dificuldade, respostaCorreta, subjectId, authorId ou ativa",
      });
    }

    const data = { ...req.body };

    if (data.dificuldade !== undefined) {
      data.dificuldade = Number(data.dificuldade);
    }

    if (data.subjectId !== undefined) {
      data.subjectId = toPositiveInt(data.subjectId);
    }

    if (data.authorId !== undefined) {
      data.authorId = toPositiveInt(data.authorId);
    }

    const result = await questionService.updateQuestion(questionId, data);

    if (!result.ok && result.reason === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "SUBJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Matéria com ID ${data.subjectId} não encontrada`,
      });
    }

    if (!result.ok && result.reason === "AUTHOR_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Autor com ID ${data.authorId} não encontrado`,
      });
    }

    if (!result.ok && result.reason === "NO_FIELDS") {
      return res.status(400).json({
        success: false,
        message: "Informe pelo menos um campo permitido",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Questão atualizada com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao atualizar questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao atualizar questão",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const questionId = toPositiveInt(req.params.id);

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "ID inválido. Deve ser um número inteiro positivo",
      });
    }

    const result = await questionService.deleteQuestion(questionId);

    if (!result.ok && result.reason === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: `Questão com ID ${questionId} não encontrada`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Questão removida com sucesso",
      data: result.data,
    });
  } catch (error) {
    console.error("Erro ao remover questão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao remover questão",
    });
  }
};
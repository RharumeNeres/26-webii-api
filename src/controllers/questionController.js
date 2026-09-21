import * as questionService from "../services/questionService.js";
import { NotFoundError } from "../errors/AppError.js";

export const create = async (req, res, next) => {
  try {
    const result = await questionService.createQuestion(req.body);

    if (!result.ok && result.reason === "SUBJECT_NOT_FOUND") {
      throw new NotFoundError(
        `Matéria com ID ${req.body.subjectId} não encontrada`,
      );
    }

    if (!result.ok && result.reason === "AUTHOR_NOT_FOUND") {
      throw new NotFoundError(
        `Usuário com ID ${req.body.authorId} não encontrado`,
      );
    }

    return res.status(201).json({
      success: true,
      message: "Questão criada com sucesso",
      data: result.data,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAll = async (_req, res, next) => {
  try {
    const questions = await questionService.getAllQuestions();

    return res.status(200).json({
      success: true,
      data: questions,
      total: questions.length,
    });
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const questionId = req.params.id;

    const question = await questionService.getQuestionById(questionId);

    if (!question) {
      throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
    }

    return res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const questionId = req.params.id;

    const result = await questionService.updateQuestion(questionId, req.body);

    if (!result.ok && result.reason === "NOT_FOUND") {
      throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
    }

    if (!result.ok && result.reason === "SUBJECT_NOT_FOUND") {
      throw new NotFoundError(
        `Matéria com ID ${req.body.subjectId} não encontrada`,
      );
    }

    if (!result.ok && result.reason === "AUTHOR_NOT_FOUND") {
      throw new NotFoundError(
        `Usuário com ID ${req.body.authorId} não encontrado`,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Questão atualizada com sucesso",
      data: result.data,
    });
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const questionId = req.params.id;

    const result = await questionService.deleteQuestion(questionId);

    if (!result.ok && result.reason === "NOT_FOUND") {
      throw new NotFoundError(`Questão com ID ${questionId} não encontrada`);
    }

    return res.status(200).json({
      success: true,
      message: "Questão removida com sucesso",
      data: result.data,
    });
  } catch (error) {
    return next(error);
  }
};

import * as subjectService from "../services/subjectService.js";
import { NotFoundError, ConflictError } from "../errors/AppError.js";

export const create = async (req, res, next) => {
  try {
    const result = await subjectService.createSubject(req.body);

    if (!result.ok && result.reason === "PROFESSOR_NOT_FOUND") {
      throw new NotFoundError(
        `Professor com ID ${req.body.professorId} não encontrado`,
      );
    }

    return res.status(201).json({
      success: true,
      message: "Matéria criada com sucesso",
      data: result.data,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAll = async (_req, res, next) => {
  try {
    const subjects = await subjectService.getAllSubjects();

    return res.status(200).json({
      success: true,
      data: subjects,
      total: subjects.length,
    });
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const subjectId = req.params.id;

    const subject = await subjectService.getSubjectById(subjectId);

    if (!subject) {
      throw new NotFoundError(`Matéria com ID ${subjectId} não encontrada`);
    }

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const subjectId = req.params.id;

    const result = await subjectService.updateSubject(subjectId, req.body);

    if (!result.ok && result.reason === "NOT_FOUND") {
      throw new NotFoundError(`Matéria com ID ${subjectId} não encontrada`);
    }

    if (!result.ok && result.reason === "PROFESSOR_NOT_FOUND") {
      throw new NotFoundError(
        `Professor com ID ${req.body.professorId} não encontrado`,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Matéria atualizada com sucesso",
      data: result.data,
    });
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const subjectId = req.params.id;

    const result = await subjectService.deleteSubject(subjectId);

    if (!result.ok && result.reason === "NOT_FOUND") {
      throw new NotFoundError(`Matéria com ID ${subjectId} não encontrada`);
    }

    if (!result.ok && result.reason === "SUBJECT_IN_USE") {
      throw new ConflictError("Matéria possui questões vinculadas");
    }

    return res.status(200).json({
      success: true,
      message: "Matéria removida com sucesso",
      data: result.data,
    });
  } catch (error) {
    return next(error);
  }
};

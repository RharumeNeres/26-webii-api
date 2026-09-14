import prisma from "../config/database.js";

const publicUserSelect = {
  id: true,
  nome: true,
  email: true,
  papel: true,
  foto: true,
};

const subjectSelect = {
  id: true,
  nome: true,
  ativa: true,
};

export const getAllQuestions = async () => {
  return prisma.question.findMany({
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      ativa: true,
      createdAt: true,
      updatedAt: true,
      subject: {
        select: subjectSelect,
      },
      author: {
        select: publicUserSelect,
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getQuestionById = async (questionId) => {
  return prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      ativa: true,
      createdAt: true,
      updatedAt: true,
      subject: {
        select: subjectSelect,
      },
      author: {
        select: publicUserSelect,
      },
    },
  });
};

export const createQuestion = async (questionData) => {
  const materia = await prisma.subject.findUnique({
    where: { id: questionData.subjectId },
    select: { id: true },
  });

  if (!materia) {
    return { ok: false, reason: "SUBJECT_NOT_FOUND" };
  }

  const autor = await prisma.user.findUnique({
    where: { id: questionData.authorId },
    select: { id: true },
  });

  if (!autor) {
    return { ok: false, reason: "AUTHOR_NOT_FOUND" };
  }

  const questao = await prisma.question.create({
    data: {
      enunciado: questionData.enunciado.trim(),
      dificuldade: questionData.dificuldade,
      respostaCorreta: questionData.respostaCorreta ?? null,
      subjectId: questionData.subjectId,
      authorId: questionData.authorId,
      ativa: questionData.ativa ?? true,
    },
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      ativa: true,
      createdAt: true,
      updatedAt: true,
      subject: {
        select: subjectSelect,
      },
      author: {
        select: publicUserSelect,
      },
    },
  });

  return { ok: true, data: questao };
};

export const updateQuestion = async (questionId, questionData) => {
  const questaoExistente = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!questaoExistente) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const data = {};

  if (Object.hasOwn(questionData, "enunciado")) {
    data.enunciado = questionData.enunciado.trim();
  }

  if (Object.hasOwn(questionData, "dificuldade")) {
    data.dificuldade = questionData.dificuldade;
  }

  if (Object.hasOwn(questionData, "respostaCorreta")) {
    data.respostaCorreta = questionData.respostaCorreta ?? null;
  }

  if (Object.hasOwn(questionData, "ativa")) {
    data.ativa = questionData.ativa;
  }

  if (Object.hasOwn(questionData, "subjectId")) {
    const materia = await prisma.subject.findUnique({
      where: { id: questionData.subjectId },
      select: { id: true },
    });

    if (!materia) {
      return { ok: false, reason: "SUBJECT_NOT_FOUND" };
    }

    data.subjectId = questionData.subjectId;
  }

  if (Object.hasOwn(questionData, "authorId")) {
    const autor = await prisma.user.findUnique({
      where: { id: questionData.authorId },
      select: { id: true },
    });

    if (!autor) {
      return { ok: false, reason: "AUTHOR_NOT_FOUND" };
    }

    data.authorId = questionData.authorId;
  }

  if (Object.keys(data).length === 0) {
    return { ok: false, reason: "NO_FIELDS" };
  }

  const questao = await prisma.question.update({
    where: { id: questionId },
    data,
    select: {
      id: true,
      enunciado: true,
      dificuldade: true,
      respostaCorreta: true,
      ativa: true,
      createdAt: true,
      updatedAt: true,
      subject: {
        select: subjectSelect,
      },
      author: {
        select: publicUserSelect,
      },
    },
  });

  return { ok: true, data: questao };
};

export const deleteQuestion = async (questionId) => {
  const questaoExistente = await prisma.question.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!questaoExistente) {
    return { ok: false, reason: "NOT_FOUND" };
  }

  const questao = await prisma.question.delete({
    where: { id: questionId },
    select: {
      id: true,
      enunciado: true,
    },
  });

  return { ok: true, data: questao };
};
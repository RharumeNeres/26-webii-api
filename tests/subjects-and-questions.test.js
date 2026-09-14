import { afterEach, describe, expect, it } from "vitest";

import request from "supertest";

import app from "../src/app.js";

import prisma from "../src/config/database.js";

const createdUserIds = [];

const createdSubjectIds = [];

const createdQuestionIds = [];

function uniqueEmail(label) {
  return `aula05-${label}-${Date.now()}-${Math.random()}@example.com`;
}

async function createUser(overrides = {}) {
  const response = await request(app)
    .post("/users")
    .send({
      nome: "Prof. Teste",
      email: uniqueEmail("user"),
      ...overrides,
    });

  if (response.status === 201) {
    createdUserIds.push(response.body.data.id);
  }

  return response;
}

async function createSubject(professorId, overrides = {}) {
  const response = await request(app)
    .post("/subjects")
    .send({
      nome: "Matéria de Teste",
      professorId,
      ativa: true,
      ...overrides,
    });

  if (response.status === 201) {
    createdSubjectIds.push(response.body.data.id);
  }

  return response;
}

async function createQuestion(subjectId, authorId, overrides = {}) {
  const response = await request(app)
    .post("/questions")
    .send({
      enunciado: "Questão de teste",
      dificuldade: 2,
      subjectId,
      authorId,
      respostaCorreta: "Resposta de teste",
      ativa: true,
      ...overrides,
    });

  if (response.status === 201) {
    createdQuestionIds.push(response.body.data.id);
  }

  return response;
}

afterEach(async () => {
  if (createdQuestionIds.length > 0) {
    await prisma.question.deleteMany({
      where: { id: { in: createdQuestionIds.splice(0) } },
    });
  }

  if (createdSubjectIds.length > 0) {
    await prisma.subject.deleteMany({
      where: { id: { in: createdSubjectIds.splice(0) } },
    });
  }

  if (createdUserIds.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds.splice(0) } },
    });
  }
});

describe("Subject API", () => {
  it("cria, lista e busca uma matéria por ID", async () => {
    const professor = await createUser();

    const created = await createSubject(professor.body.data.id);

    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.nome).toBe("Matéria de Teste");
    expect(created.body.data.professor.id).toBe(professor.body.data.id);

    const list = await request(app).get("/subjects");

    expect(list.status).toBe(200);
    expect(list.body.success).toBe(true);
    expect(Array.isArray(list.body.data)).toBe(true);

    const found = await request(app).get(`/subjects/${created.body.data.id}`);

    expect(found.status).toBe(200);
    expect(found.body.success).toBe(true);
    expect(found.body.data.id).toBe(created.body.data.id);
  });

  it("atualiza somente os campos enviados da matéria", async () => {
    const professor = await createUser();

    const created = await createSubject(professor.body.data.id, {
      nome: "Nome original",
      ativa: false,
    });

    const response = await request(app)
      .patch(`/subjects/${created.body.data.id}`)
      .send({ nome: "Nome atualizado" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nome).toBe("Nome atualizado");
    expect(response.body.data.ativa).toBe(false);
    expect(response.body.data.professor.id).toBe(professor.body.data.id);
  });

  it("rejeita ID e corpo inválidos para matéria", async () => {
    const invalidId = await request(app).get("/subjects/abc");

    const invalidBody = await request(app).post("/subjects").send({
      nome: "",
      professorId: 0,
      ativa: "sim",
    });

    const emptyPatch = await request(app).patch("/subjects/1").send({});

    expect(invalidId.status).toBe(400);
    expect(invalidBody.status).toBe(400);
    expect(emptyPatch.status).toBe(400);
  });

  it("retorna 404 para professor inexistente", async () => {
    const response = await request(app).post("/subjects").send({
      nome: "Matéria inválida",
      professorId: 999999999,
      ativa: true,
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("remove uma matéria e confirma 404 depois", async () => {
    const professor = await createUser();

    const created = await createSubject(professor.body.data.id);

    const subjectId = created.body.data.id;

    const removed = await request(app).delete(`/subjects/${subjectId}`);

    expect(removed.status).toBe(200);
    expect(removed.body.success).toBe(true);
    expect(removed.body.data.id).toBe(subjectId);

    const found = await request(app).get(`/subjects/${subjectId}`);

    expect(found.status).toBe(404);
  });

  it("impede excluir matéria com questão vinculada e retorna 409", async () => {
    const professor = await createUser();

    const subject = await createSubject(professor.body.data.id);

    await createQuestion(subject.body.data.id, professor.body.data.id);

    const response = await request(app).delete(
      `/subjects/${subject.body.data.id}`,
    );

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("questões vinculadas");
  });
});

describe("Question API", () => {
  it("cria, lista e busca uma questão por ID", async () => {
    const professor = await createUser();

    const subject = await createSubject(professor.body.data.id);

    const created = await createQuestion(
      subject.body.data.id,
      professor.body.data.id,
    );

    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.enunciado).toBe("Questão de teste");
    expect(created.body.data.subject.id).toBe(subject.body.data.id);
    expect(created.body.data.author.id).toBe(professor.body.data.id);

    const list = await request(app).get("/questions");

    expect(list.status).toBe(200);
    expect(list.body.success).toBe(true);
    expect(Array.isArray(list.body.data)).toBe(true);

    const found = await request(app).get(`/questions/${created.body.data.id}`);

    expect(found.status).toBe(200);
    expect(found.body.success).toBe(true);
    expect(found.body.data.id).toBe(created.body.data.id);
  });

  it("atualiza somente os campos enviados da questão", async () => {
    const professor = await createUser();

    const subject = await createSubject(professor.body.data.id);

    const created = await createQuestion(
      subject.body.data.id,
      professor.body.data.id,
      {
        enunciado: "Enunciado original",
        dificuldade: 2,
        respostaCorreta: "Resposta original",
        ativa: false,
      },
    );

    const response = await request(app)
      .patch(`/questions/${created.body.data.id}`)
      .send({
        enunciado: "Enunciado atualizado",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.enunciado).toBe("Enunciado atualizado");
    expect(response.body.data.dificuldade).toBe(2);
    expect(response.body.data.respostaCorreta).toBe("Resposta original");
    expect(response.body.data.ativa).toBe(false);
  });

  it("rejeita ID e corpo inválidos para questão", async () => {
    const invalidId = await request(app).get("/questions/abc");

    const invalidBody = await request(app).post("/questions").send({
      enunciado: "",
      dificuldade: 5,
      subjectId: 0,
      authorId: 0,
    });

    const emptyPatch = await request(app).patch("/questions/1").send({});

    expect(invalidId.status).toBe(400);
    expect(invalidBody.status).toBe(400);
    expect(emptyPatch.status).toBe(400);
  });

  it("retorna 404 para matéria inexistente", async () => {
    const professor = await createUser();

    const response = await request(app).post("/questions").send({
      enunciado: "Questão inválida",
      dificuldade: 2,
      subjectId: 999999999,
      authorId: professor.body.data.id,
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("retorna 404 para autor inexistente", async () => {
    const professor = await createUser();

    const subject = await createSubject(professor.body.data.id);

    const response = await request(app).post("/questions").send({
      enunciado: "Questão inválida",
      dificuldade: 2,
      subjectId: subject.body.data.id,
      authorId: 999999999,
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("remove uma questão e confirma 404 depois", async () => {
    const professor = await createUser();

    const subject = await createSubject(professor.body.data.id);

    const created = await createQuestion(
      subject.body.data.id,
      professor.body.data.id,
    );

    const questionId = created.body.data.id;

    const removed = await request(app).delete(`/questions/${questionId}`);

    expect(removed.status).toBe(200);
    expect(removed.body.success).toBe(true);
    expect(removed.body.data.id).toBe(questionId);

    const found = await request(app).get(`/questions/${questionId}`);

    expect(found.status).toBe(404);
  });
});

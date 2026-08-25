import express from "express";
import prisma from "./config/database.js";

const app = express();

app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "OK",
      message: "API do Gerador de Provas",
      timestamp: new Date().toISOString(),
      services: {
        api: "OK",
        database: {
          status: "OK",
        },
      },
    });
  } catch (error) {
    console.error("Erro na verificação do banco:", error);

    res.status(503).json({
      status: "DEGRADED",
      message: "API do Gerador de Provas",
      services: {
        api: "OK",
        database: {
          status: "ERROR",
        },
      },
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        foto: true,
        createdAt: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao buscar usuários",
    });
  }
});

app.get("/subjects", async (req, res) => {
  try {
    const materias = await prisma.subject.findMany({
      select: {
        id: true,
        nome: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          select: {
            id: true,
            nome: true,
            email: true,
            papel: true,
            foto: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: materias,
      total: materias.length,
    });
  } catch (error) {
    console.error("Erro ao buscar matérias:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao buscar matérias",
    });
  }
});

app.get("/questions", async (req, res) => {
  try {
    const questoes = await prisma.question.findMany({
      select: {
        id: true,
        enunciado: true,
        dificuldade: true,
        respostaCorreta: true,
        ativa: true,
        createdAt: true,
        updatedAt: true,
        disciplina: {
          select: {
            id: true,
            nome: true,
            ativa: true,
          },
        },
        autor: {
          select: {
            id: true,
            nome: true,
            email: true,
            papel: true,
            foto: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const questoesFormatadas = questoes.map((questao) => ({
      id: questao.id,
      enunciado: questao.enunciado,
      dificuldade: questao.dificuldade,
      respostaCorreta: questao.respostaCorreta,
      ativa: questao.ativa,
      createdAt: questao.createdAt,
      updatedAt: questao.updatedAt,
      subject: questao.disciplina,
      author: questao.autor,
    }));

    res.status(200).json({
      success: true,
      data: questoesFormatadas,
      total: questoesFormatadas.length,
    });
  } catch (error) {
    console.error("Erro ao buscar questões:", error);

    res.status(500).json({
      success: false,
      message: "Erro ao buscar questões",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota " + req.method + " " + req.originalUrl + " não encontrada",
  });
});

export default app;
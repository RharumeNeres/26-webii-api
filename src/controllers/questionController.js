import prisma from "../config/database.js";

export async function listarQuestoes(req, res) {
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
}
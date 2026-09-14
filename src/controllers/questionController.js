import prisma from "../config/database.js";

export async function createQuestion(req,res){
  try{
    const {
      enunciado,
      dificuldade,
      respostaCorreta,
      disciplinaId,
      autorId,
      ativa
    }=req.body;

    if(!enunciado||!dificuldade||!disciplinaId||!autorId){
      return res.status(400).json({
        success:false,
        message:"Enunciado, dificuldade, disciplinaId e autorId são obrigatórios",
      });
    }

    const disciplina=await prisma.subject.findUnique({
      where:{
        id:Number(disciplinaId),
      },
    });

    if(!disciplina){
      return res.status(404).json({
        success:false,
        message:"Matéria não encontrada",
      });
    }

    const autor=await prisma.user.findUnique({
      where:{
        id:Number(autorId),
      },
    });

    if(!autor){
      return res.status(404).json({
        success:false,
        message:"Autor não encontrado",
      });
    }

    const questao=await prisma.question.create({
      data:{
        enunciado,
        dificuldade:Number(dificuldade),
        respostaCorreta:respostaCorreta||null,
        disciplinaId:Number(disciplinaId),
        autorId:Number(autorId),
        ativa:ativa===undefined?true:ativa,
      },
      include:{
        disciplina:{
          select:{
            id:true,
            nome:true,
            ativa:true,
          },
        },
        autor:{
          select:{
            id:true,
            nome:true,
            email:true,
            papel:true,
            foto:true,
          },
        },
      },
    });

    return res.status(201).json({
      success:true,
      data:{
        id:questao.id,
        enunciado:questao.enunciado,
        dificuldade:questao.dificuldade,
        respostaCorreta:questao.respostaCorreta,
        ativa:questao.ativa,
        createdAt:questao.createdAt,
        updatedAt:questao.updatedAt,
        subject:questao.disciplina,
        author:questao.autor,
      },
    });
  }catch(error){
    console.error("Erro ao criar questão:",error);

    return res.status(500).json({
      success:false,
      message:"Erro ao criar questão",
    });
  }
}

export async function getQuestions(req,res){
  try{
    const questoes=await prisma.question.findMany({
      select:{
        id:true,
        enunciado:true,
        dificuldade:true,
        respostaCorreta:true,
        ativa:true,
        createdAt:true,
        updatedAt:true,
        disciplina:{
          select:{
            id:true,
            nome:true,
            ativa:true,
          },
        },
        autor:{
          select:{
            id:true,
            nome:true,
            email:true,
            papel:true,
            foto:true,
          },
        },
      },
      orderBy:{
        id:"asc",
      },
    });

    const questoesFormatadas=questoes.map((questao)=>({
      id:questao.id,
      enunciado:questao.enunciado,
      dificuldade:questao.dificuldade,
      respostaCorreta:questao.respostaCorreta,
      ativa:questao.ativa,
      createdAt:questao.createdAt,
      updatedAt:questao.updatedAt,
      subject:questao.disciplina,
      author:questao.autor,
    }));

    return res.status(200).json({
      success:true,
      data:questoesFormatadas,
      total:questoesFormatadas.length,
    });
  }catch(error){
    console.error("Erro ao buscar questões:",error);

    return res.status(500).json({
      success:false,
      message:"Erro ao buscar questões",
    });
  }
}

export async function getQuestionById(req,res){
  try{
    const id=Number(req.params.id);

    const questao=await prisma.question.findUnique({
      where:{
        id,
      },
      include:{
        disciplina:{
          select:{
            id:true,
            nome:true,
            ativa:true,
          },
        },
        autor:{
          select:{
            id:true,
            nome:true,
            email:true,
            papel:true,
            foto:true,
          },
        },
      },
    });

    if(!questao){
      return res.status(404).json({
        success:false,
        message:"Questão não encontrada",
      });
    }

    return res.status(200).json({
      success:true,
      data:{
        id:questao.id,
        enunciado:questao.enunciado,
        dificuldade:questao.dificuldade,
        respostaCorreta:questao.respostaCorreta,
        ativa:questao.ativa,
        createdAt:questao.createdAt,
        updatedAt:questao.updatedAt,
        subject:questao.disciplina,
        author:questao.autor,
      },
    });
  }catch(error){
    console.error("Erro ao buscar questão:",error);

    return res.status(500).json({
      success:false,
      message:"Erro ao buscar questão",
    });
  }
}
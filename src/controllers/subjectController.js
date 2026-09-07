import prisma from "../config/database.js";

export async function createSubject(req,res){
  try{
    const {nome,professorId,ativa}=req.body;

    if(!nome||!professorId){
      return res.status(400).json({
        success:false,
        message:"Nome e professorId são obrigatórios",
      });
    }

    const professor=await prisma.user.findUnique({
      where:{
        id:Number(professorId),
      },
    });

    if(!professor){
      return res.status(404).json({
        success:false,
        message:"Professor não encontrado",
      });
    }

    const materia=await prisma.subject.create({
      data:{
        nome,
        professorId:Number(professorId),
        ativa:ativa===undefined?true:ativa,
      },
      include:{
        professor:{
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
      data:materia,
    });
  }catch(error){
    console.error("Erro ao criar matéria:",error);

    return res.status(500).json({
      success:false,
      message:"Erro ao criar matéria",
    });
  }
}

export async function getSubjects(req,res){
  try{
    const materias=await prisma.subject.findMany({
      include:{
        professor:{
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

    return res.status(200).json({
      success:true,
      data:materias,
      total:materias.length,
    });
  }catch(error){
    console.error("Erro ao buscar matérias:",error);

    return res.status(500).json({
      success:false,
      message:"Erro ao buscar matérias",
    });
  }
}

export async function getSubjectById(req,res){
  try{
    const id=Number(req.params.id);

    const materia=await prisma.subject.findUnique({
      where:{
        id,
      },
      include:{
        professor:{
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

    if(!materia){
      return res.status(404).json({
        success:false,
        message:"Matéria não encontrada",
      });
    }

    return res.status(200).json({
      success:true,
      data:materia,
    });
  }catch(error){
    console.error("Erro ao buscar matéria:",error);

    return res.status(500).json({
      success:false,
      message:"Erro ao buscar matéria",
    });
  }
}
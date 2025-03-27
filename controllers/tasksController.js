const { createTaskSchema } = require('../middlewares/validator');
const Tasks = require('../models/postsTaskModel')

exports.getAllTasks = async (req, res) => {
    const {page} = req.query;
    const tasksPerPage = 10;
    const { userId } = req.user;
    try {
        let pageNum = 0;
        if(page <= 1){
            pageNum = 0;
        }else {
            pageNum = page-1;
        }
        const result = await Tasks.find({userId}).sort({createdAt: -1}).skip(pageNum*tasksPerPage).limit(tasksPerPage).populate({
            path: 'userId',
            select: 'email'
        })
        const totalTasks = await Tasks.countDocuments();
        const totalPages = Math.ceil(totalTasks / tasksPerPage);

        const hasPrevious = pageNum > 0;
        const hasNext = pageNum < totalPages - 1;
        const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
        const nextUrl = hasNext ? `${baseUrl}?page=${pageNum + 2}` : null;
        const prevUrl = hasPrevious ? `${baseUrl}?page=${pageNum}` : null;

        res.status(200).json({success: true, message:"post", 
            count: totalTasks,
            next: nextUrl,
            previous: prevUrl,data:result});
    }catch(error){
        console.log(error)
    }
}

exports.getSpecificTask = async (req,res) => {
    const {_id} = req.query;
    try {
       
        const existingSingleTask = await Tasks.findOne({_id}).populate({
            path: 'userId',
            select: 'email'
        })
        if(!existingSingleTask){
            return res.status(404).json({ success: false, message: "Task does not exists" })
        }
        res.status(200).json({success: true, message:"single post", data:existingSingleTask});
    }catch(error){
        console.log(error)
    }
}

exports.createNewTask = async (req,res) => {
    const {title, description} = req.body;
    const {userId} = req.user;
    try {
        const {error,value} = createTaskSchema.validate({title, description,userId});
        if(error){
            return res.status(403).json({success:false, message:error.details[0].message})
        }

        const result = await Tasks.create({
            title,description,userId
        });
        return res.status(201).json({success: true, message: "create", data: result});
    }catch (error){
        console.log(error)
    }
}

exports.updateTask = async (req,res) => {
    const {_id} = req.query;
    const {title, description} = req.body;
    const {userId} = req.user;
    try {
        const {error,value} = createTaskSchema.validate({title, description,userId});
        if(error){
            return res.status(403).json({success:false, message:error.details[0].message})
        }
        const existingTask = await Tasks.findOne({_id});
        if(!existingTask){
            return res.status(404).json({ success: false, message: "Task does not exists" })
        }
        if(existingTask.userId.toString() !== userId){
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        existingTask.title = title;
        existingTask.description = description;

        const result = await existingTask.save();
        return res.status(200).json({success: true, message: "updated", data: result});
    }catch (error){
        console.log(error)
    }
}

exports.deleteTask = async (req,res) => {
    const {_id} = req.query;
    const {userId} = req.user;
    try {
       
        const existingTask = await Tasks.findOne({_id});
        if(!existingTask){
            return res.status(404).json({ success: false, message: "Task already not exists" })
        }
        if(existingTask.userId.toString() !== userId){
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        await Tasks.deleteOne({_id})
        return res.status(200).json({success: true, message: "deleted successfully"});
    }catch (error){
        console.log(error)
    }
}
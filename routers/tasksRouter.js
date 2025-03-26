const express = require('express');
const tasksController = require('../controllers/tasksController')
const { identifier } = require('../middlewares/identification');

const router = express.Router();

router.get('/tasks', identifier, tasksController.getAllTasks);
router.get('/specific-tasks/',identifier, tasksController.getSpecificTask);

router.post('/tasks', identifier, tasksController.createNewTask);

router.put('/update-tasks/', identifier, tasksController.updateTask)
router.delete('/delete-tasks/',identifier, tasksController.deleteTask)

module.exports = router;
import { Router } from 'express';
// import verifyAccessToken from '../middleware/verifyAccessToken';
// import { ChoiceController } from '../controllers/choice.controller';

const choiceRouter = Router();

// ДЛЯ АВТОРОВ

// Создать выбор
// router.post('/', verifyAccessToken, ChoiceController.createChoice);

// Обновить выбор
// router.put('/:choiceId', verifyAccessToken, ChoiceController.updateChoice);

// Удалить выбор
// router.delete('/:choiceId', verifyAccessToken, ChoiceController.deleteChoice);

// Получить все выборы для истории (для редактирования графа)
// router.get('/story/:storyId', verifyAccessToken, ChoiceController.getAllChoicesForStory);

// ДЛЯ ИГРОКОВ

// Получить выборы из узла (для прохождения)
// router.get('/node/:nodeId', verifyAccessToken, ChoiceController.getChoicesFromNode);

// Получить информацию о выборе
// router.get('/:choiceId', verifyAccessToken, ChoiceController.getChoiceById);

export default choiceRouter;
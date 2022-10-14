import { TodoAccess } from './todosAcess';
import { AttachmentUtils, bucket } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

const logger = createLogger('Todos')
const todoAccess = new TodoAccess()
const s3Utils = new AttachmentUtils()

export  const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
    logger.info(`Retrieving all todos for user ${userId}`, { userId })

   return todoAccess.getUserTodos(userId);
}

export const createTodo =  async (todo: CreateTodoRequest, user_id: string): Promise<TodoItem>  => {
    logger.info('cresting new todo');

    return todoAccess.createNewTodo({
        name: todo.name,
        dueDate: todo.dueDate}, user_id)
}

export const updateTodo = async (todo_id: string, user_id: string, items_to_update: UpdateTodoRequest ) => {

    const todo = await todoAccess.getToDoItem(todo_id)

    if (!todo){
        createError('Todo not found')
    }

    if (todo.userId != user_id) {
        createError('Not authorized to update todo');
    }

    return todoAccess.updateTodo(todo_id, user_id, items_to_update);
}

export const deleteTodo = async (todo_id: string, user_id: string ) => {

    const todo = await todoAccess.getToDoItem(todo_id)

    if (!todo){
        createError('Todo not found')
    }

    if (todo.userId != user_id) {
        createError('Not authorized to update todo');
    }

    return todoAccess.deleteTodo(todo_id, user_id);
}

export const createAttachmentPresignedUrl = async (todoId: string, userId: string) => {

    logger.info(`Generating attachment URL for attachment ${todoId}`)
    const attachmentUrl = await s3Utils.generateUploadUrl(todoId);


    logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })
    const todo = await todoAccess.getToDoItem(todoId)

    if (!todo){
        createError('Todo not found')
    }
  
    if (todo.userId !== userId) {
      logger.error(`User ${userId} does not have permission to update todo ${todoId}`)
       createError('User is not authorized to update item')
    }
  
    await todoAccess.updateTodoAttachmentUrl(todoId,userId, attachmentUrl)
}
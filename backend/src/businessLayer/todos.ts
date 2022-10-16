import { TodoAccess } from '../dataLayer/todosAcess';
import { AttachmentUtils } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
// import * as createError from 'http-errors'
import * as uuid from 'uuid'


// TODO: Implement businessLogic

const logger = createLogger('Todos')
const todoAccess = new TodoAccess()
const s3Utils = new AttachmentUtils()

export  const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
    logger.info(`Retrieving all todos for user ${userId}`, { userId })

   return todoAccess.getUserTodos(userId);
}

export const createTodo =  async (todo: CreateTodoRequest, user_id: string): Promise<TodoItem>  => {
    logger.info('creating new todo');

    const newItem = {
        name: todo.name,
        dueDate: todo.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
        userId: user_id,
        todoId: await  uuid.v4()
      }
    return todoAccess.createNewTodo(newItem)
}

export const updateTodo = async (todo_id: string, user_id: string, items_to_update: UpdateTodoRequest ) => {
    return todoAccess.updateTodo(todo_id, user_id, items_to_update);
}

export const deleteTodo = async (todo_id: string, user_id: string ) => {
    return todoAccess.deleteTodo(todo_id, user_id);
}

export const createAttachmentPresignedUrl = async (todoId: string, userId: string) => {

    logger.info(`Generating attachment URL for attachment ${todoId}`)
    const attachmentUrl = await s3Utils.generateUploadUrl(todoId);

    logger.info(`Updating todo ${todoId} with attachment URL ${attachmentUrl}`, { userId, todoId })
  
    await todoAccess.updateTodoAttachmentUrl(todoId,userId, attachmentUrl)
}
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import * as uuid from 'uuid'
import { CreateTodoRequest } from '../../../client/src/types/CreateTodoRequest';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

const dynamoDBDocClient = new XAWS.DynamoDB.DocumentClient()
const table = process.env.TODOS_TABLE ?? 'Todos-dev'
const todoIdIndex = process.env.TODOS_ID_INDEX ?? 'todoId'

export class TodoAccess {
  async getUserTodos(userId: string): Promise<TodoItem[]> {
    const todos = await dynamoDBDocClient
      .query({
        TableName: table,
        IndexName: 'todoId',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return todos.Items as TodoItem[]
  }

  async getToDoItem(todoId: string): Promise<TodoItem> {
    const result = await dynamoDBDocClient
      .query({
        TableName: table,
        IndexName: todoIdIndex,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise()
    return result.Items[0] as TodoItem
  }

  async createNewTodo(todo: CreateTodoRequest, user_id: string) : Promise<TodoItem> {
    try {
      const newItem = {
        name: todo.name,
        dueDate: todo.dueDate,
        createdAt: new Date().toISOString(),
        done: false,
        userId: user_id,
        todoId: await  uuid.v4()
      }

      await dynamoDBDocClient
        .put({
          TableName: table,
          Item: newItem
        })
        .promise()

      return newItem
    } catch (error) {
      logger.log(error)
      return error
    }
  }

  async updateTodo(todoId: string, userId: string, toUpdate: TodoUpdate) {
    const params = {
      TableName: table,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeValues: {
        ':name': toUpdate.name,
        ':dueDate': toUpdate.dueDate,
        ':done': toUpdate.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      }
    }

    try {
      await dynamoDBDocClient.update(params).promise()
    } catch (error) {
      logger.log(error)
      return error
    }
  }

  async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
    const params = {
      TableName: table,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl,
      },
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      }
    }

    try {
      await dynamoDBDocClient.update(params).promise()
    } catch (error) {
      logger.log(error)
      return error
    }
  }

  async deleteTodo(todoId: string, userId: string) {
    const params = {
      TableName: table,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }

    try {
      await dynamoDBDocClient.delete(params)
      return true
    } catch (error) {
      logger.log(error)
      return error
    }
  }
}

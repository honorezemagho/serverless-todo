import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../../../client/src/types/CreateTodoRequest';
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
const AWSXRay = require('aws-xray-sdk');

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

const todoIdIndex = process.env.TODOS_ID_INDEX ?? 'todoId'


export class TodoAccess {

  constructor(
    private docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private todosTable: string = process.env.TODOS_TABLE ?? 'Todos-dev',
  ){}
  async getUserTodos(userId: string): Promise<TodoItem[]> {
    const todos = await this.docClient
      .query({
        TableName: this.todosTable,
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
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: todoIdIndex,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise()
    return result.Items[0] as TodoItem
  }

  async createNewTodo(newItem: TodoItem) : Promise<TodoItem> {
    try {
      await this.docClient
        .put({
          TableName: this.todosTable,
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
      TableName: this.todosTable,
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
      await this.docClient.update(params).promise()
    } catch (error) {
      logger.log(error)
      return error
    }
  }

  async updateTodoAttachmentUrl(todoId: string, userId: string, attachmentUrl: string) {
    const params = {
      TableName: this.todosTable,
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
      await this.docClient.update(params).promise()
    } catch (error) {
      logger.log(error)
      return error
    }
  }

  async deleteTodo(todoId: string, userId: string) {
    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }

    try {
      await this.docClient.delete(params)
      return true
    } catch (error) {
      logger.log(error)
      return error
    }
  }
}

import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { deleteTodo } from '../../businessLayer/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id
    console.log(event);
    const userId = await getUserId(event);
    await deleteTodo(todoId, userId);

    return  {
      statusCode: 200,
      body: ''
  }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { updateTodo } from '../../businessLayer/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    console.log(event);
    const userId = await getUserId(event);
    await updateTodo(todoId, userId, updatedTodo);

    return  {
      statusCode: 201,
      body: JSON.stringify({
        item: {done: true, ...updatedTodo}
      })
  };
  
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

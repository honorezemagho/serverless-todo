import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils';
import { getTodosForUser } from '../../helpers/todos';

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here

    // get user id
    const userId = await getUserId(event)
    const todos = await getTodosForUser(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        item: todos
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

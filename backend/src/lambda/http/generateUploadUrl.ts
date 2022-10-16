import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'


import { getUserId } from '../utils'
import { createAttachmentPresignedUrl } from '../../businessLayer/todos'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    console.log(event);

    const userId = await getUserId(event)
    const url = await createAttachmentPresignedUrl(todoId, userId);

    return  {
      statusCode: 201,
      body: JSON.stringify({
        item: url
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

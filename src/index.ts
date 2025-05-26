import {
  messagingApi,
  middleware as lineMiddleware,
  WebhookRequestBody,
} from '@line/bot-sdk'
import { Hono } from 'hono'

import { getWasteScheduleMessage } from './lib'
import { EnvPublic } from './types'

type Env = {
  CHANNEL_SECRET: string
  CHANNEL_ACCESS_TOKEN: string
} & EnvPublic

const app = new Hono<{ Bindings: Env }>()

app.use('*', async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`)
  return next()
})

app.use('/webhook', async (c, next) => {
  try {
    lineMiddleware({ channelSecret: c.env.CHANNEL_SECRET })
  } catch (err) {
    console.error('Middleware initialization failed:', err)
    return c.text('', 200)
  }

  return next()
})

app.post('/webhook', async (c) => {
  let body: WebhookRequestBody

  try {
    body = await c.req.json()
  } catch (err) {
    console.log('Failed to parse JSON:', err)
    return c.text('', 200)
  }

  if (!body.events || body.events.length === 0) {
    console.error('No events array in request body:', body)
    return c.text('', 200)
  }

  const event = body.events[0]

  if (event.type !== 'message' || event.message.type !== 'text') {
    return c.text('', 200)
  }

  const { MessagingApiClient } = messagingApi

  const client = new MessagingApiClient({
    channelAccessToken: c.env.CHANNEL_ACCESS_TOKEN,
  })

  try {
    const messageText = getWasteScheduleMessage(new Date(), c.env)

    await client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: messageText,
        },
      ],
    })
  } catch (err) {
    console.error('ReplyMessage failed:', err)
  }

  return c.text('', 200)
})

export default {
  fetch: app.fetch,
}

import {
  messagingApi,
  middleware as lineMiddleware,
  WebhookRequestBody,
} from '@line/bot-sdk'
import { Hono } from 'hono'

import { getThisMonthWorkList, toJST } from './lib'

type HonoEnv = {
  Bindings: {
    CHANNEL_SECRET: string
    CHANNEL_ACCESS_TOKEN: string
  }
}

const app = new Hono<HonoEnv>()

app.use('/webhook', async (c, next) => {
  lineMiddleware({ channelSecret: c.env.CHANNEL_SECRET })
  await next()
})

app.post('/webhook', async (c) => {
  const { MessagingApiClient } = messagingApi

  const client = new MessagingApiClient({
    channelAccessToken: c.env.CHANNEL_ACCESS_TOKEN,
  })

  const now = toJST(new Date())
  const schedule = getThisMonthWorkList(now)
  const today = schedule[now.getDate() - 1]
  const tomorrow = schedule[now.getDate()]
  const gomiUrl =
    'https://www.city.kita.tokyo.jp/kitakuseiso/kurashi/gomi/bunbetsu/chirashi/gomi.html'

  const body = await c.req.json<WebhookRequestBody>()
  const event = body.events[0]

  if (event.type !== 'message' || event.message.type !== 'text')
    return c.text('OK')

  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: 'text',
        text: `今日は${today}\n明日は${tomorrow}\n\n${gomiUrl}`,
      },
    ],
  })

  return c.text('OK')
})

export default {
  fetch: app.fetch,
}

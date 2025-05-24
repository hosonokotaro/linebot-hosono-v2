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

app.post('/webhook', async (c) => {
  lineMiddleware({ channelSecret: c.env.CHANNEL_SECRET })

  let body: WebhookRequestBody

  try {
    body = await c.req.json()
  } catch (err) {
    console.log('Failed to parse JSON:', err)
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

  const now = toJST(new Date())
  const schedule = getThisMonthWorkList(now)
  const today = schedule[now.getDate() - 1]
  const tomorrow = schedule[now.getDate()]
  const gomiUrl =
    'https://www.city.kita.tokyo.jp/kitakuseiso/kurashi/gomi/bunbetsu/chirashi/gomi.html'

  await client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: 'text',
        text: `今日は${today}\n明日は${tomorrow}\n\n${gomiUrl}`,
      },
    ],
  })

  return c.text('', 200)
})

export default {
  fetch: app.fetch,
}

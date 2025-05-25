export const toJST = (date: Date) => {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
}

export const getThisMonthWorkList = (baseDate: Date) => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)
  const workList = [
    '無し', // 日
    '無し', // 月
    '可燃ごみ', // 火
    '無し', // 水 一週目、三週目: 不燃ごみ
    '古紙', // 木
    '可燃ごみ、ビン、缶、ペットボトル', // 金
    '無し', // 土
  ]

  const result = []
  let dayOfWeek = start.getDay()
  let wednesdayCount = 0

  for (let d = 1; d <= end.getDate(); d++) {
    if (dayOfWeek > 6) dayOfWeek = 0
    if (dayOfWeek === 3 && (wednesdayCount === 0 || wednesdayCount === 2)) {
      result.push('不燃ごみ')
    } else {
      result.push(workList[dayOfWeek])
    }
    if (dayOfWeek === 3) wednesdayCount++
    dayOfWeek++
  }

  return result
}

export const getWasteScheduleMessage = (date: Date): string => {
  const now = toJST(date)
  const schedule = getThisMonthWorkList(now)
  const today = schedule[now.getDate() - 1]
  const tomorrow = schedule[now.getDate()]
  const gomiUrl =
    'https://www.city.kita.tokyo.jp/kitakuseiso/kurashi/gomi/bunbetsu/chirashi/gomi.html'

  return `今日は${today}\n明日は${tomorrow}\n\n${gomiUrl}`
}

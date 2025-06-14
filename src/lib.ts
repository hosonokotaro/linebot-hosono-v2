import { EnvPublic } from './types'

/**
 * 指定された月のゴミ収集スケジュールを生成する
 * @param baseDate - スケジュールを生成したい月の任意の日付
 * @returns 月の各日のゴミ収集種別の配列（インデックス0が1日）
 */
export const getCurrentMonthWorkList = (baseDate: Date) => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)

  const WEEK = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  } as const

  const result: string[] = []

  // NOTE: 実際の日付は dayCount を +1 した値
  for (let dayCount = 0; dayCount < end.getDate(); dayCount++) {
    const currentDayOfWeek = (start.getDay() + dayCount) % 7
    const isFirstOrThirdWeekWednesday =
      dayCount <= 6 || (dayCount >= 14 && dayCount <= 20)

    switch (currentDayOfWeek) {
      case WEEK.SUNDAY:
      case WEEK.MONDAY:
      case WEEK.SATURDAY:
        result.push('無し')
        break
      case WEEK.TUESDAY:
        result.push('可燃ごみ')
        break
      case WEEK.WEDNESDAY:
        // NOTE: 第1週と第3週の水曜日は不燃ごみ
        result.push(isFirstOrThirdWeekWednesday ? '不燃ごみ' : '無し')
        break
      case WEEK.THURSDAY:
        result.push('古紙、プラスチック')
        break
      case WEEK.FRIDAY:
        result.push('可燃ごみ、びん、缶、ペットボトル')
        break
      default:
        result.push('無し')
    }
  }

  return result
}

export const getWasteScheduleMessage = (date: Date, env: EnvPublic): string => {
  const now = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  const schedule = getCurrentMonthWorkList(now)

  // NOTE: todayNumber は 1 から始まることに留意する
  const todayNumber = now.getDate()
  let tomorrow = schedule[todayNumber]

  if (todayNumber === schedule.length) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const nextMonthSchedule = getCurrentMonthWorkList(nextMonth)
    tomorrow = nextMonthSchedule[0]
  }

  const today = schedule[todayNumber - 1]

  return `今日は${today}\n明日は${tomorrow}\n\n${env.URL_GOMI}`
}

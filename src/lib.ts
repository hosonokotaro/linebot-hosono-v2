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
  let wednesdayCount = 0

  for (let day = 0; day < end.getDate(); day++) {
    const currentDayOfWeek = (start.getDay() + day) % 7

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
        wednesdayCount++
        // NOTE: 第1週と第3週の水曜日は不燃ごみ
        result.push(
          wednesdayCount === 1 || wednesdayCount === 3 ? '不燃ごみ' : '無し',
        )
        break
      case WEEK.THURSDAY:
        result.push('古紙')
        break

      case WEEK.FRIDAY:
        result.push('可燃ごみ、ビン、缶、ペットボトル')
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
  const today = schedule[now.getDate() - 1]
  const tomorrow = schedule[now.getDate()]

  return `今日は${today}\n明日は${tomorrow}\n\n${env.URL_GOMI}`
}

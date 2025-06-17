import { EnvPublic } from './types'

const WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const

type WeekDay = (typeof WEEK)[keyof typeof WEEK]

const scheduleMap = {
  [WEEK.SUNDAY]: () => '無し',
  [WEEK.MONDAY]: () => '無し',
  [WEEK.TUESDAY]: () => '可燃ごみ',
  [WEEK.WEDNESDAY]: (dayCount) =>
    dayCount <= 6 || (dayCount >= 14 && dayCount <= 20) ? '不燃ごみ' : '無し',
  [WEEK.THURSDAY]: () => '古紙、プラスチック',
  [WEEK.FRIDAY]: () => '可燃ごみ、びん、缶、ペットボトル',
  [WEEK.SATURDAY]: () => '無し',
} satisfies Record<WeekDay, (n: number) => string>

const isWeekDay = (n: number): n is WeekDay => {
  return n >= 0 && n < 7
}

/**
 * 指定された月のゴミ収集スケジュールを生成する
 * @param baseDate - スケジュールを生成したい月の任意の日付
 * @returns 月の各日のゴミ収集種別の配列（インデックス0が1日）
 */
export const getCurrentMonthWorkList = (baseDate: Date) => {
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  const end = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)

  const result: string[] = []

  for (let dayCount = 0; dayCount < end.getDate(); dayCount++) {
    const currentDayOfWeek = (start.getDay() + dayCount) % 7

    if (isWeekDay(currentDayOfWeek)) {
      result.push(scheduleMap[currentDayOfWeek](dayCount))
    }
  }

  return result
}

export const getWasteScheduleMessage = (date: Date, env: EnvPublic): string => {
  const now = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  const workList = getCurrentMonthWorkList(now)
  const todayNumber = now.getDate()
  const todayIndex = todayNumber - 1

  let tomorrowWork = workList[todayIndex + 1]

  if (todayNumber === workList.length) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const nextMonthWorkList = getCurrentMonthWorkList(nextMonth)

    tomorrowWork = nextMonthWorkList[0]
  }

  const todayWork = workList[todayIndex]

  return `今日は${todayWork}\n明日は${tomorrowWork}\n\n${env.URL_GOMI}`
}

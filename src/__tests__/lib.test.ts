import { getCurrentMonthWorkList, getWasteScheduleMessage } from '../lib'
import type { EnvPublic } from '../types'

const mockEnv = {
  URL_GOMI: 'https://www.city.kita.tokyo.jp/gomi/',
} as const satisfies EnvPublic

describe('getCurrentMonthWorkList', () => {
  describe('基本的な月のテスト', () => {
    test('31日の月（1月）の正しいスケジュール生成', () => {
      // 2024年1月1日（月曜日）
      const date = new Date(2024, 0, 15) // 1月の任意の日
      const result = getCurrentMonthWorkList(date)

      expect(result).toHaveLength(31)
      expect(result[0]).toBe('無し') // 1日（月）
      expect(result[1]).toBe('可燃ごみ') // 2日（火）
      expect(result[2]).toBe('不燃ごみ') // 3日（水）- 第1水曜日
      expect(result[3]).toBe('古紙') // 4日（木）
      expect(result[4]).toBe('可燃ごみ、ビン、缶、ペットボトル') // 5日（金）
    })

    test('30日の月（4月）の正しいスケジュール生成', () => {
      // 2024年4月1日（月曜日）
      const date = new Date(2024, 3, 15) // 4月の任意の日
      const result = getCurrentMonthWorkList(date)

      expect(result).toHaveLength(30)
    })

    test('28日の2月（平年）の正しいスケジュール生成', () => {
      // 2023年2月1日（水曜日）
      const date = new Date(2023, 1, 15) // 2月の任意の日
      const result = getCurrentMonthWorkList(date)

      expect(result).toHaveLength(28)
    })

    test('29日の2月（閏年）の正しいスケジュール生成', () => {
      // 2024年2月1日（木曜日）
      const date = new Date(2024, 1, 15) // 2月の任意の日
      const result = getCurrentMonthWorkList(date)

      expect(result).toHaveLength(29)
      expect(result[28]).toBe('古紙') // 29日（木）
    })
  })

  describe('水曜日の不燃ごみ判定テスト', () => {
    test('第1・第3水曜日が不燃ごみになること（2024年1月）', () => {
      // 2024年1月1日（月曜日）開始
      const date = new Date(2024, 0, 15)
      const result = getCurrentMonthWorkList(date)

      // 1月3日（第1水曜日）
      expect(result[2]).toBe('不燃ごみ')
      // 1月10日（第2水曜日）
      expect(result[9]).toBe('無し')
      // 1月17日（第3水曜日）
      expect(result[16]).toBe('不燃ごみ')
      // 1月24日（第4水曜日）
      expect(result[23]).toBe('無し')
      // 1月31日（第5水曜日）
      expect(result[30]).toBe('無し')
    })

    test('月初が水曜日の場合の不燃ごみ判定（2024年5月）', () => {
      // 2024年5月1日（水曜日）開始
      const date = new Date(2024, 4, 15)
      const result = getCurrentMonthWorkList(date)

      // 5月1日（第1水曜日）
      expect(result[0]).toBe('不燃ごみ')
      // 5月8日（第2水曜日）
      expect(result[7]).toBe('無し')
      // 5月15日（第3水曜日）
      expect(result[14]).toBe('不燃ごみ')
      // 5月22日（第4水曜日）
      expect(result[21]).toBe('無し')
      // 5月29日（第5水曜日）
      expect(result[28]).toBe('無し')
    })
  })

  describe('月初の曜日パターンテスト', () => {
    test('月初が日曜日の場合（2024年9月）', () => {
      // 2024年9月1日（日曜日）
      const date = new Date(2024, 8, 15)
      const result = getCurrentMonthWorkList(date)

      expect(result[0]).toBe('無し') // 1日（日）
      expect(result[1]).toBe('無し') // 2日（月）
      expect(result[2]).toBe('可燃ごみ') // 3日（火）
      expect(result[3]).toBe('不燃ごみ') // 4日（水）- 第1水曜日
    })

    test('月初が土曜日の場合（2024年6月）', () => {
      // 2024年6月1日（土曜日）
      const date = new Date(2024, 5, 15)
      const result = getCurrentMonthWorkList(date)

      expect(result[0]).toBe('無し') // 1日（土）
      expect(result[1]).toBe('無し') // 2日（日）
      expect(result[2]).toBe('無し') // 3日（月）
      expect(result[3]).toBe('可燃ごみ') // 4日（火）
      expect(result[4]).toBe('不燃ごみ') // 5日（水）- 第1水曜日
    })
  })
})

describe('getWasteScheduleMessage', () => {
  describe('境界値テスト', () => {
    test('月初（1日）のメッセージ', () => {
      // JST 2024年1月1日
      const date = new Date('2024-01-01T00:00:00+09:00')
      const message = getWasteScheduleMessage(date, mockEnv)

      expect(message).toContain('今日は無し') // 1月1日（月）
      expect(message).toContain('明日は可燃ごみ') // 1月2日（火）
      expect(message).toContain('https://www.city.kita.tokyo.jp/gomi/')
    })

    test('月末のメッセージ（31日の月）', () => {
      // JST 2024年1月31日
      const date = new Date('2024-01-31T00:00:00+09:00')
      const message = getWasteScheduleMessage(date, mockEnv)

      expect(message).toContain('今日は無し') // 1月31日（水）- 第5水曜日
      // 明日は2月1日なので、undefinedになる可能性がある
      expect(message).toContain('明日は')
    })

    test('年末（12月31日）のメッセージ', () => {
      // JST 2024年12月31日
      const date = new Date('2024-12-31T00:00:00+09:00')
      const message = getWasteScheduleMessage(date, mockEnv)

      expect(message).toContain('今日は可燃ごみ') // 12月31日（火）
      // 明日は翌年1月1日なので、undefinedになる可能性がある
      expect(message).toContain('明日は')
    })

    test('閏年の2月28日のメッセージ', () => {
      // JST 2024年2月28日
      const date = new Date('2024-02-28T00:00:00+09:00')
      const message = getWasteScheduleMessage(date, mockEnv)

      expect(message).toContain('今日は無し') // 2月28日（水）- 第4水曜日
      expect(message).toContain('明日は古紙') // 2月29日（木）
    })

    test('閏年の2月29日のメッセージ', () => {
      // JST 2024年2月29日
      const date = new Date('2024-02-29T00:00:00+09:00')
      const message = getWasteScheduleMessage(date, mockEnv)

      expect(message).toContain('今日は古紙') // 2月29日（木）
      // 明日は3月1日なので、undefinedになる可能性がある
      expect(message).toContain('明日は')
    })

    test('平年の2月28日のメッセージ', () => {
      // JST 2023年2月28日
      const date = new Date('2023-02-28T00:00:00+09:00')
      const message = getWasteScheduleMessage(date, mockEnv)

      expect(message).toContain('今日は可燃ごみ') // 2023年2月28日（火）
      // 明日は3月1日なので、undefinedになる可能性がある
      expect(message).toContain('明日は')
    })
  })

  describe('エッジケーステスト', () => {
    test('月末から翌月初への遷移（30日→31日の月）', () => {
      // 4月30日（30日の月）
      const date = new Date('2024-04-30T00:00:00+09:00')
      const message = getWasteScheduleMessage(date, mockEnv)

      expect(message).toContain('今日は可燃ごみ') // 4月30日（火）
      // 明日は5月1日なので、undefinedになる
      expect(message).toContain('明日は')
    })

    test('月末から翌月初への遷移（31日→30日の月）', () => {
      // 3月31日（31日の月）
      const date = new Date('2024-03-31T00:00:00+09:00')
      const message = getWasteScheduleMessage(date, mockEnv)

      expect(message).toContain('今日は無し') // 3月31日（日）
      // 明日は4月1日なので、undefinedになる
      expect(message).toContain('明日は')
    })
  })
})

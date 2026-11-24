import z from 'zod'

export const mealTimes = [
  'breakfast',
  'lunch',
  'diner',
  'snack',
] as const

export const mealTimeSchema = z.enum(mealTimes)

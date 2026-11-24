import z from 'zod'

export const tagRequestSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du tag ne doit pas être vide'),
})

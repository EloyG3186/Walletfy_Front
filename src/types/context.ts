import { z } from 'zod';

export const ThemeSchema = z.object({
  schema: z.enum(['light', 'dark']),
  toggleSchema: z.function().returns(z.void()),
});

export type ThemeType = z.infer<typeof ThemeSchema>;

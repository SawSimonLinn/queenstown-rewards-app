import { z } from 'zod';

const dateOnly = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD')
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Enter a valid date');

const optionalUrl = z
  .string()
  .trim()
  .url('Enter a valid URL')
  .optional()
  .or(z.literal(''));

export const specialSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    description: z.string().trim().min(1, 'Description is required'),
    imageUrl: optionalUrl,
    startDate: dateOnly,
    endDate: dateOnly,
    locationIds: z.array(z.string()),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type SpecialFormValues = z.infer<typeof specialSchema>;

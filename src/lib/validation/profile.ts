import { z } from 'zod';

export const editProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
});
export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

const email = z.string().trim().min(1, 'Email is required').email('Enter a valid email address');

export function createChangeEmailSchema(currentEmail: string) {
  return z
    .object({
      newEmail: email,
      confirmNewEmail: z.string().trim().min(1, 'Confirm your new email address'),
    })
    .refine((data) => data.newEmail === data.confirmNewEmail, {
      message: "Email addresses don't match",
      path: ['confirmNewEmail'],
    })
    .refine((data) => data.newEmail.toLowerCase() !== currentEmail.toLowerCase(), {
      message: 'This is already your current email address',
      path: ['newEmail'],
    });
}
export type ChangeEmailFormValues = z.infer<ReturnType<typeof createChangeEmailSchema>>;

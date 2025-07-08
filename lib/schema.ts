import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string()
    .min(1, 'Họ tên không được để trống')
    .regex(/^[\p{L}\s]+$/u, 'Chỉ được chứa chữ và khoảng trắng'),

  username: z.string()
    .min(1, 'Tên đăng nhập không được để trống')
    .regex(/^\S+$/, 'Không được chứa khoảng trắng'),

  email: z.string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),

  targetScore: z
    .union([
      z
        .string()
        .trim()
        .refine(
          (val) => {
            if (!val) return true;
            const num = Number(val);
            return (
              !isNaN(num) &&
              Number.isInteger(num) &&
              num >= 0 &&
              num <= 990 &&
              num % 5 === 0
            );
          },
          {
            message: 'Điểm phải từ 0-990 và chia hết cho 5',
          }
        ),
      z.literal(''),
    ])
    .optional(),

   examDate: z
  .union([
    z.string().refine(
      (val) => {
        if (!val) return true; 
        const date = new Date(val);
        const now = new Date();
        return date >= new Date(now.toDateString()); 
      },
      { message: 'Ngày dự thi không được nhỏ hơn hôm nay' }
    ),
    z.literal('').transform(() => undefined),
  ])
  .optional(),

});

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Vui lòng nhập mật khẩu hiện tại'),

  newPassword: z.string()
    .min(8, 'Tối thiểu 8 ký tự')
    .regex(/^\S+$/, 'Không được chứa khoảng trắng'),

  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Xác nhận mật khẩu không khớp',
  path: ['confirmPassword'],
});


export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, { message: "Identifier is required" })
    .regex(
      /^[a-zA-Z0-9._+\-@]+$/,
      { message: "Chỉ chấp nhận các ký tự đặc biệt, '.', '_', '+', '-', và '@'." }
    ),
  password: z
    .string()
    .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
    .regex(/^\S+$/, { message: "Mật khẩu không được chứa khoảng trắng" }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

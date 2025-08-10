import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string()
    .min(1, 'Họ tên không được để trống')
    .regex(/^[\p{L}\s]+$/u, 'Chỉ được chứa chữ và khoảng trắng'),

  username: z.string()
    .min(1, 'Tên đăng nhập không được để trống')
    .regex(/^[a-zA-Z0-9._+@-]+$/, 'Không được chứa khoảng trắng và ký tự đặc biệt trừ -, +, _, ., @'),

  email: z.string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
    .regex(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email không hợp lệ'),

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
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; 
        const date = new Date(val);
        const today = new Date();
        return date >= new Date(today.toDateString());
      },
      { message: 'Ngày dự thi không được nhỏ hơn hôm nay' }
    ),
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

export const registerSchema = z.object({
  fullName: z.string()
    .min(1, 'Họ tên không được để trống')
    .regex(/^[\p{L}\s]+$/u, 'Chỉ được chứa chữ và khoảng trắng'),

  username: z.string()
    .min(1, 'Tên đăng nhập không được để trống')
    .regex(/^[a-zA-Z0-9._+@-]+$/, 'Không được chứa khoảng trắng và ký tự đặc biệt trừ -, +, _, ., @'),

  email: z.string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ')
    .regex(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Email không hợp lệ'),

  password: z.string()
    .min(8, 'Tối thiểu 8 ký tự')
    .regex(/^\S{8,}$/, 'Không được chứa khoảng trắng'),

  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Xác nhận mật khẩu không khớp',
  path: ['confirmPassword'],
});

const CATEGORY_PATTERN = /^[a-zA-Z0-9\s_\.!]*$/;

export const categorySchema = z.object({
  categoryName: z
    .string()
    .min(1, 'Tên danh mục là bắt buộc')
    .max(255, 'Tên danh mục phải ít hơn 255 ký tự')
    .regex(
      CATEGORY_PATTERN,
      'Tên danh mục chỉ được chứa chữ cái, số, khoảng trắng, "_", "." và "!"'
    ),
  description: z
    .string()
    .regex(
      CATEGORY_PATTERN,
      'Mô tả chỉ được chứa chữ cái, số, khoảng trắng, "_", "." và "!"'
    )
    .optional()
    .or(z.literal('')),
});


export const createFlashcardListSchema = z.object({
  listName: z
    .string()
    .trim()
    .max(255, 'Tiêu đề không được vượt quá 255 ký tự')
    .superRefine((val, ctx) => {
      if (val.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: 3,
          type: "string",
          inclusive: true,
          message: "Tiêu đề nên nhiều hơn 3 ký tự",
        });
        return;
      }
  
      if (!/^[\p{L}\p{N}\s._-]+$/u.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tiêu đề chỉ được chứa chữ, số, khoảng trắng và ký tự ., _, -",
        });
      }
  
      if (/^(\w)\1+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Tiêu đề không được là chuỗi lặp ký tự duy nhất",
        });
      }
    }),
  description: z
    .string()
    .trim()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional(),
});

export const createFlashcardSchema = z.object({
  frontText: z.string()
    .trim()
    .min(2, 'Từ mới phải có ít nhất 2 ký tự')
    .max(255, 'Từ mới không được vượt quá 255 ký tự'),

  backText: z.string()
    .trim()
    .min(2, 'Định nghĩa phải có ít nhất 2 ký tự')
    .max(255, 'Định nghĩa không được vượt quá 255 ký tự'),

  category: z.string()
    .trim()
    .min(1, 'Loại từ là bắt buộc')
    .regex(
      /^(noun|verb|adjective|adverb|preposition|conjunction|interjection|pronoun|article)$/,
      'Loại từ không hợp lệ'
    ),
});

export const updateFlashcardListSchema = createFlashcardListSchema.extend({
  flashcards: z.array(createFlashcardSchema)
    .min(1, 'Danh sách phải có ít nhất một flashcard')
    .max(500, 'Danh sách không được vượt quá 500 flashcard'),
});

export const createExamSchema = z.object({
  examName: z
    .string()
    .min(1, "Tên đề không được để trống")
    .max(255, "Tên đề không được dài quá 255 ký tự"),

  examDescription: z
    .string()
    .min(1, "Mô tả không được để trống")
    .max(500, "Mô tả không được dài quá 500 ký tự"),

  totalQuestions: z
    .coerce
    .number()
    .int()
    .min(0, "Số câu hỏi phải là 0"),

  listeningAudioUrl: z
    .string()
    .min(1, "URL audio không được trống")
    .url("Đây không phải là một URL hợp lệ"),

  categoryId: z
    .number({
      required_error: "Vui lòng chọn danh mục",
      invalid_type_error: "Danh mục không hợp lệ",
    })
    .int()
    .positive("Danh mục không hợp lệ"),

  examParts: z
    .array(
      z.object({
        partNumber: z
          .number()
          .int()
          .min(1)
          .max(7),

        partName: z
          .string()
          .min(1, "Tên phần không được trống"),

        description: z
          .string()
          .max(255, "Mô tả phần không được vượt quá 255 ký tự")
          .optional(),

        questionCount: z
          .number()
          .int()
          .max(100, "Mỗi phần không được vượt quá 100 câu"),

        enabled: z
          .boolean(),
      })
    )
    .length(7, "Đề thi TOEIC cần đúng 7 phần"),
});

export const ExamInfoEditSchema = z.object({
  examName: z.string().min(1, "Tên đề không được trống"),
  examDescription: z.string().min(1, "Mô tả không được trống"),
  totalQuestions: z.number().int().min(0),               // read-only
  listeningAudioUrl: z.string().url("URL audio không hợp lệ").min(1),
  status: z.enum(["PRIVATE", "PUBLIC", "PENDING", "CANCELLED"]),
  categoryId: z.number().int().positive("Vui lòng chọn danh mục"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type CreateFlashcardListFormData = z.infer<typeof createFlashcardListSchema>;
export type CreateFlashcardFormData = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardListFormData = z.infer<typeof updateFlashcardListSchema>;
export type CreateExamFormData = z.infer<typeof createExamSchema>;
export type ExamInfoEditFormData = z.infer<typeof ExamInfoEditSchema>;
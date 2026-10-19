import { JLPTExam } from './exam.types';

/**
 * NIHONAI JLPT EXAM REPOSITORY
 * Toàn bộ kho đề thi JLPT qua các năm (2020 - 2025 đợt 07 & 12 + JEES Official)
 * đã được chuyển đổi lưu trữ trực tiếp 100% trong cơ sở dữ liệu MySQL thông qua Prisma ORM
 * (bảng `jlpt_exams`, `jlpt_questions`, `jlpt_exam_attempts`).
 */
export const OFFICIAL_JLPT_EXAMS: JLPTExam[] = [];


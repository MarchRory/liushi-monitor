import { selectCourseParams } from "@/api/types/courses";

export type HomeSearchParams = Pick<selectCourseParams, 'category' | 'state'> & { departmentLimit?: string[], gradeLimit?: string[] }
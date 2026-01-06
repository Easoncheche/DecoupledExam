import { axiosInstance } from '../axios';

/**
 * 教师绑定学科
 * @param teacherId 教师ID
 * @param subjectId 学科ID
 * @param isMain 是否为主要学科（1=是，0=否）
 * @param token JWT token
 * @returns 接口响应
 */
export const bindTeacherSubjectAPI = async (
  teacherId: number,
  subjectId: number,
  isMain: number,
  token: string
) => {
  try {
    const response = await axiosInstance.post(
      '/api/teacher/subject',
      {
        teacherId,
        subjectId,
        isMain
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('教师绑定学科失败:', error);
    throw error;
  }
};

/**
 * 获取教师的绑定学科列表
 * @param teacherId 教师ID
 * @param token JWT token
 * @returns 接口响应
 */
export const getTeacherSubjectsAPI = async (teacherId: number, token: string) => {
  try {
    const response = await axiosInstance.get(`/api/teacher/subject`, {
      params: {
        teacherId
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('获取教师学科列表失败:', error);
    throw error;
  }
};

/**
 * 删除教师的学科绑定
 * @param teacherId 教师ID
 * @param subjectId 学科ID
 * @param token JWT token
 * @returns 接口响应
 */
export const deleteTeacherSubjectAPI = async (
  teacherId: number,
  subjectId: number,
  token: string
) => {
  try {
    const response = await axiosInstance.delete(
      `/api/teacher/${teacherId}/subject/${subjectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('删除教师学科绑定失败:', error);
    throw error;
  }
};

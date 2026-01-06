<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">教师管理</h1>

    <div class="bg-base-100 p-4 rounded-lg shadow mb-4">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>真实姓名</th>
              <th>电话</th>
              <th>职位</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in teachers" :key="teacher.userId">
              <td>{{ teacher.userId }}</td>
              <td>{{ teacher.username }}</td>
              <td>{{ teacher.realName || '-' }}</td>
              <td>{{ teacher.phone || '-' }}</td>
              <td>
                <select 
                  class="select select-sm select-bordered w-full max-w-xs"
                  :value="getTeacherRole(teacher.userId)"
                  @change="(e) => setTeacherRole(teacher, parseInt((e.target as HTMLSelectElement).value))"
                >
                  <option value="0">任课老师</option>
                  <option value="1">教务老师</option>
                </select>
              </td>
              <td>
                <span v-if="teacher.status === '0'" class="badge badge-success">启用</span>
                <span v-else class="badge badge-error">禁用</span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-sm btn-outline" @click="toggleStatus(teacher)">
                    <span v-if="teacher.status === '0'">禁用</span>
                    <span v-else>启用</span>
                  </button>
                  <button class="btn btn-sm btn-warning btn-outline" @click="resetPassword(teacher)">重置密码</button>
                  <button class="btn btn-sm btn-error btn-outline" @click="deleteTeacher(teacher)">注销</button>
                </div>
              </td>
            </tr>
            <tr v-if="teachers.length === 0">
              <td colspan="7" class="text-center py-6">暂无教师数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsersByTypeAPI, updateUserStatusAPI, deleteUserAPI, resetUserPasswordAPI, setTeacherPositionAPI, getTeacherPositionAPI } from '../../apis/Server/userAPI';

const teachers = ref<any[]>([]);
const teacherRoles = ref<Map<number, number>>(new Map());

const loadTeachers = async () => {
  try {
    const token = localStorage.getItem('token') || '';
    const res: any = await getUsersByTypeAPI(1, token); // 1 = 教师
    if (res?.data) {
      teachers.value = res.data;
    } else if (Array.isArray(res)) {
      teachers.value = res;
    } else {
      teachers.value = [];
    }
    // 加载教师职位信息
    await loadTeacherRoles(token);
  } catch (err) {
    console.error('加载教师列表失败', err);
    window.alert('加载教师列表失败');
  }
}

const loadTeacherRoles = async (token: string) => {
  try {
    for (const teacher of teachers.value) {
      const res: any = await getTeacherPositionAPI(teacher.userId, token);
      if (res?.data?.role !== undefined) {
        teacherRoles.value.set(teacher.userId, res.data.role);
      } else {
        teacherRoles.value.set(teacher.userId, 0); // 默认任课老师
      }
    }
  } catch (err) {
    console.error('加载教师职位失败', err);
    // 设置默认值
    for (const teacher of teachers.value) {
      teacherRoles.value.set(teacher.userId, 0);
    }
  }
}

const getTeacherRole = (teacherId: number): number => {
  return teacherRoles.value.get(teacherId) ?? 0;
}

const setTeacherRole = async (teacher: any, role: number) => {
  const token = localStorage.getItem('token') || '';
  try {
    await setTeacherPositionAPI({ teacherId: teacher.userId, role }, token);
    teacherRoles.value.set(teacher.userId, role);
    window.alert('设置教师职位成功');
  } catch (err) {
    console.error('设置教师职位失败', err);
    window.alert('设置教师职位失败');
    // 恢复到原来的值
    await loadTeacherRoles(token);
  }
}

const toggleStatus = async (teacher: any) => {
  const token = localStorage.getItem('token') || '';
  const newStatus = teacher.status === '0' ? '1' : '0';
  try {
    await updateUserStatusAPI(teacher.userId, newStatus, token);
    await loadTeachers();
  } catch (err) {
    console.error('修改教师状态失败', err);
    window.alert('修改教师状态失败');
  }
}

const deleteTeacher = async (teacher: any) => {
  if (!confirm(`确定要注销教师 ${teacher.username} 吗？`)) return;
  const token = localStorage.getItem('token') || '';
  try {
    await deleteUserAPI(teacher.userId, token);
    await loadTeachers();
  } catch (err) {
    console.error('删除教师失败', err);
    window.alert('删除教师失败');
  }
}

const resetPassword = async (teacher: any) => {
  if (!confirm(`确定要为教师 ${teacher.username} 重置密码吗？`)) return;
  const token = localStorage.getItem('token') || '';
  try {
    await resetUserPasswordAPI(teacher.userId, token);
    window.alert('重置密码成功');
  } catch (err) {
    console.error('重置密码失败', err);
    window.alert('重置密码失败');
  }
}

onMounted(() => {
  loadTeachers();
});
</script>

<style scoped>
</style>

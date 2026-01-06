<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">学生管理</h1>

    <div class="bg-base-100 p-4 rounded-lg shadow mb-4">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>真实姓名</th>
              <th>电话</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.userId">
              <td>{{ student.userId }}</td>
              <td>{{ student.username }}</td>
              <td>{{ student.realName || '-' }}</td>
              <td>{{ student.phone || '-' }}</td>
              <td>
                <span v-if="student.status === '0'" class="badge badge-success">启用</span>
                <span v-else class="badge badge-error">禁用</span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-sm btn-outline" @click="toggleStatus(student)">
                    <span v-if="student.status === '0'">禁用</span>
                    <span v-else>启用</span>
                  </button>
                  <button class="btn btn-sm btn-warning btn-outline" @click="resetPassword(student)">重置密码</button>
                  <button class="btn btn-sm btn-error btn-outline" @click="deleteStudent(student)">注销</button>
                </div>
              </td>
            </tr>
            <tr v-if="students.length === 0">
              <td colspan="6" class="text-center py-6">暂无学生数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUsersByTypeAPI, updateUserStatusAPI, deleteUserAPI, resetUserPasswordAPI } from '../../apis/Server/userAPI';

const students = ref<any[]>([]);

const loadStudents = async () => {
  try {
    const token = localStorage.getItem('token') || '';
    const res: any = await getUsersByTypeAPI(2, token); // 2 = 学生
    if (res?.data) {
      students.value = res.data;
    } else if (Array.isArray(res)) {
      students.value = res;
    } else {
      students.value = [];
    }
  } catch (err) {
    console.error('加载学生列表失败', err);
    window.alert('加载学生列表失败');
  }
}

const toggleStatus = async (student: any) => {
  const token = localStorage.getItem('token') || '';
  const newStatus = student.status === '0' ? '1' : '0';
  try {
    await updateUserStatusAPI(student.userId, newStatus, token);
    await loadStudents();
  } catch (err) {
    console.error('修改学生状态失败', err);
    window.alert('修改学生状态失败');
  }
}

const deleteStudent = async (student: any) => {
  if (!confirm(`确定要注销学生 ${student.username} 吗？`)) return;
  const token = localStorage.getItem('token') || '';
  try {
    await deleteUserAPI(student.userId, token);
    await loadStudents();
  } catch (err) {
    console.error('删除学生失败', err);
    window.alert('删除学生失败');
  }
}

const resetPassword = async (student: any) => {
  if (!confirm(`确定要为学生 ${student.username} 重置密码吗？`)) return;
  const token = localStorage.getItem('token') || '';
  try {
    await resetUserPasswordAPI(student.userId, token);
    window.alert('重置密码成功');
  } catch (err) {
    console.error('重置密码失败', err);
    window.alert('重置密码失败');
  }
}

onMounted(() => {
  loadStudents();
});
</script>

<style scoped>
</style>

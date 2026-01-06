<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">所有用户</h1>

    <div class="bg-base-100 p-4 rounded-lg shadow mb-4">
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>真实姓名</th>
              <th>类型</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.userId">
              <td>{{ user.userId }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.realName || '-' }}</td>
              <td>
                <span v-if="user.userType === 0" class="badge badge-info">管理员</span>
                <span v-else-if="user.userType === 1" class="badge badge-primary">教师</span>
                <span v-else class="badge badge-accent">学生</span>
              </td>
              <td>
                <span v-if="user.status === '0'" class="badge badge-success">启用</span>
                <span v-else class="badge badge-error">禁用</span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button class="btn btn-sm btn-outline" @click="toggleStatus(user)">
                    <span v-if="user.status === '0'">禁用</span>
                    <span v-else>启用</span>
                  </button>
                  <button class="btn btn-sm btn-warning btn-outline" @click="resetPassword(user)">重置密码</button>
                  <button class="btn btn-sm btn-error btn-outline" @click="deleteUser(user)">注销</button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="6" class="text-center py-6">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getUserInfoAPI, updateUserStatusAPI, deleteUserAPI, resetUserPasswordAPI } from '../../apis/Server/userAPI';

const users = ref<any[]>([]);

const loadUsers = async () => {
  try {
    const token = localStorage.getItem('token') || '';
    const res: any = await getUserInfoAPI(token);
    if (res?.data) {
      users.value = res.data;
    } else if (Array.isArray(res)) {
      users.value = res;
    } else if (res?.users) {
      users.value = res.users;
    } else {
      users.value = [];
    }
  } catch (err) {
    console.error('加载用户列表失败', err);
    window.alert('加载用户列表失败');
  }
}

const toggleStatus = async (user: any) => {
  const token = localStorage.getItem('token') || '';
  const newStatus = user.status === '0' ? '1' : '0';
  try {
    await updateUserStatusAPI(user.userId, newStatus, token);
    await loadUsers();
  } catch (err) {
    console.error('修改用户状态失败', err);
    window.alert('修改用户状态失败');
  }
}

const deleteUser = async (user: any) => {
  if (!confirm(`确定要注销用户 ${user.username} 吗？`)) return;
  const token = localStorage.getItem('token') || '';
  try {
    await deleteUserAPI(user.userId, token);
    await loadUsers();
  } catch (err) {
    console.error('删除用户失败', err);
    window.alert('删除用户失败');
  }
}

const resetPassword = async (user: any) => {
  if (!confirm(`确定要为用户 ${user.username} 重置密码吗？`)) return;
  const token = localStorage.getItem('token') || '';
  try {
    await resetUserPasswordAPI(user.userId, token);
    window.alert('重置密码成功');
  } catch (err) {
    console.error('重置密码失败', err);
    window.alert('重置密码失败');
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
</style>

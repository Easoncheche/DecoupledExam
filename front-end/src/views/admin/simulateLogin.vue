<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">模拟用户登录</h1>
    
    <!-- 选择用户类型：卡片放在单独容器 -->
    <div class="flex justify-center">
      <div class="flex flex-col md:flex-row justify-center items-center gap-4">
        <div
          class="card bg-base-100 border border-base-300 rounded-lg p-4 cursor-pointer hover:bg-base-200 transition-colors"
          :class="{ 'bg-primary text-primary-content': selectedUserType === 1 }"
          @click="selectedUserType = 1"
        >
          <div class="card-body items-center text-center">
            <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <h3 class="card-title">教师</h3>
            <p class="text-sm opacity-70">模拟教师账号</p>
          </div>
        </div>

        <div
          class="card bg-base-100 border border-base-300 rounded-lg p-4 cursor-pointer hover:bg-base-200 transition-colors"
          :class="{ 'bg-primary text-primary-content': selectedUserType === 2 }"
          @click="selectedUserType = 2"
        >
          <div class="card-body items-center text-center">
            <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 class="card-title">学生</h3>
            <p class="text-sm opacity-70">模拟学生账号</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 按钮放到选择区域的下方 -->
    <div class="mt-6 flex justify-center">
      <button
        class="btn btn-primary btn-lg"
        @click="simulateLogin"
        :disabled="selectedUserType === null || isSimulating"
      >
        <span v-if="!isSimulating">模拟登录</span>
        <span v-else>
          <span class="loading loading-spinner"></span>
          登录中...
        </span>
      </button>
    </div>

    
    <div class="bg-base-100 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">使用说明</h2>
      <ul class="list-disc pl-6 space-y-2">
        <li>选择要模拟的用户类型（教师或学生）</li>
        <li>点击"模拟登录"按钮进行模拟登录</li>
        <li>系统将使用选定的用户类型进行身份切换</li>
        <li>您可以使用模拟的用户身份访问系统功能</li>
        <li>如需返回原身份，请重新登录</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { simulateUserLoginAPI } from '../../apis/Server/userAPI';
import router from '../../routers';

// 导入接口定义
import type { SimulateLoginResponse } from '../../apis/Server/userAPI';

const selectedUserType = ref<number | null>(null);
const isSimulating = ref(false);

const simulateLogin = async () => {
  if (selectedUserType.value === null) {
    alert('请选择要模拟的用户类型');
    return;
  }

  isSimulating.value = true;

  try {
    // 从 localStorage 获取当前管理员的 token
    const token = localStorage.getItem('token');
    if (!token) {
      alert('未获取到登录凭证，请重新登录');
      return;
    }

    const response = await simulateUserLoginAPI(selectedUserType.value, token);
    console.log('模拟登录响应:', response); // 添加调试信息

    // 使用正确的类型
    if (response.code === 0 || response.code === 200) {
      alert('模拟登录成功！您可以使用新身份访问系统功能。');

      // 更新本地存储中的用户类型
      localStorage.setItem('userType', selectedUserType.value.toString());

      // 跳转到对应用户类型的主页
      if (selectedUserType.value === 1) {
        await router.push('/teacher');
      } else if (selectedUserType.value === 2) {
        await router.push('/student');
      }

      // 刷新页面以确保组件读取到新的 userType
      window.location.reload();
    } else {
      const errorMessage = response.message || response.msg || '模拟登录失败';
      alert(`模拟登录失败: ${errorMessage}`);
      console.error('模拟登录失败响应:', response);
    }
  } catch (error) {
    console.error('模拟登录出错:', error);
    alert('模拟登录失败，请稍后重试');
  } finally {
    isSimulating.value = false;
  }
};
</script>

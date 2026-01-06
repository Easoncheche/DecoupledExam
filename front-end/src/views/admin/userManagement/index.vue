<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">用户管理</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div class="card bg-primary text-primary-content">
        <div class="card-body">
          <h2 class="card-title">总用户数</h2>
          <p class="text-3xl">152</p>
          <div class="text-sm opacity-80">较上月 +12%</div>
        </div>
      </div>
      
      <div class="card bg-secondary text-secondary-content">
        <div class="card-body">
          <h2 class="card-title">学生总数</h2>
          <p class="text-3xl">128</p>
          <div class="text-sm opacity-80">活跃: 110</div>
        </div>
      </div>
      
      <div class="card bg-accent text-accent-content">
        <div class="card-body">
          <h2 class="card-title">教师总数</h2>
          <p class="text-3xl">24</p>
          <div class="text-sm opacity-80">在线: 18</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-base-100 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">用户管理功能</h2>
        <div class="grid grid-cols-1 gap-4">
          <router-link to="/admin/user-management/all" class="btn btn-outline btn-block">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            所有用户
          </router-link>
          <router-link to="/admin/student-management" class="btn btn-outline btn-block">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            学生管理
          </router-link>
          <router-link to="/admin/teacher-management" class="btn btn-outline btn-block">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            教师管理
          </router-link>
          <router-link to="/admin/teacher/register" class="btn btn-outline btn-block">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            注册教师
          </router-link>
        </div>
      </div>
      
      <div class="bg-base-100 p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">用户统计</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span>启用用户</span>
            <span class="badge badge-success">140</span>
          </div>
          <div class="flex items-center justify-between">
            <span>禁用用户</span>
            <span class="badge badge-error">12</span>
          </div>
          <div class="flex items-center justify-between">
            <span>今日新增</span>
            <span class="badge badge-primary">5</span>
          </div>
          <div class="flex items-center justify-between">
            <span>本月新增</span>
            <span class="badge badge-info">23</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-base-100 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">最近用户活动</h2>
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>用户</th>
              <th>类型</th>
              <th>操作</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>teacher1</td>
              <td><span class="badge badge-secondary">教师</span></td>
              <td>登录系统</td>
              <td>2025-12-22 16:30</td>
            </tr>
            <tr>
              <td>student1</td>
              <td><span class="badge badge-accent">学生</span></td>
              <td>提交作业</td>
              <td>2025-12-22 15:45</td>
            </tr>
            <tr>
              <td>admin</td>
              <td><span class="badge badge-primary">管理员</span></td>
              <td>修改用户状态</td>
              <td>2025-12-22 14:20</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 用户管理主页逻辑
</script>
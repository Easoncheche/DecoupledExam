<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">{{ pageTitle }}</h1>
    
    <div class="bg-base-100 p-6 rounded-lg shadow mb-8">
      <div class="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div class="flex gap-2">
          <button 
            class="btn btn-sm" 
            :class="userTab === 'all' ? 'btn-primary' : 'btn-outline'"
            @click="switchTab('all')"
          >
            全部用户
          </button>
          <button 
            class="btn btn-sm" 
            :class="userTab === 'students' ? 'btn-primary' : 'btn-outline'"
            @click="switchTab('students')"
          >
            学生
          </button>
          <button 
            class="btn btn-sm" 
            :class="userTab === 'teachers' ? 'btn-primary' : 'btn-outline'"
            @click="switchTab('teachers')"
          >
            教师
          </button>
        </div>
        <div class="flex flex-wrap gap-3">
          <button class="btn btn-primary" @click="showRegisterTeacherModal = true">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            注册教师
          </button>
          <div class="form-control">
            <input
              type="text"
              placeholder="搜索用户..."
              class="input input-bordered min-w-48"
              v-model="searchKeyword"
              @input="searchUsers"
            />
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>用户ID</th>
              <th>用户名</th>
              <th>真实姓名</th>
              <th>用户类型</th>
              <th>电话</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.realName }}</td>
              <td>
                <span class="badge" :class="getUserTypeClass(user.userType)">
                  {{ getUserTypeName(user.userType) }}
                </span>
              </td>
              <td>{{ user.phone || '-' }}</td>
              <td>
                <span class="badge" :class="user.status === '0' ? 'badge-success' : 'badge-error'">
                  {{ user.status === '0' ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ formatDate(user.createTime) }}</td>
              <td>
                <div class="flex gap-2">
                  <button 
                    class="btn btn-xs"
                    :class="user.status === '0' ? 'btn-error' : 'btn-success'"
                    @click="toggleUserStatus(user)"
                  >
                    {{ user.status === '0' ? '禁用' : '启用' }}
                  </button>
                  <button 
                    class="btn btn-xs btn-warning"
                    @click="resetPassword(user)"
                  >
                    重置密码
                  </button>
                  <button 
                    class="btn btn-xs btn-error"
                    @click="deleteUser(user)"
                  >
                    注销
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="users.length === 0" class="text-center py-8 text-gray-500">
        暂无用户数据
      </div>
      
      <!-- 分页 -->
      <div v-if="users.length > 0" class="flex justify-center mt-6">
        <div class="join">
          <button @click="prevPage" class="join-item btn" :disabled="currentPage === 1">«</button>
          <button class="join-item btn">{{ currentPage }}</button>
          <button @click="nextPage" class="join-item btn" :disabled="currentPage >= totalPages">»</button>
        </div>
        <span class="ml-4">共 {{ totalUsers }} 条记录，{{ totalPages }} 页</span>
      </div>
    </div>
    
    <!-- 注册教师模态框 -->
    <div class="modal" :class="{ 'modal-open': showRegisterTeacherModal }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">注册教师账号</h3>
        
        <form @submit.prevent="registerTeacher">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">用户名</span>
            </label>
            <input
              type="text"
              placeholder="输入用户名"
              class="input input-bordered"
              v-model="teacherForm.username"
              required
            />
          </div>
          
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">真实姓名</span>
            </label>
            <input
              type="text"
              placeholder="输入真实姓名"
              class="input input-bordered"
              v-model="teacherForm.realName"
              required
            />
          </div>
          
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">电话</span>
            </label>
            <input
              type="text"
              placeholder="输入电话号码"
              class="input input-bordered"
              v-model="teacherForm.phone"
              required
            />
          </div>
          
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">初始密码</span>
            </label>
            <input
              type="password"
              placeholder="输入初始密码"
              class="input input-bordered"
              v-model="teacherForm.password"
              required
            />
          </div>
          
          <div class="modal-action">
            <button type="submit" class="btn btn-primary" :disabled="isRegistering">
              <span v-if="!isRegistering">注册教师</span>
              <span v-else class="loading loading-spinner"></span>
            </button>
            <button type="button" class="btn" @click="showRegisterTeacherModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
  updateUserStatusAPI, 
  deleteUserAPI, 
  resetUserPasswordAPI,
  getUserInfoAPI
} from '../../apis/Server/userAPI';
import { useMainStore } from '../../stores';
import { storeToRefs } from 'pinia';
import router from '../../routers';

// 模拟用户数据
interface User {
  id: number;
  username: string;
  realName: string;
  userType: number; // 0: 管理员, 1: 教师, 2: 学生
  phone: string;
  status: string; // '0': 启用, '1': 禁用
  createTime: string;
}

const users = ref<User[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const searchKeyword = ref('');
const showRegisterTeacherModal = ref(false);
const isRegistering = ref(false);

// 教师注册表单
const teacherForm = ref({
  username: '',
  realName: '',
  phone: '',
  password: ''
});

// 模拟用户数据
const mockUsers: User[] = [
  { id: 1, username: 'admin', realName: '系统管理员', userType: 0, phone: '13800138001', status: '0', createTime: '2024-01-01T10:00:00' },
  { id: 2, username: 'teacher1', realName: '张老师', userType: 1, phone: '13800138002', status: '0', createTime: '2024-02-01T10:00:00' },
  { id: 3, username: 'teacher2', realName: '李老师', userType: 1, phone: '13800138003', status: '1', createTime: '2024-02-02T10:00:00' },
  { id: 4, username: 'student1', realName: '学生小王', userType: 2, phone: '13800138004', status: '0', createTime: '2024-03-01T10:00:00' },
  { id: 5, username: 'student2', realName: '学生小李', userType: 2, phone: '13800138005', status: '0', createTime: '2024-03-02T10:00:00' },
  { id: 6, username: 'student3', realName: '学生小张', userType: 2, phone: '13800138006', status: '1', createTime: '2024-03-03T10:00:00' },
  { id: 7, username: 'teacher3', realName: '王老师', userType: 1, phone: '13800138007', status: '0', createTime: '2024-02-03T10:00:00' },
  { id: 8, username: 'student4', realName: '学生小陈', userType: 2, phone: '13800138008', status: '0', createTime: '2024-03-04T10:00:00' },
  { id: 9, username: 'teacher4', realName: '赵老师', userType: 1, phone: '13800138009', status: '0', createTime: '2024-02-04T10:00:00' },
  { id: 10, username: 'student5', realName: '学生小刘', userType: 2, phone: '13800138010', status: '0', createTime: '2024-03-05T10:00:00' },
];

// 初始化数据
onMounted(() => {
  loadUsers();
});

const route = useRoute();
const routerInstance = useRouter();
const userTab = ref('all');
const pageTitle = ref('用户管理');

const loadUsers = () => {
  // 根据URL参数确定显示哪种用户
  const tab = route.query.tab as string || 'all';
  userTab.value = tab;
  
  if (tab === 'students') {
    users.value = mockUsers.filter(user => user.userType === 2);
    pageTitle.value = '学生管理';
  } else if (tab === 'teachers') {
    users.value = mockUsers.filter(user => user.userType === 1);
    pageTitle.value = '教师管理';
  } else {
    users.value = mockUsers.slice();
    pageTitle.value = '用户管理';
  }
  
  totalUsers.value = users.value.length;
  totalPages.value = Math.ceil(totalUsers.value / 10); // 每页10条记录
};

const getUserTypeName = (userType: number) => {
  switch(userType) {
    case 0: return '管理员';
    case 1: return '教师';
    case 2: return '学生';
    default: return '未知';
  }
};

const getUserTypeClass = (userType: number) => {
  switch(userType) {
    case 0: return 'badge-primary';
    case 1: return 'badge-secondary';
    case 2: return 'badge-accent';
    default: return 'badge-ghost';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

const toggleUserStatus = async (user: User) => {
  try {
    const store = useMainStore();
    const { useLoginStore } = store;
    const { token } = storeToRefs(useLoginStore());
    
    const newStatus = user.status === '0' ? '1' : '0';
    const response = await updateUserStatusAPI(user.id, newStatus, token.value);
    
    if (response.code === 200) {
      user.status = newStatus;
      alert(`用户 ${user.username} 状态已${user.status === '0' ? '启用' : '禁用'}`);
    } else {
      alert(response.message || '更新状态失败');
    }
  } catch (error) {
    console.error('更新用户状态失败:', error);
    alert('更新用户状态失败，请稍后重试');
  }
};

const resetPassword = async (user: User) => {
  if (!confirm(`确定要重置用户 ${user.username} 的密码吗？`)) {
    return;
  }
  
  try {
    const store = useMainStore();
    const { useLoginStore } = store;
    const { token } = storeToRefs(useLoginStore());
    
    const response = await resetUserPasswordAPI(user.id, token.value);
    
    if (response.code === 200) {
      alert(`用户 ${user.username} 的密码已重置为初始密码`);
    } else {
      alert(response.message || '重置密码失败');
    }
  } catch (error) {
    console.error('重置密码失败:', error);
    alert('重置密码失败，请稍后重试');
  }
};

const deleteUser = async (user: User) => {
  if (!confirm(`确定要注销用户 ${user.username} 吗？此操作不可恢复！`)) {
    return;
  }
  
  try {
    const store = useMainStore();
    const { useLoginStore } = store;
    const { token } = storeToRefs(useLoginStore());
    
    const response = await deleteUserAPI(user.id, token.value);
    
    if (response.code === 200) {
      // 从列表中移除用户
      users.value = users.value.filter(u => u.id !== user.id);
      totalUsers.value--;
      totalPages.value = Math.ceil(totalUsers.value / 10);
      alert(`用户 ${user.username} 已注销`);
    } else {
      alert(response.message || '注销用户失败');
    }
  } catch (error) {
    console.error('注销用户失败:', error);
    alert('注销用户失败，请稍后重试');
  }
};

const registerTeacher = async () => {
  if (!teacherForm.value.username || !teacherForm.value.realName || !teacherForm.value.phone || !teacherForm.value.password) {
    alert('请填写所有必填字段');
    return;
  }
  
  isRegistering.value = true;
  
  try {
    // 这里应该调用实际的注册教师API
    // 模拟注册成功
    const newTeacher: User = {
      id: mockUsers.length + 1,
      username: teacherForm.value.username,
      realName: teacherForm.value.realName,
      userType: 1,
      phone: teacherForm.value.phone,
      status: '0',
      createTime: new Date().toISOString()
    };
    
    mockUsers.push(newTeacher);
    users.value = mockUsers.slice();
    totalUsers.value = mockUsers.length;
    totalPages.value = Math.ceil(totalUsers.value / 10);
    
    alert('教师注册成功');
    showRegisterTeacherModal.value = false;
    
    // 重置表单
    teacherForm.value = {
      username: '',
      realName: '',
      phone: '',
      password: ''
    };
  } catch (error) {
    console.error('注册教师失败:', error);
    alert('注册教师失败，请稍后重试');
  } finally {
    isRegistering.value = false;
  }
};

const searchUsers = () => {
  if (!searchKeyword.value.trim()) {
    users.value = mockUsers.slice();
  } else {
    const keyword = searchKeyword.value.toLowerCase();
    users.value = mockUsers.filter(user => 
      user.username.toLowerCase().includes(keyword) || 
      user.realName.toLowerCase().includes(keyword) ||
      user.phone.includes(keyword)
    );
  }
  totalUsers.value = users.value.length;
  totalPages.value = Math.ceil(totalUsers.value / 10);
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const switchTab = (tab: string) => {
  userTab.value = tab;
  
  // 更新URL参数
  const newQuery = { ...route.query };
  if (tab !== 'all') {
    newQuery.tab = tab;
  } else {
    delete newQuery.tab;
  }
  
  router.push({
    name: 'adminUserManagementList',
    query: newQuery
  });
  
  // 重新加载用户数据
  loadUsers();
};
</script>
<template>
  <div class="max-w-7xl mx-auto px-8 py-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">学科绑定</h1>
      <p class="text-gray-600">左侧选择要绑定的学科，右侧查看已绑定的学科</p>
    </div>

    <!-- 主容器：左侧可绑定学科 + 右侧已绑定学科 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：可绑定的学科列表 -->
      <div class="lg:col-span-1 bg-base-100 p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">可绑定学科</h3>
        <div v-if="loadingSubjects" class="flex items-center justify-center py-8">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else-if="subjects.length > 0" class="space-y-2">
          <button 
            v-for="subject in subjects" 
            :key="subject.id"
            @click="selectSubject(subject)"
            :class="selectedSubject?.id === subject.id ? 'bg-primary text-primary-content' : 'bg-base-200 hover:bg-base-300'"
            class="w-full p-3 rounded-lg text-left transition-all duration-200 font-medium"
          >
            {{ subject.subjectName }}
          </button>
        </div>
        <div v-else class="text-center py-8">
          <p class="text-gray-400">暂无可用的学科</p>
        </div>

        <!-- 绑定选项（当选中学科时显示） -->
        <div v-if="selectedSubject" class="mt-6 pt-6 border-t border-base-300">
          <div class="mb-4">
            <label class="label">
              <span class="label-text font-semibold text-base">是否为主学科</span>
            </label>
            <div class="flex gap-4 mt-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  v-model.number="isMain" 
                  :value="1"
                  class="radio radio-primary"
                />
                <span class="label-text">是</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  v-model.number="isMain" 
                  :value="0"
                  class="radio radio-primary"
                />
                <span class="label-text">否</span>
              </label>
            </div>
          </div>

          <button 
            @click="bindSubject"
            :disabled="loading"
            class="btn btn-success w-full"
          >
            <span v-if="!loading">绑定学科</span>
            <span v-else class="loading loading-spinner loading-sm"></span>
          </button>
        </div>
      </div>

      <!-- 右侧：已绑定的学科列表 -->
      <div class="lg:col-span-2 bg-base-100 p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">已绑定学科</h3>
        <div v-if="boundSubjects.length > 0" class="space-y-2">
          <div 
            v-for="item in boundSubjectsWithNames" 
            :key="item.subjectId"
            class="p-4 bg-base-200 rounded-lg flex items-center justify-between"
          >
            <div class="flex-1">
              <div class="font-semibold text-base">{{ item.subjectName }}</div>
              <div class="text-sm text-gray-500 mt-1">
                <span v-if="item.isMain === 1" class="badge badge-success gap-1">主学科</span>
                <span v-else class="badge badge-outline gap-1">辅学科</span>
              </div>
            </div>
            <button 
              @click="unbindSubject(item.subjectId)"
              :disabled="deleteLoading"
              class="btn btn-error btn-sm"
            >
              <span v-if="!deleteLoading">解绑</span>
              <span v-else class="loading loading-spinner loading-xs"></span>
            </button>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <p class="text-gray-400">暂未绑定任何学科</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import getSubjectsAPI from '../../../apis/Server/subject/getSubjectsAPI';
import { 
  bindTeacherSubjectAPI, 
  getTeacherSubjectsAPI, 
  deleteTeacherSubjectAPI 
} from '../../../apis/Server/teacherSubjectAPI';
import { jwtDecode } from 'jwt-decode';

interface Subject {
  id: number;
  subjectName: string;
  isMain?: number;
}

interface BoundSubject {
  teacherId: number;
  subjectId: number;
  isMain: number;
}

const subjects = ref<Subject[]>([]);
const boundSubjects = ref<BoundSubject[]>([]);
const selectedSubject = ref<Subject | null>(null);
const isMain = ref<number>(0);
const loading = ref<boolean>(false);
const deleteLoading = ref<boolean>(false);
const teacherId = ref<number | null>(null);
const loadingSubjects = ref<boolean>(false);

// 计算已绑定学科的完整信息（包含学科名称）
const boundSubjectsWithNames = computed(() => {
  return boundSubjects.value.map(bound => {
    const subject = subjects.value.find(s => s.id === bound.subjectId);
    return {
      ...bound,
      subjectName: subject?.subjectName || `学科 ${bound.subjectId}`
    };
  });
});

// 初始化 - 获取所有学科和已绑定的学科
onMounted(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const decoded: any = jwtDecode(token);
    teacherId.value = decoded.id;

    // 获取所有学科
    await loadSubjects();
    // 获取已绑定的学科
    await loadBoundSubjects(token);
  } catch (error) {
    console.error('初始化页面失败:', error);
  }
});

// 获取所有学科
const loadSubjects = async () => {
  try {
    loadingSubjects.value = true;
    const response: any = await getSubjectsAPI({
      status: 1 // 只获取启用的学科
    });
    if (response && response.code === 200) {
      const subjectsData = response.data.subjects || response.data;
      if (Array.isArray(subjectsData)) {
        subjects.value = subjectsData.map((item: any) => ({
          id: item.id,
          subjectName: item.subjectName
        }));
      }
    }
  } catch (error) {
    console.error('获取学科列表失败:', error);
  } finally {
    loadingSubjects.value = false;
  }
};

// 获取已绑定的学科
const loadBoundSubjects = async (token: string) => {
  try {
    if (!teacherId.value) return;
    const response: any = await getTeacherSubjectsAPI(teacherId.value, token);
    if (response && response.code === 200 && Array.isArray(response.data)) {
      boundSubjects.value = response.data;
    }
  } catch (error) {
    console.error('获取已绑定学科失败:', error);
  }
};

// 选择学科
const selectSubject = (subject: Subject) => {
  selectedSubject.value = subject;
  isMain.value = 0;
};

// 绑定学科
const bindSubject = async () => {
  if (!selectedSubject.value || !teacherId.value) return;

  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response: any = await bindTeacherSubjectAPI(
      teacherId.value,
      selectedSubject.value.id,
      isMain.value,
      token
    );

    if (response && response.code === 200) {
      alert('学科绑定成功！');
      resetForm();
      await loadBoundSubjects(token);
    } else {
      alert(response?.message || '学科绑定失败');
    }
  } catch (error) {
    console.error('绑定学科失败:', error);
    alert('学科绑定失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 删除学科绑定
const unbindSubject = async (subjectId: number) => {
  if (!teacherId.value || !confirm('确定要删除此学科绑定吗？')) return;

  deleteLoading.value = true;
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response: any = await deleteTeacherSubjectAPI(
      teacherId.value,
      subjectId,
      token
    );

    if (response && response.code === 200) {
      alert('学科绑定已删除');
      await loadBoundSubjects(token);
    } else {
      alert(response?.message || '删除失败');
    }
  } catch (error) {
    console.error('删除学科绑定失败:', error);
    alert('删除失败，请稍后重试');
  } finally {
    deleteLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  selectedSubject.value = null;
  isMain.value = 0;
};
</script>

<style scoped>
/* 可以添加自定义样式 */
</style>

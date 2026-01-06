<template>
  <div class="p-4 max-w-6xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">我的错题</h1>
      <p class="text-gray-500 mt-1">查看和复习您的错题记录</p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-base-100 p-4 rounded-lg shadow">
        <div class="text-2xl font-bold text-primary">{{ mistakeStats.totalMistakes }}</div>
        <div class="text-sm text-gray-500">错题总数</div>
      </div>
      <div class="bg-base-100 p-4 rounded-lg shadow">
        <div class="text-2xl font-bold text-secondary">{{ mistakeStats.subjectsCount }}</div>
        <div class="text-sm text-gray-500">涉及科目</div>
      </div>
      <div class="bg-base-100 p-4 rounded-lg shadow">
        <div class="text-2xl font-bold text-accent">{{ mistakeStats.correctedCount }}</div>
        <div class="text-sm text-gray-500">已掌握</div>
      </div>
      <div class="bg-base-100 p-4 rounded-lg shadow">
        <div class="text-2xl font-bold text-success">{{ mistakeStats.masteryRate }}%</div>
        <div class="text-sm text-gray-500">掌握率</div>
      </div>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="bg-base-100 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3">
      <div class="flex gap-2">
        <select v-model="filters.subjectId" class="select select-bordered select-sm">
          <option value="">全部科目</option>
          <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
            {{ subject.name }}
          </option>
        </select>
        
        <select v-model="filters.questionType" class="select select-bordered select-sm">
          <option value="">全部题型</option>
          <option v-for="type in questionTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
        
        <select v-model="filters.difficulty" class="select select-bordered select-sm">
          <option value="">全部难度</option>
          <option value="1">简单</option>
          <option value="2">中等</option>
          <option value="3">困难</option>
        </select>
      </div>
      
      <div class="flex gap-2 ml-auto">
        <button class="btn btn-outline btn-sm" @click="refreshMistakes">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
        
        <button class="btn btn-primary btn-sm" @click="reviewSelected">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          标记已掌握
        </button>
      </div>
    </div>

    <!-- 错题列表 -->
    <div v-if="filteredMistakes.length > 0" class="bg-base-100 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th class="w-12">
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm" 
                  :checked="allSelected" 
                  @change="toggleSelectAll"
                />
              </th>
              <th>题目</th>
              <th>科目</th>
              <th>题型</th>
              <th>难度</th>
              <th>错误次数</th>
              <th>首次错题时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mistake in filteredMistakes" :key="mistake.id">
              <td>
                <input 
                  type="checkbox" 
                  class="checkbox checkbox-sm" 
                  :checked="selectedMistakes.includes(mistake.id)" 
                  @change="toggleSelect(mistake.id)"
                />
              </td>
              <td class="max-w-xs">
                <div class="font-medium" :title="mistake.questionContent">{{ truncateText(mistake.questionContent, 50) }}</div>
                <div class="text-sm text-gray-500 mt-1">正确答案: {{ mistake.correctAnswer }}</div>
                <div class="text-sm text-error mt-1">我的答案: {{ mistake.userAnswer }}</div>
              </td>
              <td>{{ getSubjectName(mistake.subjectId) }}</td>
              <td>{{ getQuestionTypeName(mistake.questionType) }}</td>
              <td>
                <span class="badge" :class="getDifficultyClass(mistake.difficulty)">
                  {{ getDifficultyText(mistake.difficulty) }}
                </span>
              </td>
              <td>
                <span class="badge badge-warning">{{ mistake.errorCount }}</span>
              </td>
              <td>{{ formatDate(mistake.firstWrongTime) }}</td>
              <td>
                <span class="badge" :class="mistake.mastered ? 'badge-success' : 'badge-warning'">
                  {{ mistake.mastered ? '已掌握' : '未掌握' }}
                </span>
              </td>
              <td>
                <div class="flex gap-1">
                  <button class="btn btn-xs btn-outline" @click="viewMistakeDetail(mistake)">详情</button>
                  <button 
                    class="btn btn-xs" 
                    :class="mistake.mastered ? 'btn-success' : 'btn-warning'" 
                    @click="toggleMastery(mistake)"
                  >
                    {{ mistake.mastered ? '取消掌握' : '标记掌握' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="p-4 flex justify-between items-center">
        <div class="text-sm">
          已选 {{ selectedMistakes.length }} 项，共 {{ filteredMistakes.length }} 条错题
        </div>
        <div class="flex items-center gap-2">
          <button 
            class="btn btn-sm" 
            :disabled="currentPage === 1" 
            @click="currentPage--"
          >
            上一页
          </button>
          <span class="text-sm">
            {{ currentPage }} / {{ totalPages }}
          </span>
          <button 
            class="btn btn-sm" 
            :disabled="currentPage === totalPages" 
            @click="currentPage++"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-12 text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p>暂无错题记录</p>
      <p class="text-sm mt-1">完成考试后，错题将自动保存在此处</p>
    </div>

    <!-- 错题详情模态框 -->
    <dialog id="mistakeDetailModal" class="modal">
      <div class="modal-box max-w-3xl">
        <h3 class="font-bold text-lg mb-4">错题详情</h3>
        
        <div v-if="selectedMistake" class="space-y-4">
          <div>
            <h4 class="font-medium">题目内容:</h4>
            <p class="mt-1 p-3 bg-base-200 rounded">{{ selectedMistake.questionContent }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="font-medium">正确答案:</h4>
              <p class="mt-1 p-3 bg-success text-success-content rounded">{{ selectedMistake.correctAnswer }}</p>
            </div>
            <div>
              <h4 class="font-medium">我的答案:</h4>
              <p class="mt-1 p-3 bg-error text-error-content rounded">{{ selectedMistake.userAnswer }}</p>
            </div>
          </div>
          
          <div>
            <h4 class="font-medium">解析:</h4>
            <p class="mt-1 p-3 bg-base-200 rounded">{{ selectedMistake.explanation || '暂无解析' }}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h4 class="font-medium">科目:</h4>
              <p class="mt-1">{{ getSubjectName(selectedMistake.subjectId) }}</p>
            </div>
            <div>
              <h4 class="font-medium">题型:</h4>
              <p class="mt-1">{{ getQuestionTypeName(selectedMistake.questionType) }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4">
            <div>
              <h4 class="font-medium">难度:</h4>
              <p class="mt-1">{{ getDifficultyText(selectedMistake.difficulty) }}</p>
            </div>
            <div>
              <h4 class="font-medium">错误次数:</h4>
              <p class="mt-1">{{ selectedMistake.errorCount }}</p>
            </div>
            <div>
              <h4 class="font-medium">掌握状态:</h4>
              <p class="mt-1">
                <span :class="selectedMistake.mastered ? 'text-success' : 'text-warning'">
                  {{ selectedMistake.mastered ? '已掌握' : '未掌握' }}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn" @click="closeMistakeDetail">关闭</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// 错题统计
const mistakeStats = ref({
  totalMistakes: 24,
  subjectsCount: 5,
  correctedCount: 12,
  masteryRate: 50
});

// 科目数据
const subjects = ref([
  { id: 1, name: '数学' },
  { id: 2, name: '英语' },
  { id: 3, name: '计算机' },
  { id: 4, name: '物理' },
  { id: 5, name: '化学' }
]);

// 题型数据
const questionTypes = ref([
  { id: 1, name: '单选题' },
  { id: 2, name: '多选题' },
  { id: 3, name: '判断题' },
  { id: 4, name: '填空题' },
  { id: 5, name: '简答题' },
  { id: 6, name: '编程题' }
]);

// 错题数据（样例数据）
const mistakes = ref([
  {
    id: 1,
    questionId: 101,
    questionContent: '在JavaScript中，以下哪个方法可以用于向数组末尾添加一个元素？',
    correctAnswer: 'push()',
    userAnswer: 'pop()',
    explanation: 'push()方法用于向数组末尾添加一个或多个元素，并返回新的长度。pop()方法用于删除数组末尾的元素。',
    subjectId: 3,
    questionType: 1,
    difficulty: 2,
    errorCount: 3,
    firstWrongTime: '2025-12-20T10:30:00',
    lastWrongTime: '2025-12-25T14:20:00',
    mastered: false
  },
  {
    id: 2,
    questionId: 205,
    questionContent: '下列哪个选项是Java中的基本数据类型？',
    correctAnswer: 'int',
    userAnswer: 'String',
    explanation: 'Java中的基本数据类型包括byte, short, int, long, float, double, char, boolean。String是引用类型。',
    subjectId: 3,
    questionType: 1,
    difficulty: 1,
    errorCount: 1,
    firstWrongTime: '2025-12-22T09:15:00',
    lastWrongTime: '2025-12-22T09:15:00',
    mastered: true
  },
  {
    id: 3,
    questionId: 301,
    questionContent: '在微积分中，函数f(x) = x^2的导数是什么？',
    correctAnswer: '2x',
    userAnswer: 'x',
    explanation: '根据幂函数求导法则，f(x) = x^n的导数是f\'(x) = nx^(n-1)。因此x^2的导数是2x。',
    subjectId: 1,
    questionType: 1,
    difficulty: 2,
    errorCount: 2,
    firstWrongTime: '2025-12-18T11:45:00',
    lastWrongTime: '2025-12-24T16:30:00',
    mastered: false
  },
  {
    id: 4,
    questionId: 402,
    questionContent: '英语中的过去完成时构成是？',
    correctAnswer: 'had + 过去分词',
    userAnswer: 'have + 过去分词',
    explanation: '过去完成时表示在过去某一时间或动作之前已经发生或完成的动作，构成是had + 过去分词。',
    subjectId: 2,
    questionType: 1,
    difficulty: 2,
    errorCount: 1,
    firstWrongTime: '2025-12-19T13:20:00',
    lastWrongTime: '2025-12-19T13:20:00',
    mastered: false
  },
  {
    id: 5,
    questionId: 503,
    questionContent: '牛顿第一定律又称为？',
    correctAnswer: '惯性定律',
    userAnswer: '作用力定律',
    explanation: '牛顿第一定律说明了物体具有惯性的性质，因此也称为惯性定律。',
    subjectId: 4,
    questionType: 1,
    difficulty: 1,
    errorCount: 1,
    firstWrongTime: '2025-12-21T15:10:00',
    lastWrongTime: '2025-12-21T15:10:00',
    mastered: true
  }
]);

// 筛选条件
const filters = ref({
  subjectId: '',
  questionType: '',
  difficulty: ''
});

// 分页
const currentPage = ref(1);
const pageSize = 10;

// 选中项
const selectedMistakes = ref<number[]>([]);
const selectedMistake = ref<any>(null);

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(filteredMistakes.value.length / pageSize);
});

// 过滤后的错题
const filteredMistakes = computed(() => {
  let result = mistakes.value;
  
  if (filters.value.subjectId) {
    result = result.filter(m => m.subjectId === Number(filters.value.subjectId));
  }
  
  if (filters.value.questionType) {
    result = result.filter(m => m.questionType === Number(filters.value.questionType));
  }
  
  if (filters.value.difficulty) {
    result = result.filter(m => m.difficulty === Number(filters.value.difficulty));
  }
  
  // 分页处理
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return result.slice(start, end);
});

// 全选状态
const allSelected = computed(() => {
  return filteredMistakes.value.length > 0 && 
         filteredMistakes.value.length === selectedMistakes.value.length;
});

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 获取科目名称
const getSubjectName = (subjectId: number) => {
  const subject = subjects.value.find(s => s.id === subjectId);
  return subject ? subject.name : '未知';
};

// 获取题型名称
const getQuestionTypeName = (typeId: number) => {
  const type = questionTypes.value.find(t => t.id === typeId);
  return type ? type.name : '未知';
};

// 获取难度文本
const getDifficultyText = (difficulty: number) => {
  switch (difficulty) {
    case 1: return '简单';
    case 2: return '中等';
    case 3: return '困难';
    default: return '未知';
  }
};

// 获取难度样式类
const getDifficultyClass = (difficulty: number) => {
  switch (difficulty) {
    case 1: return 'badge-success';
    case 2: return 'badge-warning';
    case 3: return 'badge-error';
    default: return 'badge-neutral';
  }
};

// 截断文本
const truncateText = (text: string, length: number) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// 切换单个选择
const toggleSelect = (id: number) => {
  const index = selectedMistakes.value.indexOf(id);
  if (index === -1) {
    selectedMistakes.value.push(id);
  } else {
    selectedMistakes.value.splice(index, 1);
  }
};

// 全选/取消全选
const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedMistakes.value = [];
  } else {
    selectedMistakes.value = filteredMistakes.value.map(m => m.id);
  }
};

// 标记已掌握（选中的）
const reviewSelected = () => {
  if (selectedMistakes.value.length === 0) {
    alert('请先选择要标记的错题');
    return;
  }
  
  selectedMistakes.value.forEach(id => {
    const mistake = mistakes.value.find(m => m.id === id);
    if (mistake) {
      mistake.mastered = true;
    }
  });
  
  // 更新统计
  updateStats();
  
  selectedMistakes.value = [];
  alert('已标记选中的错题为已掌握');
};

// 切换掌握状态
const toggleMastery = (mistake: any) => {
  mistake.mastered = !mistake.mastered;
  updateStats();
};

// 更新统计信息
const updateStats = () => {
  const total = mistakes.value.length;
  const corrected = mistakes.value.filter(m => m.mastered).length;
  const subjects = new Set(mistakes.value.map(m => m.subjectId)).size;
  const masteryRate = total > 0 ? Math.round((corrected / total) * 100) : 0;
  
  mistakeStats.value = {
    totalMistakes: total,
    subjectsCount: subjects,
    correctedCount: corrected,
    masteryRate: masteryRate
  };
};

// 查看错题详情
const viewMistakeDetail = (mistake: any) => {
  selectedMistake.value = mistake;
  (document.getElementById('mistakeDetailModal') as HTMLDialogElement).showModal();
};

// 关闭错题详情
const closeMistakeDetail = () => {
  (document.getElementById('mistakeDetailModal') as HTMLDialogElement).close();
};

// 刷新错题
const refreshMistakes = () => {
  // 这里可以调用API获取最新数据
  console.log('刷新错题数据');
};

onMounted(() => {
  updateStats();
});
</script>
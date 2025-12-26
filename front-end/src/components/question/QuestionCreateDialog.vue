<template>
  <dialog id="questionCreateDialog" class="modal">
    <div class="modal-box w-full max-w-[60vw]">
      <!-- 关闭按钮 -->
      <form method="dialog" class="absolute right-2 top-2">
        <button class="btn btn-sm btn-circle btn-ghost">✕</button>
      </form>

      <h3 class="font-bold text-xl mb-6">添加新题目</h3>

      <!-- 题型选择下拉框 -->
      <div class="mb-8">
        <label for="questionTypeSelect" class="block text-base-content/80 text-base mb-2">
          请选择题型：
        </label>
        <select
            id="questionTypeSelect"
            v-model="selectedType"
            class="select select-bordered w-full text-base"
        >
          <option value="" disabled selected>请选择题型</option>
          <option
              v-for="type in props.questionTypes"
              :key="type.typeId"
              :value="type.typeId"
          >
            {{ type.typeName }}
          </option>
        </select>
      </div>

      <!-- 动态渲染题目表单组件 -->
      <div v-if="selectedType && currentFormComponent" class="border-t border-base-300 pt-6">
        <component
            :is="currentFormComponent"
            :subjectList="subjectList"
            @submit="handleSubmit"
            @cancel="handleCancel"
        />
      </div>

      <!-- 默认提示 -->
      <div v-else class="text-center py-8 text-base-content/70">
        <p class="text-base">请选择一种题型以继续</p>
      </div>
    </div>

    <!-- 点击遮罩关闭 -->
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { getSubjectAPI, addQuestionsAPI } from '../../apis';
import { useRequest } from "vue-hooks-plus";
import { ElNotification } from 'element-plus'

const varemit = defineEmits(["close"])

// 定义 props
const props = defineProps<{
  questionTypes: Array<{
    typeId: string
    typeName: string
  }>,
}>()

const selectedType = ref<string>('')

// 🔑 题型ID 到 表单组件的映射（按需加载，提升性能）
const formComponentMap = {
  '1': defineAsyncComponent(() => import('./types/SingleChoiceForm.vue')),
  '2': defineAsyncComponent(() => import('./types/MultipleChoiceForm.vue')),
  '3': defineAsyncComponent(() => import('./types/TrueFalseForm.vue')),
  '4': defineAsyncComponent(() => import('./types/FillBlankForm.vue')),
  '5': defineAsyncComponent(() => import('./types/NounAnalysisForm.vue')),
  '6': defineAsyncComponent(() => import('./types/EssayQuestionForm.vue')),
  '7': defineAsyncComponent(() => import('./types/CalculationQuestionForm.vue')),
  '8': defineAsyncComponent(() => import('./types/AccountingEntryForm.vue')),
  '9': defineAsyncComponent(() => import('./types/MatchingQuestionForm.vue')),
  '10': defineAsyncComponent(() => import('./types/SortingQuestionForm.vue')),
  '11': defineAsyncComponent(() => import('./types/ClozeQuestionForm.vue')),
  '12': defineAsyncComponent(() => import('./types/ReadingComprehensionForm.vue')),
  '13': defineAsyncComponent(() => import('./types/ListeningQuestionForm.vue')),
  '14': defineAsyncComponent(() => import('./types/CodingQuestionForm.vue')),
  '15': defineAsyncComponent(() => import('./types/SpeakingQuestionForm.vue')),
  '17': defineAsyncComponent(() => import('./types/PollQuestionForm.vue')),
  // 'multiple-choice': defineAsyncComponent(() => import('@/components/question/forms/MultipleChoiceForm.vue')),
  // 'true-false': defineAsyncComponent(() => import('@/components/question/forms/TrueFalseForm.vue')),
  // 'short-answer': defineAsyncComponent(() => import('@/components/question/forms/ShortAnswerForm.vue')),
  // 'coding': defineAsyncComponent(() => import('@/components/question/forms/CodingForm.vue')),
  // 可继续扩展...
}

const subjectList = ref([])

onMounted(()=>{
  useRequest(() => getSubjectAPI(), {
    onSuccess(res) {
      if (res['code'] === 200) {
        subjectList.value = res['data']
      }
    }
  })
})

// 计算当前应显示的组件
const currentFormComponent = computed(() => {
  if (!selectedType.value) return null
  return formComponentMap[selectedType.value as keyof typeof formComponentMap] || null
})

const handleSubmit = (req) => {
  useRequest(()=> addQuestionsAPI(req), {
    onSuccess(res) {
      if (res['code'] === 200) {
        ElNotification({title: 'Success', message: "添加成功", type: 'success',})
        varemit('close')
      }
    },
  })
}

const handleCancel = () => {
  varemit('close')
}
</script>

<style scoped>
:deep(.select) {
  font-size: 1rem;
}
</style>
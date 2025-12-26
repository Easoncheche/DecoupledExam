<!-- ReadingComprehensionForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 阅读材料（原 title 字段） -->
    <div>
      <label class="block text-base mb-2">阅读材料 *</label>
      <textarea
          v-model="formData.passage"
          class="textarea textarea-bordered w-full text-base"
          rows="6"
          placeholder="Paste the reading passage here..."
      ></textarea>
    </div>

    <!-- 难度 & 学科 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-base mb-2">难度等级 *</label>
        <select v-model.number="formData.difficulty" class="select select-bordered w-full text-base">
          <option :value="1">1 - 入门</option>
          <option :value="2">2 - 简单</option>
          <option :value="3">3 - 中等</option>
          <option :value="4">4 - 困难</option>
          <option :value="5">5 - 挑战</option>
        </select>
      </div>
      <div>
        <label class="block text-base mb-2">所属学科 *</label>
        <select v-model.number="formData.subjectId" class="select select-bordered w-full text-base">
          <option v-for="(value, index) in subjectList" :value="value['subjectId']">{{ value['subjectName'] }}</option>
        </select>
      </div>
    </div>

    <!-- 阅读理解题目列表 -->
    <div v-for="(question, index) in formData.questions" :key="question.sequence" class="border-l-4 border-primary pl-4 py-3 space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-lg">第 {{ question.sequence }} 题</h3>
        <button
            v-if="formData.questions.length > 1"
            type="button"
            class="btn btn-xs btn-error"
            @click="removeQuestion(index)"
        >
          删除
        </button>
      </div>

      <!-- 题干 -->
      <div>
        <label class="block text-base mb-2">题干 *</label>
        <input
            v-model="question.stem"
            type="text"
            class="input input-bordered w-full text-base"
            placeholder="例如：What is the main topic of the passage?"
        />
      </div>

      <!-- 选项（支持换行，用 <br/> 分隔） -->
      <div>
        <label class="block text-base mb-2">选项（每行一个，自动加 A./B./C./D. 前缀）*</label>
        <textarea
            v-model="question.optionsText"
            class="textarea textarea-bordered w-full text-base"
            rows="4"
            placeholder="例如：&#10;The history of AI development&#10;The influence of AI on daily life&#10;The disadvantages of AI technology&#10;The global survey of AI usage"
        ></textarea>
        <p class="text-sm text-gray-500 mt-1">
          系统将自动转换为：<code>A. ...<br/>B. ...</code>
        </p>
      </div>

      <!-- 正确答案 -->
      <div>
        <label class="block text-base mb-2">正确答案 *</label>
        <div class="flex gap-4">
          <label v-for="opt in ['A', 'B', 'C', 'D']" :key="opt" class="cursor-pointer">
            <input
                type="radio"
                v-model="question.correctAnswer"
                :value="opt"
                class="radio radio-primary mr-1"
            />
            {{ opt }}
          </label>
        </div>
      </div>

      <!-- 解析 -->
      <div>
        <label class="block text-base mb-2">题目解析 *</label>
        <textarea
            v-model="question.analysis"
            class="textarea textarea-bordered w-full"
            rows="3"
            placeholder="解释为什么选这个答案..."
        ></textarea>
      </div>
    </div>

    <!-- 添加题目按钮 -->
    <div>
      <button type="button" class="btn btn-outline btn-sm" @click="addQuestion">
        + 添加阅读理解题
      </button>
    </div>

    <!-- 全局解析（global_analysis） -->
    <div>
      <label class="block text-base mb-2">全文解析 / 考点说明（可选）</label>
      <textarea
          v-model="formData.globalAnalysis"
          class="textarea textarea-bordered w-full"
          rows="4"
          placeholder="例如：This passage is a typical expository text about AI's influence..."
      ></textarea>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-3 pt-4">
      <button type="button" class="btn" @click="onCancel">取消</button>
      <button type="button" class="btn btn-primary" @click="onSubmit">保存题目</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps(['subjectList'])

// ====== Emits ======
const emit = defineEmits<{
  (e: 'submit', payload: SubmitPayload): void
  (e: 'cancel'): void
}>()

// ====== Types ======
interface QuestionItem {
  sequence: number
  stem: string
  optionsText: string // 用户输入的纯文本，每行一个选项
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  analysis: string
}

interface SubmitPayload {
  typeId: number
  title: string // 实际是 passage
  difficulty: number
  subjectId: number
  questionItems: Array<{
    sequence: number
    content: string // 题干
    typeId: number
    questionComponents: Array<{
      componentType: string
      content: string
      meta?: string
    }>
  }>
  questionComponents?: Array<{
    componentType: string
    content: string
  }>
}

// ====== Data ======
const formData = ref({
  passage: '',
  difficulty: 1,
  subjectId: 1,
  questions: [
    {
      sequence: 1,
      stem: '',
      optionsText: '',
      correctAnswer: 'A' as 'A' | 'B' | 'C' | 'D',
      analysis: ''
    }
  ] as QuestionItem[],
  globalAnalysis: ''
})

// ====== Methods ======
const addQuestion = () => {
  const nextSeq = formData.value.questions.length + 1
  formData.value.questions.push({
    sequence: nextSeq,
    stem: '',
    optionsText: '',
    correctAnswer: 'A',
    analysis: ''
  })
}

const removeQuestion = (index: number) => {
  if (formData.value.questions.length <= 1) return
  formData.value.questions.splice(index, 1)
  formData.value.questions.forEach((q, i) => {
    q.sequence = i + 1
  })
}

// 将用户输入的选项文本转为带 <br/> 的 HTML 字符串（兼容你提供的格式）
const formatOptionsForBackend = (optionsText: string): string => {
  const lines = optionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
  if (lines.length !== 4) {
    throw new Error('必须提供恰好4个选项')
  }
  const prefixed = lines.map((line, i) => `${String.fromCharCode(65 + i)}. ${line}`)
  return prefixed.join('<br/>')
}

// ====== Submit Logic ======
const onSubmit = () => {
  const { passage, difficulty, subjectId, questions, globalAnalysis } = formData.value

  if (!passage.trim()) return alert('阅读材料不能为空')
  if (questions.length === 0) return alert('至少需要一道题目')

  try {
    const questionItems = questions.map(q => {
      const { sequence, stem, optionsText, correctAnswer, analysis } = q

      if (!stem.trim()) throw new Error(`第 ${sequence} 题题干不能为空`)
      if (!analysis.trim()) throw new Error(`第 ${sequence} 题解析不能为空`)

      const optionsHtml = formatOptionsForBackend(optionsText)

      return {
        sequence,
        content: stem.trim(),
        typeId: 1, // 单选题
        questionComponents: [
          {
            componentType: 'option',
            content: JSON.stringify({ text: optionsHtml })
          },
          {
            componentType: 'answer',
            content: JSON.stringify({ text: correctAnswer })
          },
          {
            componentType: 'analysis',
            content: JSON.stringify({ text: analysis.trim() })
          }
        ]
      }
    })

    const payload: SubmitPayload = {
      typeId: 12,
      title: passage.trim(), // 注意：这里 title 实际是 passage
      difficulty,
      subjectId,
      questionItems
    }

    // 如果有全局解析，添加到顶层 questionComponents
    if (globalAnalysis.trim()) {
      payload.questionComponents = [
        {
          componentType: 'global_analysis',
          content: JSON.stringify({ text: globalAnalysis.trim() })
        }
      ]
    }

    emit('submit', payload)
  } catch (err: any) {
    alert(err.message || '选项格式错误，请确保每题有4个选项')
  }
}

const onCancel = () => emit('cancel')
</script>
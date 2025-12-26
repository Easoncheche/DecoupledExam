<template>
  <div class="space-y-6">
    <!-- 题目内容 -->
    <div>
      <label class="block text-base mb-2">题目内容 *</label>
      <textarea
          v-model="formData.title"
          ref="titleTextareaRef"
          class="textarea textarea-bordered w-full text-base"
          rows="4"
          placeholder="例如：已知Java程序中int a = 10, b = 5; 计算a++ + ++b + a * b的结果，并写出详细解题步骤"
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
        <label class="block text-base mb-2">所属学科</label>
        <select v-model.number="formData.subjectId" class="select select-bordered w-full text-base">
          <option v-for="(value, index) in subjectList" :value="value['subjectId']">{{ value['subjectName'] }}</option>
        </select>
      </div>
    </div>

    <!-- 解题步骤 -->
    <div>
      <label class="block text-base mb-2">解题步骤 *</label>
      <textarea
          v-model="formData.steps"
          class="textarea textarea-bordered w-full"
          rows="8"
          placeholder="请按照顺序列出解题步骤..."
      ></textarea>
    </div>

    <!-- 最终答案 -->
    <div>
      <label class="block text-base mb-2">最终答案 *</label>
      <input
          type="text"
          v-model="formData.finalAnswer"
          class="input input-bordered w-full text-base"
          placeholder="请输入最终答案"
      />
    </div>

    <!-- 题目解析 / 分析要点 -->
    <div>
      <label class="block text-base mb-2">题目解析 / 分析要点（可选）</label>
      <textarea
          v-model="formData.analysisDesc"
          class="textarea textarea-bordered w-full"
          rows="5"
          placeholder="例如：核心考点、易错点等..."
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
interface SubmitPayload {
  typeId: number
  title: string
  difficulty: number
  subjectId: number
  questionComponents: Array<{
    componentType: string
    content: string
  }>
}

// ====== Data ======
const formData = ref({
  title: '',
  difficulty: 1,
  subjectId: 1,
  steps: '',
  finalAnswer: '',
  analysisDesc: ''
})

// ====== Submit Logic ======
const onSubmit = () => {
  const { title, difficulty, subjectId, steps, finalAnswer, analysisDesc } = formData.value

  if (!title.trim()) return alert('题目不能为空')
  if (!steps.trim()) return alert('解题步骤不能为空')
  if (!finalAnswer.trim()) return alert('最终答案不能为空')

  const payload: SubmitPayload = {
    typeId: 7, // 计算题
    title,
    difficulty,
    subjectId,
    questionComponents: [
      {
        componentType: 'answer',
        content: JSON.stringify({
          finalAnswer: finalAnswer.trim(),
          steps: steps.split('\n').map(s => s.trim()).filter(s => s.length > 0)
        })
      },
      {
        componentType: 'analysis',
        content: JSON.stringify({
          analysisDesc: analysisDesc || ''
        })
      }
    ]
  }

  emit('submit', payload)
}

const onCancel = () => emit('cancel')
</script>
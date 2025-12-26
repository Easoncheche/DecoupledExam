<!-- ClozeQuestionForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 题目主干文本 -->
    <div>
      <label class="block text-base mb-2">题目主干 *</label>
      <textarea
          v-model="formData.title"
          class="textarea textarea-bordered w-full text-base"
          rows="4"
          placeholder="例如：English is widely used. It __1__ by nearly every country. You find __2__ important to master it."
      ></textarea>
      <p class="text-sm text-gray-500 mt-1">
        使用 <code>__1__</code>, <code>__2__</code>, ... 标记填空位置（从1开始连续编号）
      </p>
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

    <!-- 填空项列表 -->
    <div v-for="(blank, index) in formData.blanks" :key="blank.sequence" class="border-l-4 border-primary pl-4 py-3 space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-lg">第 {{ blank.sequence }} 空</h3>
        <button
            v-if="formData.blanks.length > 1"
            type="button"
            class="btn btn-xs btn-error"
            @click="removeBlank(index)"
        >
          删除
        </button>
      </div>

      <!-- 选项设置 -->
      <div class="grid grid-cols-2 gap-2">
        <div v-for="opt in ['A', 'B', 'C', 'D']" :key="opt">
          <label class="text-sm">{{ opt }}.</label>
          <input
              v-model="blank.options[opt]"
              type="text"
              class="input input-bordered input-sm w-full"
              :placeholder="`选项${opt}内容`"
          />
        </div>
      </div>

      <!-- 正确答案 -->
      <div>
        <label class="block text-base mb-2">正确答案 *</label>
        <div class="flex gap-2">
          <label v-for="opt in ['A', 'B', 'C', 'D']" :key="opt" class="cursor-pointer">
            <input
                type="radio"
                v-model="blank.correctKey"
                :value="opt"
                class="radio radio-primary mr-1"
            />
            {{ opt }}
          </label>
        </div>
      </div>

      <!-- 答案说明（可选） -->
      <div>
        <label class="block text-base mb-2">答案说明（可选）</label>
        <input
            v-model="blank.answerDesc"
            type="text"
            class="input input-bordered w-full text-base"
            placeholder="如：本题考查被动语态"
        />
      </div>

      <!-- 解析 -->
      <div>
        <label class="block text-base mb-2">题目解析 / 考点分析 *</label>
        <textarea
            v-model="blank.analysisDesc"
            class="textarea textarea-bordered w-full"
            rows="3"
            placeholder="详细解释为什么选这个答案..."
        ></textarea>
      </div>
    </div>

    <!-- 添加填空按钮 -->
    <div>
      <button type="button" class="btn btn-outline btn-sm" @click="addBlank">
        + 添加填空项
      </button>
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
interface BlankItem {
  sequence: number
  options: Record<'A' | 'B' | 'C' | 'D', string>
  correctKey: 'A' | 'B' | 'C' | 'D'
  answerDesc: string
  analysisDesc: string
}

interface SubmitPayload {
  typeId: number
  title: string
  difficulty: number
  subjectId: number
  questionItems: Array<{
    sequence: number
    typeId: number // 单选题
    questionComponents: Array<{
      componentType: string
      content: string
    }>
  }>
}

// ====== Data ======
const formData = ref({
  title: '',
  difficulty: 1,
  subjectId: 1,
  blanks: [
    {
      sequence: 1,
      options: { A: '', B: '', C: '', D: '' },
      correctKey: 'A' as 'A' | 'B' | 'C' | 'D',
      answerDesc: '',
      analysisDesc: ''
    }
  ] as BlankItem[]
})

// ====== Methods ======
const addBlank = () => {
  const nextSeq = formData.value.blanks.length + 1
  formData.value.blanks.push({
    sequence: nextSeq,
    options: { A: '', B: '', C: '', D: '' },
    correctKey: 'A',
    answerDesc: '',
    analysisDesc: ''
  })
}

const removeBlank = (index: number) => {
  if (formData.value.blanks.length <= 1) return
  formData.value.blanks.splice(index, 1)
  // 重新计算 sequence（保持连续）
  formData.value.blanks.forEach((blank, i) => {
    blank.sequence = i + 1
  })
}

// ====== Submit Logic ======
const onSubmit = () => {
  const { title, difficulty, subjectId, blanks } = formData.value

  if (!title.trim()) return alert('题目主干不能为空')
  if (blanks.length === 0) return alert('至少需要一个填空项')

  // 校验每个空
  for (const blank of blanks) {
    const { options, correctKey, analysisDesc } = blank
    if (!options.A.trim() || !options.B.trim() || !options.C.trim() || !options.D.trim()) {
      return alert(`第 ${blank.sequence} 空的选项不能为空`)
    }
    if (!analysisDesc.trim()) {
      return alert(`第 ${blank.sequence} 空的解析不能为空`)
    }
  }

  const questionItems = blanks.map(blank => {
    const { sequence, options, correctKey, answerDesc, analysisDesc } = blank

    return {
      sequence,
      typeId: 1, // 单选题
      questionComponents: [
        {
          componentType: 'option',
          content: JSON.stringify({
            options: [
              { key: 'A', value: options.A.trim() },
              { key: 'B', value: options.B.trim() },
              { key: 'C', value: options.C.trim() },
              { key: 'D', value: options.D.trim() }
            ]
          })
        },
        {
          componentType: 'answer',
          content: JSON.stringify({
            correctKey,
            ...(answerDesc.trim() ? { answerDesc: answerDesc.trim() } : {})
          })
        },
        {
          componentType: 'analysis',
          content: JSON.stringify({
            analysisDesc: analysisDesc.trim()
          }),
        }
      ]
    }
  })

  const payload: SubmitPayload = {
    typeId: 11, // 完形填空题
    title: title.trim(),
    difficulty,
    subjectId,
    questionItems
  }

  emit('submit', payload)
}

const onCancel = () => emit('cancel')
</script>
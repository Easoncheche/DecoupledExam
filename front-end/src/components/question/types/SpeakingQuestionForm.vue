<!-- SpeakingQuestionForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 题目指令 -->
    <div>
      <label class="block text-base mb-2">口语题目指令 *</label>
      <textarea
          v-model="formData.title"
          class="textarea textarea-bordered w-full text-base"
          rows="3"
          placeholder="例如：请用英语介绍一下你的家乡..."
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

    <!-- 参考回答与关键词 -->
    <div class="border p-4 rounded-lg bg-base-100">
      <h3 class="font-bold mb-3">参考回答与关键词 *</h3>

      <div class="mb-3">
        <label class="text-sm">关键词（英文，逗号分隔）</label>
        <input
            v-model="formData.keywordsStr"
            type="text"
            class="input input-bordered w-full"
            placeholder="例如：hometown, location, specialty food, famous landmark"
        />
      </div>

      <div class="mb-3">
        <label class="text-sm">英文参考回答 *</label>
        <textarea
            v-model="formData.sampleAnswer"
            class="textarea textarea-bordered w-full text-base"
            rows="5"
            placeholder="My hometown is Beijing, the capital of China..."
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm">建议作答时长</label>
          <input
              v-model="formData.expectedDuration"
              type="text"
              class="input input-sm input-bordered w-full"
              placeholder="例如：90-120 seconds"
          />
        </div>
        <div>
          <label class="text-sm">评分标准（英文，逗号分隔）</label>
          <input
              v-model="formData.scoringCriteriaStr"
              type="text"
              class="input input-sm input-bordered w-full"
              placeholder="例如：Fluency, Pronunciation, Grammar accuracy"
          />
        </div>
      </div>
    </div>

    <!-- 中文解析与答题技巧 -->
    <div class="border p-4 rounded-lg bg-base-100">
      <h3 class="font-bold mb-3">中文解析与答题技巧</h3>

      <div class="mb-3">
        <label class="text-sm">题目解析（中文）*</label>
        <textarea
            v-model="formData.analysisText"
            class="textarea textarea-bordered w-full text-base"
            rows="4"
            placeholder="这道题考察学生的英语口语表达能力..."
        ></textarea>
      </div>

      <div>
        <label class="text-sm">答题技巧提示（英文，逗号分隔）</label>
        <input
            v-model="formData.tipsStr"
            type="text"
            class="input input-bordered w-full"
            placeholder="例如：Use simple language, Speak at a moderate pace"
        />
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-3 pt-4">
      <button type="button" class="btn" @click="onCancel">取消</button>
      <button type="button" class="btn btn-primary" @click="onSubmit">保存口语题</button>
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
  title: string
  typeId: number
  difficulty: number
  subjectId: number
  questionComponents: Array<{
    componentType: string
    content: string
    meta?: string
  }>
}

// ====== Data ======
const formData = ref({
  title: '请用英语介绍一下你的家乡，包括它的地理位置、特色美食和一处著名的旅游景点。',
  difficulty: 1,
  subjectId: 1,
  keywordsStr: 'hometown, location, specialty food, famous landmark, culture',
  sampleAnswer: `My hometown is Beijing, the capital of China, located in the northern part of the country. It's famous for its delicious Peking Duck, which is a must-try for visitors. One of the most renowned landmarks is the Forbidden City, a magnificent palace complex that showcases ancient Chinese architecture and history.`,
  expectedDuration: '90-120 seconds',
  scoringCriteriaStr: 'Fluency, Pronunciation, Grammar accuracy, Content completeness',
  analysisText: '这道题考察学生的英语口语表达能力和组织信息的能力。一个完整的回答应该清晰地介绍家乡的地理位置，生动地描述至少一种特色美食，并能详细介绍一个著名景点。回答时要注意时态的正确使用（如一般现在时），并使用恰当的连接词使内容连贯。',
  tipsStr: 'Use simple and clear language, Structure your answer with an introduction, body, and conclusion, Practice using descriptive adjectives, Speak at a moderate pace'
})

// ====== Helper: Split comma-separated string to array ======
const parseList = (str: string): string[] => {
  return str
      .split(/[,，]\s*/)
      .map(s => s.trim())
      .filter(s => s)
}

// ====== Submit Logic ======
const onSubmit = () => {
  const {
    title,
    difficulty,
    subjectId,
    keywordsStr,
    sampleAnswer,
    expectedDuration,
    scoringCriteriaStr,
    analysisText,
    tipsStr
  } = formData.value

  if (!title.trim()) return alert('题目指令不能为空')
  if (!sampleAnswer.trim()) return alert('英文参考回答不能为空')
  if (!analysisText.trim()) return alert('中文解析不能为空')

  try {
    // 构建 answer 组件
    const answerContent = JSON.stringify({
      keywords: parseList(keywordsStr),
      sampleAnswer: sampleAnswer
    })

    const answerMeta = JSON.stringify({
      expectedDuration: expectedDuration || '',
      scoringCriteria: parseList(scoringCriteriaStr)
    })

    // 构建 analysis 组件
    const analysisContent = JSON.stringify({
      analysis: analysisText
    })

    const analysisMeta = JSON.stringify({
      tips: parseList(tipsStr)
    })

    const payload: SubmitPayload = {
      title: title.trim(),
      typeId: 15,
      difficulty,
      subjectId,
      questionComponents: [
        {
          componentType: 'answer',
          content: answerContent,
          meta: answerMeta
        },
        {
          componentType: 'analysis',
          content: analysisContent,
          meta: analysisMeta
        }
      ]
    }

    emit('submit', payload)
  } catch (err: any) {
    console.error(err)
    alert('提交失败，请检查输入格式')
  }
}

const onCancel = () => emit('cancel')
</script>
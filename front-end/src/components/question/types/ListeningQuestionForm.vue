<!-- ListeningQuestionForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 听力提示语 -->
    <div>
      <label class="block text-base mb-2">听力提示语 *</label>
      <input
          v-model="formData.prompt"
          type="text"
          class="input input-bordered w-full text-base"
          placeholder="例如：请听对话，完成下列题目"
      />
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

    <!-- 音频信息 -->
    <div class="border p-4 rounded-lg bg-base-100">
      <h3 class="font-bold mb-3">音频信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="text-sm">音频链接 (URL)</label>
          <input
              v-model="formData.audioUrl"
              type="text"
              class="input input-sm input-bordered w-full"
              placeholder="如留空则填 null"
          />
        </div>
        <div>
          <label class="text-sm">时长</label>
          <input
              v-model="formData.duration"
              type="text"
              class="input input-sm input-bordered w-full"
              placeholder="如：1分45秒"
          />
        </div>
        <div>
          <label class="text-sm">文件大小</label>
          <input
              v-model="formData.fileSize"
              type="text"
              class="input input-sm input-bordered w-full"
              placeholder="如：2.5MB"
          />
        </div>
      </div>
    </div>

    <!-- 听力原文 -->
    <div>
      <label class="block text-base mb-2">听力原文 *</label>
      <textarea
          v-model="formData.transcript"
          class="textarea textarea-bordered w-full text-base"
          rows="8"
          placeholder="W: Good morning, sir. Can I help you?&#10;M: Yes, I'd like to book a train ticket..."
      ></textarea>
      <p class="text-sm text-gray-500 mt-1">
        使用 Enter 换行，系统将自动转为 \n
      </p>
    </div>

    <!-- 听力题目列表 -->
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
            placeholder="例如：What does the man want to do?"
        />
      </div>

      <!-- 选项（用户每行输入一个） -->
      <div>
        <label class="block text-base mb-2">选项（每行一个）*</label>
        <textarea
            v-model="question.optionsText"
            class="textarea textarea-bordered w-full text-base"
            rows="3"
            placeholder="例如：&#10;Book a plane ticket&#10;Book a train ticket&#10;Book a bus ticket"
        ></textarea>
        <p class="text-sm text-gray-500">
          系统将自动转换为：<code>A. ...<br/>B. ...</code>
        </p>
      </div>

      <!-- 正确答案 -->
      <div>
        <label class="block text-base mb-2">正确答案 *</label>
        <div class="flex gap-4">
          <label v-for="opt in generateOptionKeys(question.optionsText)" :key="opt" class="cursor-pointer">
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

    <!-- 添加题目 -->
    <div>
      <button type="button" class="btn btn-outline btn-sm" @click="addQuestion">
        + 添加听力题
      </button>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-3 pt-4">
      <button type="button" class="btn" @click="onCancel">取消</button>
      <button type="button" class="btn btn-primary" @click="onSubmit">保存听力题</button>
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
  optionsText: string
  correctAnswer: string // 'A', 'B', etc.
  analysis: string
}

interface SubmitPayload {
  title: string
  typeId: number
  difficulty: number
  subjectId: number
  questionComponents: Array<{
    componentType: string
    content: string
  }>
  questionItems: Array<{
    sequence: number
    content: string
    typeId: number
    questionComponents: Array<{
      componentType: string
      content: string
    }>
  }>
}

// ====== Data ======
const formData = ref({
  prompt: '请听对话，完成下列题目',
  difficulty: 1,
  subjectId: 1,
  audioUrl: 'null',
  duration: '1分45秒',
  fileSize: '2.5MB',
  transcript: '',
  questions: [
    {
      sequence: 1,
      stem: '',
      optionsText: '',
      correctAnswer: 'A',
      analysis: ''
    }
  ] as QuestionItem[]
})

// 动态生成选项字母 A/B/C...
const generateOptionKeys = (optionsText: string): string[] => {
  const lines = optionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
  return lines.map((_, i) => String.fromCharCode(65 + i)) // A, B, C...
}

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
    // 如果当前答案超出新选项范围，重置为 A
    const validKeys = generateOptionKeys(q.optionsText)
    if (!validKeys.includes(q.correctAnswer)) {
      q.correctAnswer = validKeys[0] || 'A'
    }
  })
}

// 格式化选项为 A. ...<br/>B. ...
const formatOptionsForBackend = (optionsText: string): string => {
  const lines = optionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line)
  if (lines.length === 0) throw new Error('至少需要一个选项')
  const prefixed = lines.map((line, i) => `${String.fromCharCode(65 + i)}. ${line}`)
  return prefixed.join('<br/>')
}

// ====== Submit Logic ======
const onSubmit = () => {
  const {
    prompt,
    difficulty,
    subjectId,
    audioUrl,
    duration,
    fileSize,
    transcript,
    questions
  } = formData.value

  if (!prompt.trim()) return alert('提示语不能为空')
  if (!transcript.trim()) return alert('听力原文不能为空')
  if (questions.length === 0) return alert('至少需要一道题')

  try {
    // 构建顶层 questionComponents
    const questionComponents = [
      {
        componentType: 'audio',
        content: JSON.stringify({
          url: audioUrl.trim() || 'null',
          duration: duration.trim(),
          size: fileSize.trim()
        })
      },
      {
        componentType: 'listening_text',
        content: JSON.stringify({
          text: transcript.replace(/\n/g, '\\n') // 转义换行符
        })
      }
    ]

    // 构建题目列表
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
      title: prompt.trim(),
      typeId: 13,
      difficulty,
      subjectId,
      questionComponents,
      questionItems
    }

    emit('submit', payload)
  } catch (err: any) {
    alert(err.message || '格式错误，请检查选项或原文')
  }
}

const onCancel = () => emit('cancel')
</script>
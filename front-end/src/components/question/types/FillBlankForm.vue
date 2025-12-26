<!-- FillBlankForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 题目内容 -->
    <div>
      <label class="block text-base mb-2">题目内容 *</label>
      <textarea
          v-model="formData.title"
          ref="titleTextareaRef"
          class="textarea textarea-bordered w-full text-base"
          rows="5"
          placeholder="例如：Java中声明抽象方法的关键字是______，定义接口的关键字是______。"
          @input="autoDetectBlanks"
      ></textarea>

      <div class="mt-2">
        <input
            type="file"
            ref="fileInputRef"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleImageUpload"
        />
        <button
            type="button"
            class="btn btn-sm btn-outline"
            @click="fileInputRef?.click?.()"
        >
          插入图片
        </button>
        <span class="text-xs text-gray-500 ml-2">
          图片将自动插入到题目中
        </span>
      </div>
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

    <!-- 自动检测到的空 -->
    <div v-if="blankCount > 0">
      <label class="block text-base mb-2">请为以下 {{ blankCount }} 个空填写正确答案 *</label>
      <div class="space-y-3">
        <div v-for="i in blankCount" :key="i" class="flex items-start gap-3">
          <div class="flex flex-col">
            <span class="text-sm font-mono">第 {{ i }} 空</span>
            <input
                v-model="formData.answers[i - 1]"
                type="text"
                class="input input-bordered w-48 mt-1"
                placeholder="正确答案"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-warning text-sm">
      题干中未检测到填空标记。请使用 <code>______</code> 表示空，例如：Java关键字是______。
    </div>

    <!-- 答题提示 -->
    <div>
      <label class="block text-base mb-2">答题提示（可选）</label>
      <input
          v-model="formData.tip"
          type="text"
          class="input input-bordered w-full"
          placeholder="例如：注意关键字拼写，区分大小写"
      />
    </div>

    <!-- 题目解析 -->
    <div>
      <label class="block text-base mb-2">题目解析（可选）</label>
      <textarea
          v-model="formData.analysisDesc"
          class="textarea textarea-bordered w-full"
          rows="3"
          placeholder="可解释知识点、易错点等..."
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
import { ref, watch } from 'vue'

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
    meta?: string
  }>
}

// ====== Data ======
const formData = ref({
  title: '',
  difficulty: 1,
  subjectId: 1,
  tip: '',
  analysisDesc: '',
  answers: [] as string[] // 按顺序存储每个空的答案
})

const blankCount = ref(0)
const fileInputRef = ref<HTMLInputElement | null>(null)
const titleTextareaRef = ref<HTMLTextAreaElement | null>(null)

// ====== 自动检测填空数量 ======
const BLANK_PATTERN = /_{4,}/g // 匹配至少4个下划线（兼容 ______ 或 ____）

function autoDetectBlanks() {
  const matches = formData.value.title.match(BLANK_PATTERN)
  blankCount.value = matches ? matches.length : 0

  // 自动调整 answers 数组长度
  if (formData.value.answers.length > blankCount.value) {
    formData.value.answers = formData.value.answers.slice(0, blankCount.value)
  } else {
    while (formData.value.answers.length < blankCount.value) {
      formData.value.answers.push('')
    }
  }
}

// 初始化时也检测一次
watch(
    () => formData.value.title,
    () => autoDetectBlanks(),
    { immediate: true }
)

// ====== 图片处理（复用） ======
function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve('')
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      let width = img.width
      let height = img.height
      if (width > 800) {
        const ratio = 800 / width
        width = 800
        height *= ratio
      }
      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)
      const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      resolve(canvas.toDataURL(mime, 0.85))
    }
    img.src = URL.createObjectURL(file)
  })
}

function insertImageToTitle(imgSrc: string) {
  const textarea = titleTextareaRef.value
  if (!textarea) {
    formData.value.title += `\n<img src="${imgSrc}" alt="题图" style="max-width:100%;">`
    return
  }
  const startPos = textarea.selectionStart
  const endPos = textarea.selectionEnd
  const before = formData.value.title.substring(0, startPos)
  const after = formData.value.title.substring(endPos)
  const imgTag = `<img src="${imgSrc}" alt="题图" style="max-width:100%;height:auto;">`
  formData.value.title = before + imgTag + after
  setTimeout(() => {
    textarea.setSelectionRange(startPos + imgTag.length, startPos + imgTag.length)
  }, 0)
}

const handleImageUpload = async (event: Event) => {
  const files = (event.target as HTMLInputElement)?.files
  if (!files) return
  for (const file of Array.from(files)) {
    if (!file.type.startsWith('image/')) continue
    const base64 = await compressImage(file)
    if (base64) insertImageToTitle(base64)
  }
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ====== 提交逻辑 ======
const onSubmit = () => {
  const { title, difficulty, subjectId, answers, tip, analysisDesc } = formData.value

  if (!title.trim()) return alert('题目不能为空')
  if (blankCount.value === 0) return alert('请在题干中使用 ______ 表示填空位置')
  if (answers.some(ans => !ans.trim())) return alert('所有空的正确答案不能为空')

  // 构建 blanks 数组（用于 blank 组件）
  const blanks = answers.map((answer, index) => ({
    label: String(index + 1),
    placeholder: '______',
    position: `第${index + 1}空`,
    answer: answer.trim(),
    sort: index + 1
  }))

  const payload: SubmitPayload = {
    typeId: 4,
    title,
    difficulty,
    subjectId,
    questionComponents: [
      {
        componentType: 'blank',
        content: JSON.stringify({ blanks }),
        meta: JSON.stringify({ totalScore: blanks.length * 2 }) // 示例：每空2分
      },
      {
        componentType: 'answer',
        content: JSON.stringify({
          answers: blanks.map(b => ({
            blankLabel: b.label,
            correctAnswer: b.answer
          })),
          ...(tip ? { tip } : {})
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
<!-- ShortAnswerForm.vue -->
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
          placeholder="例如：请解析Java中的多态性"
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

    <!-- 标准答案（必填） -->
    <div>
      <label class="block text-base mb-2">标准答案 *</label>
      <textarea
          v-model="formData.completeAnswer"
          class="textarea textarea-bordered w-full"
          rows="6"
          placeholder="请提供完整的参考答案..."
      ></textarea>
    </div>

    <!-- 题目解析 / 评分要点（可选） -->
    <div>
      <label class="block text-base mb-2">题目解析（可选）</label>
      <textarea
          v-model="formData.analysisDesc"
          class="textarea textarea-bordered w-full"
          rows="4"
          placeholder="可填写评分要点、知识点延伸、典型错误等..."
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
  completeAnswer: '',
  analysisDesc: ''
})

// Refs for image insertion
const fileInputRef = ref<HTMLInputElement | null>(null)
const titleTextareaRef = ref<HTMLTextAreaElement | null>(null)

// ====== Image Handling (reused) ======
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

// ====== Submit Logic ======
const onSubmit = () => {
  const { title, difficulty, subjectId, completeAnswer, analysisDesc } = formData.value

  if (!title.trim()) return alert('题目不能为空')
  if (!completeAnswer.trim()) return alert('标准答案不能为空')

  const payload: SubmitPayload = {
    typeId: 5, // 👈 名词解析 / 简答题
    title,
    difficulty,
    subjectId,
    questionComponents: [
      {
        componentType: 'answer',
        content: JSON.stringify({
          completeAnswer: completeAnswer.trim()
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
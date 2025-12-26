<!-- PollQuestionForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 投票问题标题 -->
    <div>
      <label class="block text-base mb-2">投票问题 *</label>
      <textarea
          v-model="formData.title"
          class="textarea textarea-bordered w-full text-base"
          rows="3"
          placeholder="例如：你认为在Java项目中，哪个版本引入的特性最具革命性？"
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

    <!-- 投票选项设置 -->
    <div class="border p-4 rounded-lg bg-base-100">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-bold">投票选项 *</h3>
        <div class="flex items-center gap-2">
          <span class="text-sm">多选？</span>
          <input
              type="checkbox"
              v-model="formData.allowMultiple"
              class="toggle toggle-primary toggle-sm"
          />
        </div>
      </div>

      <div v-for="(option, index) in formData.options" :key="index" class="flex items-start gap-2 mb-3">
        <div class="w-8 text-center pt-2 font-medium">
          {{ getOptionKey(index) }}
        </div>
        <input
            v-model="option.value"
            type="text"
            class="input input-bordered flex-1"
            :placeholder="`选项 ${getOptionKey(index)} 内容`"
        />
        <button
            v-if="formData.options.length > 2"
            type="button"
            class="btn btn-circle btn-sm btn-error mt-1"
            @click="removeOption(index)"
        >
          ×
        </button>
      </div>

      <button
          type="button"
          class="btn btn-outline btn-xs"
          @click="addOption"
      >
        + 添加选项
      </button>
    </div>

    <!-- 投票解析说明 -->
    <div>
      <label class="block text-base mb-2">投票说明 / 解析 *</label>
      <textarea
          v-model="formData.analysis"
          class="textarea textarea-bordered w-full text-base"
          rows="4"
          placeholder="解释投票目的、背景或强调‘无标准答案’等..."
      ></textarea>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-3 pt-4">
      <button type="button" class="btn" @click="onCancel">取消</button>
      <button type="button" class="btn btn-primary" @click="onSubmit">保存投票题</button>
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
interface OptionItem {
  key: string
  value: string
}

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
  title: '你认为在Java项目中，哪个版本引入的特性最具革命性？',
  difficulty: 1,
  subjectId: 1,
  allowMultiple: false,
  options: [
    { key: 'A', value: 'Java 5 (泛型、注解、自动装箱)' },
    { key: 'B', value: 'Java 8 (Lambda表达式、Stream API)' },
    { key: 'C', value: 'Java 11 (新的HTTP客户端、局部变量类型推断)' },
    { key: 'D', value: 'Java 17 (密封类、模式匹配预览)' }
  ] as OptionItem[],
  analysis: '这是一个开放性的投票问题，旨在了解大家对Java发展历程的看法。Java 5奠定了现代Java的基础，Java 8的Lambda和Stream API带来了编程范式的巨大变革，而Java 11和17作为LTS版本，则带来了许多实用的生产级特性。每个选项都有其支持者，没有绝对的正确答案。'
})

// 生成选项字母 A, B, C...
const getOptionKey = (index: number): string => {
  return String.fromCharCode(65 + index)
}

// 添加选项
const addOption = () => {
  const nextIndex = formData.value.options.length
  if (nextIndex >= 26) return alert('最多支持26个选项（A-Z）')
  formData.value.options.push({
    key: getOptionKey(nextIndex),
    value: ''
  })
}

// 删除选项
const removeOption = (index: number) => {
  if (formData.value.options.length <= 2) return
  formData.value.options.splice(index, 1)
  // 重新计算 key（保持 A, B, C... 连续）
  formData.value.options = formData.value.options.map((opt, i) => ({
    key: getOptionKey(i),
    value: opt.value
  }))
}

// ====== Submit Logic ======
const onSubmit = () => {
  const { title, difficulty, subjectId, allowMultiple, options, analysis } = formData.value

  if (!title.trim()) return alert('投票问题不能为空')
  if (options.length < 2) return alert('至少需要两个选项')
  if (options.some(opt => !opt.value.trim())) return alert('所有选项内容必须填写')

  try {
    // 构建 option 组件
    const optionContent = JSON.stringify({
      options: options.map(opt => ({
        key: opt.key,
        value: opt.value.trim()
      })),
      allowMultiple: allowMultiple
    })

    // 构建 analysis 组件
    const analysisContent = JSON.stringify({
      analysis: analysis.trim()
    })

    const payload: SubmitPayload = {
      title: title.trim(),
      typeId: 17,
      difficulty,
      subjectId,
      questionComponents: [
        {
          componentType: 'option',
          content: optionContent
        },
        {
          componentType: 'analysis',
          content: analysisContent
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
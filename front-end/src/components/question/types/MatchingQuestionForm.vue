<!-- MatchingQuestionForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 题目内容 -->
    <div>
      <label class="block text-base mb-2">题目内容 *</label>
      <textarea
          v-model="formData.title"
          class="textarea textarea-bordered w-full text-base"
          rows="3"
          placeholder="例如：将下列Java集合类与其对应的底层实现结构进行连线匹配"
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

    <!-- 渲染方向 -->
    <div>
      <label class="block text-base mb-2">题目展示方向</label>
      <div class="flex items-center space-x-4">
        <label class="cursor-pointer label">
          <input
              v-model="formData.renderType"
              type="radio"
              name="render"
              value="vertical"
              class="radio"
          />
          <span class="label-text ml-2">垂直（左-右）</span>
        </label>
        <label class="cursor-pointer label">
          <input
              v-model="formData.renderType"
              type="radio"
              name="render"
              value="horizontal"
              class="radio"
          />
          <span class="label-text ml-2">水平（上-下）</span>
        </label>
      </div>
    </div>

    <!-- 左侧项列表 -->
    <div>
      <div class="flex justify-between items-center mb-2">
        <label class="block text-base">左侧选项 *</label>
        <button type="button" class="btn btn-xs btn-outline" @click="addLeftItem">+ 添加</button>
      </div>
      <div v-for="(item, index) in formData.leftList" :key="'L' + index" class="flex items-center gap-2 mb-2">
        <input
            v-model="item.content"
            type="text"
            class="input input-bordered input-sm flex-1"
            placeholder="如：ArrayList"
        />
        <button
            v-if="formData.leftList.length > 1"
            type="button"
            class="btn btn-xs btn-error"
            @click="removeLeftItem(index)"
        >
          删除
        </button>
      </div>
    </div>

    <!-- 右侧项列表 -->
    <div>
      <div class="flex justify-between items-center mb-2">
        <label class="block text-base">右侧选项 *</label>
        <button type="button" class="btn btn-xs btn-outline" @click="addRightItem">+ 添加</button>
      </div>
      <div v-for="(item, index) in formData.rightList" :key="'R' + index" class="flex items-center gap-2 mb-2">
        <input
            v-model="item.content"
            type="text"
            class="input input-bordered input-sm flex-1"
            placeholder="如：动态数组"
        />
        <button
            v-if="formData.rightList.length > 1"
            type="button"
            class="btn btn-xs btn-error"
            @click="removeRightItem(index)"
        >
          删除
        </button>
      </div>
    </div>

    <!-- 匹配关系设置 -->
    <div v-if="formData.leftList.length > 0 && formData.rightList.length > 0">
      <label class="block text-base mb-2">正确匹配关系 *</label>
      <div v-for="(pair, idx) in formData.matchPairs" :key="idx" class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 p-3 border rounded">
        <div>
          <label class="text-xs">左侧项</label>
          <select v-model="pair.leftIndex" class="select select-bordered select-sm w-full">
            <option v-for="(item, i) in formData.leftList" :key="i" :value="i">
              {{ item.content || `左侧 ${i + 1}` }}
            </option>
          </select>
        </div>
        <div>
          <label class="text-xs">对应右侧项</label>
          <select v-model="pair.rightIndex" class="select select-bordered select-sm w-full">
            <option v-for="(item, i) in formData.rightList" :key="i" :value="i">
              {{ item.content || `右侧 ${i + 1}` }}
            </option>
          </select>
        </div>
      </div>

      <button
          type="button"
          class="btn btn-xs btn-primary"
          @click="addMatchPair"
          :disabled="formData.matchPairs.length >= Math.min(formData.leftList.length, formData.rightList.length)"
      >
        + 添加匹配对
      </button>
    </div>

    <!-- 匹配规则说明 -->
    <div>
      <label class="block text-base mb-2">匹配规则说明（可选）</label>
      <textarea
          v-model="formData.ruleDesc"
          class="textarea textarea-bordered w-full"
          rows="2"
          placeholder="例如：每个左侧项仅能匹配一个右侧项，且一一对应..."
      ></textarea>
    </div>

    <!-- 题目解析 -->
    <div>
      <label class="block text-base mb-2">题目解析 / 考点分析（可选）</label>
      <textarea
          v-model="formData.analysisDesc"
          class="textarea textarea-bordered w-full"
          rows="4"
          placeholder="例如：核心知识点、常见混淆点、扩展说明等..."
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

// ====== Types ======
interface LeftItem {
  content: string
}
interface RightItem {
  content: string
}
interface MatchPair {
  leftIndex: number | null
  rightIndex: number | null
}

// ====== Emits ======
const emit = defineEmits<{
  (e: 'submit', payload: SubmitPayload): void
  (e: 'cancel'): void
}>()

interface SubmitPayload {
  typeId: number
  title: string
  difficulty: number
  subjectId: number
  questionComponents: Array<{
    componentType: string
    content: string
    meta?: string // 仅用于 renderType，不含 score
  }>
}

// ====== Data ======
const formData = ref({
  title: '',
  difficulty: 1,
  subjectId: 1,
  renderType: 'vertical' as 'vertical' | 'horizontal',
  leftList: [{ content: '' }] as LeftItem[],
  rightList: [{ content: '' }] as RightItem[],
  matchPairs: [{ leftIndex: 0, rightIndex: 0 }] as MatchPair[],
  ruleDesc: '',
  analysisDesc: ''
})

// 自动同步 matchPairs 数量（可选增强）
watch(
    () => [formData.value.leftList.length, formData.value.rightList.length],
    () => {
      const maxPairs = Math.min(formData.value.leftList.length, formData.value.rightList.length)
      if (formData.value.matchPairs.length > maxPairs) {
        formData.value.matchPairs = formData.value.matchPairs.slice(0, maxPairs)
      }
    },
    { deep: true }
)

// ====== Methods ======
const addLeftItem = () => {
  formData.value.leftList.push({ content: '' })
}
const removeLeftItem = (index: number) => {
  if (formData.value.leftList.length <= 1) return
  formData.value.leftList.splice(index, 1)
}

const addRightItem = () => {
  formData.value.rightList.push({ content: '' })
}
const removeRightItem = (index: number) => {
  if (formData.value.rightList.length <= 1) return
  formData.value.rightList.splice(index, 1)
}

const addMatchPair = () => {
  const max = Math.min(formData.value.leftList.length, formData.value.rightList.length)
  if (formData.value.matchPairs.length < max) {
    formData.value.matchPairs.push({ leftIndex: 0, rightIndex: 0 })
  }
}

// ====== Submit Logic ======
const onSubmit = () => {
  const {
    title,
    difficulty,
    subjectId,
    renderType,
    leftList,
    rightList,
    matchPairs,
    ruleDesc,
    analysisDesc
  } = formData.value

  if (!title.trim()) return alert('题目不能为空')
  if (leftList.some(i => !i.content.trim())) return alert('左侧选项不能为空')
  if (rightList.some(i => !i.content.trim())) return alert('右侧选项不能为空')

  // 构造 leftList 和 rightList with IDs
  const leftWithId = leftList.map((item, i) => ({
    id: `L${i + 1}`,
    content: item.content.trim()
  }))
  const rightWithId = rightList.map((item, i) => ({
    id: `R${i + 1}`,
    content: item.content.trim()
  }))

  // 构造 matchPairs
  const validPairs = matchPairs
      .filter(p => p.leftIndex !== null && p.rightIndex !== null)
      .map(p => ({
        leftId: `L${Number(p.leftIndex) + 1}`,
        rightId: `R${Number(p.rightIndex) + 1}`
      }))

  if (validPairs.length === 0) return alert('请至少设置一组匹配关系')

  const payload: SubmitPayload = {
    typeId: 9,
    title: title.trim(),
    difficulty,
    subjectId,
    questionComponents: [
      {
        componentType: 'match',
        content: JSON.stringify({
          leftList: leftWithId,
          rightList: rightWithId
        }),
        meta: JSON.stringify({ renderType }) // ✅ 保留 renderType，但无 score
      },
      {
        componentType: 'answer',
        content: JSON.stringify({
          matchPairs: validPairs,
          ruleDesc: ruleDesc.trim() || undefined
        })
        // ⚠️ 不包含 meta（即无 score / singleScore）
      },
      {
        componentType: 'analysis',
        content: JSON.stringify({
          analysisDesc: analysisDesc.trim() || ''
        })
      }
    ]
  }

  emit('submit', payload)
}

const onCancel = () => emit('cancel')
</script>
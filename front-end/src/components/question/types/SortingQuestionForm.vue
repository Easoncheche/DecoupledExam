<!-- SortingQuestionForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 题目内容 -->
    <div>
      <label class="block text-base mb-2">题目内容 *</label>
      <textarea
          v-model="formData.title"
          class="textarea textarea-bordered w-full text-base"
          rows="3"
          placeholder="例如：请将下列Java代码执行流程按正确顺序排列"
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

    <!-- 排序类型 & 提示 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-base mb-2">排序类型</label>
        <input
            v-model="formData.sortType"
            type="text"
            class="input input-bordered w-full text-base"
            placeholder="如：sequence / priority / timeline"
        />
      </div>
      <div>
        <label class="block text-base mb-2">排序提示（可选）</label>
        <input
            v-model="formData.tip"
            type="text"
            class="input input-bordered w-full text-base"
            placeholder="如：按代码开发到运行的流程排序"
        />
      </div>
    </div>

    <!-- 所有可选选项（固定内容，ID 永久） -->
    <div>
      <div class="flex justify-between items-center mb-2">
        <label class="block text-base">所有排序选项 *</label>
        <button type="button" class="btn btn-xs btn-outline" @click="addItem">+ 添加选项</button>
      </div>
      <div v-for="(item, index) in formData.itemList" :key="item.id" class="flex items-center gap-2 mb-2">
        <span class="text-gray-500 w-12">{{ item.id }}</span>
        <input
            v-model="item.content"
            type="text"
            class="input input-bordered input-sm flex-1"
            placeholder="如：定义主类Main"
        />
        <button
            v-if="formData.itemList.length > 1"
            type="button"
            class="btn btn-xs btn-error"
            @click="removeItem(item.id)"
        >
          删除
        </button>
      </div>
    </div>

    <!-- 正确顺序设置区 -->
    <div>
      <label class="block text-base mb-2">✅ 设置正确顺序（点击下方选项添加）</label>

      <!-- 已选答案序列 -->
      <div v-if="formData.correctOrder.length > 0" class="mb-3">
        <p class="text-sm text-gray-600 mb-1">当前答案顺序：</p>
        <div class="flex flex-wrap gap-2">
          <div
              v-for="(id, idx) in formData.correctOrder"
              :key="id"
              class="flex items-center bg-primary text-primary-content px-3 py-1.5 rounded shadow"
          >
            <span>{{ idx + 1 }}. {{ getItemContentById(id) }}</span>
            <div class="flex ml-2">
              <button
                  type="button"
                  class="btn btn-xs btn-ghost btn-square"
                  :disabled="idx === 0"
                  @click="moveAnswerUp(idx)"
              >
                ↑
              </button>
              <button
                  type="button"
                  class="btn btn-xs btn-ghost btn-square"
                  :disabled="idx === formData.correctOrder.length - 1"
                  @click="moveAnswerDown(idx)"
              >
                ↓
              </button>
              <button
                  type="button"
                  class="btn btn-xs btn-ghost btn-square text-error"
                  @click="removeFromOrder(idx)"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 可添加的选项 -->
      <div>
        <p class="text-sm text-gray-600 mb-1">可选（未在答案中）：</p>
        <div class="flex flex-wrap gap-2">
          <button
              v-for="item in unusedItems"
              :key="item.id"
              type="button"
              class="btn btn-xs btn-outline"
              @click="addToOrder(item.id)"
          >
            {{ item.content || `[空] ${item.id}` }}
          </button>
          <span v-if="unusedItems.length === 0" class="text-gray-400 text-sm">无剩余选项</span>
        </div>
      </div>
    </div>

    <!-- 顺序说明 -->
    <div>
      <label class="block text-base mb-2">顺序说明（可选）</label>
      <textarea
          v-model="formData.orderDesc"
          class="textarea textarea-bordered w-full"
          rows="2"
          placeholder="例如：遵循‘定义类→编写入口→实现逻辑→编译→运行’的Java程序执行规范"
      ></textarea>
    </div>

    <!-- 题目解析 -->
    <div>
      <label class="block text-base mb-2">题目解析 / 考点分析（可选）</label>
      <textarea
          v-model="formData.analysisDesc"
          class="textarea textarea-bordered w-full"
          rows="4"
          placeholder="例如：核心考点、易错点、拓展知识等..."
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
import { ref, computed } from 'vue'

const props = defineProps(['subjectList'])

// ====== Emits ======
const emit = defineEmits<{
  (e: 'submit', payload: SubmitPayload): void
  (e: 'cancel'): void
}>()

// ====== Types ======
interface SortItem {
  id: string
  content: string
}

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
let nextId = 1
const createItemId = () => `S${nextId++}`

const formData = ref({
  title: '',
  difficulty: 1,
  subjectId: 1,
  sortType: 'sequence',
  tip: '',
  itemList: [
    { id: createItemId(), content: '' }
  ] as SortItem[],
  correctOrder: [] as string[], // 独立维护正确顺序
  orderDesc: '',
  analysisDesc: ''
})

// ====== Computed ======
const unusedItems = computed(() => {
  const usedIds = new Set(formData.value.correctOrder)
  return formData.value.itemList.filter(item => !usedIds.has(item.id))
})

// ====== Helper ======
const getItemContentById = (id: string): string => {
  const item = formData.value.itemList.find(i => i.id === id)
  return item?.content || id
}

// ====== Methods: Options ======
const addItem = () => {
  formData.value.itemList.push({ id: createItemId(), content: '' })
}

const removeItem = (id: string) => {
  if (formData.value.itemList.length <= 1) return
  // 同时从 correctOrder 中移除（如果存在）
  formData.value.correctOrder = formData.value.correctOrder.filter(cid => cid !== id)
  formData.value.itemList = formData.value.itemList.filter(item => item.id !== id)
}

// ====== Methods: Answer Order ======
const addToOrder = (id: string) => {
  formData.value.correctOrder.push(id)
}

const removeFromOrder = (index: number) => {
  formData.value.correctOrder.splice(index, 1)
}

const moveAnswerUp = (index: number) => {
  if (index <= 0) return
  const temp = formData.value.correctOrder[index - 1]
  formData.value.correctOrder[index - 1] = formData.value.correctOrder[index]
  formData.value.correctOrder[index] = temp
}

const moveAnswerDown = (index: number) => {
  if (index >= formData.value.correctOrder.length - 1) return
  const temp = formData.value.correctOrder[index + 1]
  formData.value.correctOrder[index + 1] = formData.value.correctOrder[index]
  formData.value.correctOrder[index] = temp
}

// ====== Submit Logic ======
const onSubmit = () => {
  const {
    title,
    difficulty,
    subjectId,
    sortType,
    tip,
    itemList,
    correctOrder,
    orderDesc,
    analysisDesc
  } = formData.value

  if (!title.trim()) return alert('题目不能为空')
  if (itemList.some(i => !i.content.trim())) return alert('所有排序项内容不能为空')
  if (correctOrder.length === 0) return alert('请至少设置一个正确顺序项')

  // 验证所有 correctOrder 的 ID 都存在于 itemList
  const itemIds = new Set(itemList.map(i => i.id))
  if (!correctOrder.every(id => itemIds.has(id))) {
    return alert('答案中包含无效选项，请检查')
  }

  const payload: SubmitPayload = {
    typeId: 10,
    title: title.trim(),
    difficulty,
    subjectId,
    questionComponents: [
      {
        componentType: 'sort',
        content: JSON.stringify({ itemList }),
        meta: JSON.stringify({
          sortType: sortType.trim() || 'sequence',
          ...(tip.trim() ? { tip: tip.trim() } : {})
        })
      },
      {
        componentType: 'answer',
        content: JSON.stringify({
          correctOrder,
          ...(orderDesc.trim() ? { orderDesc: orderDesc.trim() } : {})
        })
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
<!-- AccountingEntryForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 题目内容 -->
    <div>
      <label class="block text-base mb-2">题目内容 *</label>
      <textarea
          v-model="formData.title"
          class="textarea textarea-bordered w-full text-base"
          rows="4"
          placeholder="例如：企业从银行取得期限为6个月的短期借款200000元，款项已存入银行账户"
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

    <!-- 会计分录列表 -->
    <div>
      <div class="flex justify-between items-center mb-2">
        <label class="block text-base">会计分录 *</label>
        <button
            type="button"
            class="btn btn-xs btn-outline"
            @click="addEntry"
        >
          + 添加分录
        </button>
      </div>

      <div v-for="(entry, index) in formData.entryList" :key="index" class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 border rounded">
        <div>
          <label class="text-xs">借方科目 *</label>
          <input
              v-model="entry.debitAccount"
              type="text"
              class="input input-bordered input-sm w-full"
              placeholder="如：银行存款"
          />
        </div>
        <div>
          <label class="text-xs">贷方科目 *</label>
          <input
              v-model="entry.creditAccount"
              type="text"
              class="input input-bordered input-sm w-full"
              placeholder="如：短期借款"
          />
        </div>
        <div>
          <label class="text-xs">金额（元） *</label>
          <input
              v-model.number="entry.amount"
              type="number"
              step="0.01"
              min="0"
              class="input input-bordered input-sm w-full"
          />
          <button
              v-if="formData.entryList.length > 1"
              type="button"
              class="btn btn-xs btn-error mt-1"
              @click="removeEntry(index)"
          >
            删除
          </button>
        </div>
      </div>

      <p class="text-sm text-gray-500">
        注：每条分录中借方金额 = 贷方金额，系统将自动填充相同金额。
      </p>
    </div>

    <!-- 分录说明 -->
    <div>
      <label class="block text-base mb-2">分录说明（可选）</label>
      <textarea
          v-model="formData.entryDesc"
          class="textarea textarea-bordered w-full"
          rows="3"
          placeholder="例如：该业务导致资产增加，负债等额增加..."
      ></textarea>
    </div>

    <!-- 题目解析 -->
    <div>
      <label class="block text-base mb-2">题目解析 / 考点分析（可选）</label>
      <textarea
          v-model="formData.analysisDesc"
          class="textarea textarea-bordered w-full"
          rows="4"
          placeholder="例如：业务性质、账户分类、易错点、拓展知识等..."
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
interface EntryItem {
  debitAccount: string
  creditAccount: string
  amount: number
}

interface SubmitPayload {
  typeId: number
  title: string
  difficulty: number
  subjectId: number
  questionComponents: Array<{
    componentType: string
    content: string
    // meta 字段省略（无 score）
  }>
}

// ====== Data ======
const formData = ref({
  title: '',
  difficulty: 1,
  subjectId: 1,
  entryList: [
    { debitAccount: '', creditAccount: '', amount: 0 }
  ] as EntryItem[],
  entryDesc: '',
  analysisDesc: ''
})

// ====== Methods ======
const addEntry = () => {
  formData.value.entryList.push({ debitAccount: '', creditAccount: '', amount: 0 })
}

const removeEntry = (index: number) => {
  if (formData.value.entryList.length <= 1) return
  formData.value.entryList.splice(index, 1)
}

// ====== Submit Logic ======
const onSubmit = () => {
  const { title, difficulty, subjectId, entryList, entryDesc, analysisDesc } = formData.value

  if (!title.trim()) return alert('题目不能为空')

  // 验证每条分录
  for (const entry of entryList) {
    if (!entry.debitAccount.trim()) return alert('借方科目不能为空')
    if (!entry.creditAccount.trim()) return alert('贷方科目不能为空')
    if (entry.amount <= 0) return alert('金额必须大于0')
  }

  // 构造 entryList for JSON
  const formattedEntryList = entryList.map(e => ({
    debitAccount: e.debitAccount.trim(),
    debitAmount: Number(e.amount.toFixed(2)),
    creditAccount: e.creditAccount.trim(),
    creditAmount: Number(e.amount.toFixed(2))
  }))

  const payload: SubmitPayload = {
    typeId: 8, // 分录题
    title: title.trim(),
    difficulty,
    subjectId,
    questionComponents: [
      {
        componentType: 'answer',
        content: JSON.stringify({
          entryList: formattedEntryList,
          entryDesc: entryDesc.trim() || undefined // 若为空则不传
        })
        // ⚠️ 不包含 meta（无 score）
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
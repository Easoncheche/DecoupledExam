<!-- CodingQuestionForm.vue -->
<template>
  <div class="space-y-6">
    <!-- 题目描述 -->
    <div>
      <label class="block text-base mb-2">题目描述 *</label>
      <textarea
          v-model="formData.title"
          class="textarea textarea-bordered w-full text-base"
          rows="3"
          placeholder="例如：实现冒泡排序算法，对整数数组进行升序排序。"
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

    <!-- 参考答案 -->
    <div class="border p-4 rounded-lg bg-base-100">
      <h3 class="font-bold mb-3">参考答案 *</h3>

      <div class="mb-3">
        <label class="text-sm">编程语言 *</label>
        <select v-model="formData.language" class="select select-sm select-bordered w-full max-w-xs">
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="javascript">JavaScript</option>
          <option value="c">C</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="text-sm">代码 *</label>
        <textarea
            v-model="formData.code"
            class="textarea textarea-bordered w-full font-mono text-sm"
            rows="12"
            placeholder="public static void bubbleSort(int[] arr) {&#10;    // your code here&#10;}"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm">时间复杂度</label>
          <input
              v-model="formData.timeComplexity"
              type="text"
              class="input input-sm input-bordered w-full"
              placeholder="例如：O(n²)"
          />
        </div>
        <div>
          <label class="text-sm">空间复杂度</label>
          <input
              v-model="formData.spaceComplexity"
              type="text"
              class="input input-sm input-bordered w-full"
              placeholder="例如：O(1)"
          />
        </div>
      </div>
    </div>

    <!-- 题目解析 -->
    <div>
      <label class="block text-base mb-2">题目解析 *</label>
      <textarea
          v-model="formData.analysisText"
          class="textarea textarea-bordered w-full text-base"
          rows="5"
          placeholder="解释算法思路、适用场景、注意事项等..."
      ></textarea>
    </div>

    <!-- 关键知识点 -->
    <div>
      <label class="block text-base mb-2">关键知识点（用中文逗号分隔）</label>
      <input
          v-model="formData.keyPointsStr"
          type="text"
          class="input input-bordered w-full"
          placeholder="例如：嵌套循环, 相邻元素比较, 原地排序"
      />
      <p class="text-sm text-gray-500 mt-1">
        将自动转换为数组：["嵌套循环", "相邻元素比较", ...]
      </p>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-3 pt-4">
      <button type="button" class="btn" @click="onCancel">取消</button>
      <button type="button" class="btn btn-primary" @click="onSubmit">保存编程题</button>
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
  title: '实现冒泡排序算法，对整数数组进行升序排序。',
  difficulty: 1,
  subjectId: 1,
  language: 'java',
  code: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  analysisText: '冒泡排序通过重复遍历数组，比较相邻元素并交换位置来实现排序。外层循环控制排序轮数，内层循环进行相邻元素比较。时间复杂度O(n²)，空间复杂度O(1)。虽然效率不高，但实现简单，适合小规模数据排序。',
  keyPointsStr: '嵌套循环, 相邻元素比较, 原地排序'
})

// ====== Submit Logic ======
const onSubmit = () => {
  const {
    title,
    difficulty,
    subjectId,
    language,
    code,
    timeComplexity,
    spaceComplexity,
    analysisText,
    keyPointsStr
  } = formData.value

  if (!title.trim()) return alert('题目描述不能为空')
  if (!code.trim()) return alert('参考答案代码不能为空')
  if (!analysisText.trim()) return alert('题目解析不能为空')

  try {
    // 构建 answer 组件
    const answerContent = JSON.stringify({
      code: code.replace(/\n/g, '\\n'), // 转义换行符
      language: language
    })

    const answerMeta = JSON.stringify({
      timeComplexity: timeComplexity || '',
      spaceComplexity: spaceComplexity || ''
    })

    // 构建 analysis 组件
    const keyPoints = keyPointsStr
        .split(/[,，]\s*/)
        .map(s => s.trim())
        .filter(s => s)

    const analysisContent = JSON.stringify({
      analysis: analysisText
    })

    const analysisMeta = JSON.stringify({
      keyPoints
    })

    const payload: SubmitPayload = {
      title: title.trim(),
      typeId: 14,
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
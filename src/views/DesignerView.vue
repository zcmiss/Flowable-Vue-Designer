<script setup>
import { defineAsyncComponent } from 'vue'
import ModelerSkeleton from '../components/ui/ModelerSkeleton.vue'

const BpmnModeler = defineAsyncComponent({
  loader: () => import('../components/BpmnModeler.vue'),
  delay: 200,
  timeout: 20000
})
</script>

<template>
  <Suspense>
    <template #default>
      <BpmnModeler />
    </template>
    <template #fallback>
      <ModelerSkeleton />
    </template>
  </Suspense>
</template>

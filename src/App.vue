<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <main>
    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" />
      </KeepAlive>
    </RouterView>
  </main>
</template>

<style>
/* Reset some default styles to ensure full screen */
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
main {
  width: 100%;
  height: 100%;
}
</style>

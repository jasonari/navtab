<template>
  <div class="container">
    <SettingMenu />
    <SearchBar />
    <NavBar />
  </div>
</template>

<script setup lang="ts">
import NavBar from '../components/Dock.vue'
import SearchBar from '../components/SearchBar.vue'
import SettingMenu from '../components/SettingMenu.vue'
</script>

<style scoped lang="scss">
.container {
  height: 100vh;
  overflow: hidden;
  background-image: url('/images/bg.jpg');
  background-size: cover;
}
</style>

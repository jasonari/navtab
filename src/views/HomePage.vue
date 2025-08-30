<template>
  <div
    class="h-screen overflow-hidden bg-cover"
    style="background-image: url('./images/bg.jpg')"
  >
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

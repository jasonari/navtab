import { ref, onMounted, onUnmounted, Ref } from 'vue'

export default function (containerRef: Ref<HTMLElement | null>) {
  const x = ref(0)
  const y = ref(0)
  const visible = ref(false)

  function handleContextMenu(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    visible.value = true
    x.value = e.clientX
    y.value = e.clientY
  }

  function closeMenu() {
    visible.value = false
  }

  onMounted(() => {
    containerRef.value?.addEventListener('contextmenu', handleContextMenu)
    window.addEventListener('click', closeMenu, true)
    window.addEventListener('contextmenu', closeMenu, true)
  })

  onUnmounted(() => {
    containerRef.value?.removeEventListener('contextmenu', handleContextMenu)
    window.removeEventListener('click', closeMenu, true)
    window.removeEventListener('contextmenu', closeMenu, true)
  })

  return {
    x,
    y,
    visible
  }
}

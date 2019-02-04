<template>
    <span class="sort-arrow">
        <span v-if="asc">&darr;</span>
        <span v-else>&uarr;</span>
    </span>
</template>

<script>

  export default {
    name: 'ColumnSortIndicator',
    props: {
      asc: Boolean
    }
  }

</script>

<style scoped>
  .sort-arrow {
    font-weight: bold;
  }
</style>

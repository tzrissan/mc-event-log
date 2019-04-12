<template>
  <div id="app">
    <div class="tabs">
      <div v-for="route in rootRoutes" :key="route.path" class="tab">
        <router-link :to="route.path">{{ route.title }}</router-link>
      </div>
    </div>
    <div class="tab-content">
      <router-view/>
    </div>
  </div>
</template>

<script>
  import { ROOT_ROUTES } from '@/router.js'

  export default {
    name: 'app',
    data: () => ({
      selectedTab: 'NewEvent',
      rootRoutes: ROOT_ROUTES
    })
  }
</script>

<style>
  body {
    margin: 0;
    min-width: 600px;
  }
</style>

<style lang="scss" scoped>

  @import "./assets/colors";

  div.tabs {
    display: grid;
    grid-template-columns: 90px auto auto auto auto auto;
    grid-row-gap: 1px;
    grid-column-gap: 1px;
    background-color: black;

    .tab {
      border: none;
      padding: 0;
      margin: 0;
      vertical-align: center;
      text-align: center;
      line-height: 45px;
      background-color: white;

      &:first-child a {
        color: $fields;
        font-size: 30px;
        font-weight: bolder;
        padding: 0 20px;
      }

      a {
        display: block;
        margin: 0;
        text-decoration: none;
        color: black;

        &.router-link-active {
          color: white;
          background-color: $blueSky !important;
        }
      }

    }
  }

</style>

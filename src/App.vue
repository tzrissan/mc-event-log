<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
import { api } from "./api";

api.lataaTapahtumat();

</script>

<template>

  <header>

    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/uusi">+</RouterLink>
      <RouterLink to="/tankkaukset">Tankkaukset</RouterLink>
    </nav>

  </header>

  <div class="content">
    <RouterView />
  </div>

</template>

<style>
@import '@/assets/base.css';

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

nav {
  width: 100%;
  font-size: 0.8rem;
  margin: 0;
  padding: 0 0.5rem 1rem 1rem;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  background-color: var(--color-background-mute);
  border-style: solid solid none solid;
  border-width: 1px;
  border-color: var(--color-border);
  border-radius: 0.3rem 0.3rem 0 0;
  margin-right: 0.1rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
  background-color: initial;
  text-decoration: none;
  font-weight: bold;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

header {
  margin: 0;
  padding: 0;
}

.content {
  min-width: 100vw;
  border: none;
  padding: 0 1rem 2rem 1rem;
}
</style>

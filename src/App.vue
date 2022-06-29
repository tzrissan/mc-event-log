<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { api } from "./api";

api.lataaTapahtumat();

</script>

<template>

  <header>

    <nav>
      <RouterLink to="/">+</RouterLink>
      <RouterLink to="/tankkaukset">Tankkaukset</RouterLink>
      <RouterLink to="/huollot">Huollot</RouterLink>
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

<style>
table {
  border: 1px solid var(--color-border);
  margin: 0;
  border-collapse: collapse;
  min-width: 100%;
  table-layout: fixed;
}

tr:nth-child(even) {
  background-color: var(--color-background-soft);
}

th {
  border: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
  padding: 0 0.2rem;
  font-weight: bold;
}

td {
  text-align: right;
  border-right: 1px solid var(--color-border);
  padding: 0 0.2rem;
  white-space: nowrap;
}

.pvm {
  text-align: center;
}

col.pyora {
  width: 6rem;
}

col.pvm {
  width: 6rem;
}


col.odo {
  width: 6rem;
}

col.matka {
  width: 6rem;
}

col.bensa {
  width: 6rem;
}

col.kulutus {
  width: 6rem;
}

col.info {
  min-width: 6rem;
}

.info {
  text-align: left;
}

.yksikko-ltr-per-100-km {
  display: inline-block;
  font-size: 0.5rem;
  line-height: 0.5rem;
}


.yksikko-ltr-per-100-km::before {
  content: "litraa /"
}

.yksikko-ltr-per-100-km::after {
  content: "100 km"
}


@media (max-width: 412px) {
  .yksikko-ltr-per-100-km {
    display: none;
  }
}

.yksikko-km:not(:empty)::after {
  content: " km";
  font-size: small;
}

@media (max-width: 768px) {
  .yksikko-km:not(:empty)::after {
    font-size: xx-small;
  }
}

@media (max-width: 412px) {
  .yksikko-km:not(:empty)::after {
    content: "";
  }
}


.yksikko-ltr::after {
  content: " ltr";
  font-size: small;
}

@media (max-width: 768px) {
  .yksikko-ltr::after {
    font-size: xx-small;
  }
}

@media (max-width: 412px) {
  .yksikko-ltr::after {
    content: "";
  }
}
</style>

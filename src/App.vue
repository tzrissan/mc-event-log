<template>
    <div id="app">
        <GasLog/>
    </div>
</template>

<script>
    import GasLog from './components/GasLog'
    import ColumnSortIndicator from './components/ColumnSortIndicator'
    import GasLogFilterSelector from './components/GasLogFilterSelector'

    export default {
        name: 'app',
        components: {
            GasLog,
            GasLogFilterSelector,
            ColumnSortIndicator
        }
    }
</script>

<style>
    #app {
    }
</style>

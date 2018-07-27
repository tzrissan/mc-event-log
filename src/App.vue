<template>
    <div id="app">
        <GasLog/>
    </div>
</template>

<script>
    import GasLog from './components/GasLog'
    import ColumnSortIndicator from './components/ColumnSortIndicator'
    import GasLogFilterSelector from './components/GasLogFilterSelector'
    import FilterGlyph from './components/FilterGlyph';

    export default {
        name: 'app',
        components: {
            GasLog,
            GasLogFilterSelector,
            ColumnSortIndicator,
            FilterGlyph
        }
    }
</script>

<style>
    #app {
        .blueSky {
            color: #4CB5F5
        }

        .granite {
            color: #B7B8B6
        }

        .pine {
            color: #34675C
        }

        .fields {
            color: #B3C100
        }
    }
</style>

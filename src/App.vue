<template>
    <div id="app">

        <div class="tabs">
            <div class="tab"
                 v-bind:class="{ active: selectedTab === 'NewEvent'}"
                 @click="selectedTab='NewEvent'">Uusi merkintä</div>
            <div class="tab"
                 v-bind:class="{ active: selectedTab === 'GasLog'}"
                 @click="selectedTab='GasLog'">Tankkaukset</div>
            <div class="tab"
                 v-bind:class="{ active: selectedTab === 'Maintenance'}"
                 @click="selectedTab='Maintenance'">Huollot</div>
            <div class="tab"
                 v-bind:class="{ active: selectedTab === 'Tyres'}"
                 @click="selectedTab='Tyres'">Renkaat</div>
            <div class="tab"
                 v-bind:class="{ active: selectedTab === 'Seasons'}"
                 @click="selectedTab='Seasons'">Kaudet</div>
            <div class="tab"
                 v-bind:class="{ active: selectedTab === 'Misc'}"
                 @click="selectedTab='Misc'">Muut</div>
        </div>
        <div class="tab-content">
            <GasLog v-if="selectedTab==='GasLog'"/>
            <Tyres v-if="selectedTab==='Tyres'"/>
            <Maintenance v-if="selectedTab==='Maintenance'"/>
            <Misc v-if="selectedTab==='Misc'"/>
        </div>
    </div>
</template>

<script>
    import GasLog from './components/GasLog'
    import Tyres from './components/Tyres'
    import Maintenance from './components/Maintenance'
    import Misc from './components/Misc'

    export default {
        name: 'app',
        components: {
            GasLog,
            Tyres,
            Maintenance,
            Misc
        },
        data: () => ({selectedTab: 'GasLog'})
    }
</script>

<style scoped>
    div.tabs {
        padding: 0;
        border-bottom: 1px solid lightgray;
        border-left: 1px solid black;
    }

    div.tabs .tab {
        display: inline-block;
        border: 1px solid black;
        border-bottom: none;
        border-left: none;
        padding: 10px 20px;
        margin: 0;
    }

    .active {
        color: white;
        background-color: #4CB5F5;
    }

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

</style>

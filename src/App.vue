<template>
    <div id="app">

        <div class="tabs">
            <div class="tab add-new"
                 v-bind:class="{ active: selectedTab === 'NewEvent'}"
                 @click="selectedTab='NewEvent'">+</div>
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
                 v-bind:class="{ active: selectedTab === 'Stats'}"
                 @click="selectedTab='Stats'">Tilastot</div>
            <div class="tab"
                 v-bind:class="{ active: selectedTab === 'Misc'}"
                 @click="selectedTab='Misc'">Muut</div>
        </div>
        <div class="tab-content">
            <NewEvent v-if="selectedTab==='NewEvent'"/>
            <GasLog v-if="selectedTab==='GasLog'"/>
            <Tyres v-if="selectedTab==='Tyres'"/>
            <Maintenance v-if="selectedTab==='Maintenance'"/>
            <Stats v-if="selectedTab==='Stats'"/>
            <Misc v-if="selectedTab==='Misc'"/>
        </div>
    </div>
</template>

<script>
    import NewEvent from './components/NewEvent'
    import GasLog from './components/GasLog'
    import Tyres from './components/Tyres'
    import Maintenance from './components/Maintenance'
    import Misc from './components/Misc'
    import Stats from './components/Stats'


    export default {
        name: 'app',
        components: {
            NewEvent,
            GasLog,
            Tyres,
            Maintenance,
            Stats,
            Misc
        },
        data: () => ({selectedTab: 'NewEvent'})
    }
</script>


<style>
    body {
        margin: 0;
        min-width: 600px;
    }
</style>

<style scoped>

    div.tabs {
        display: grid;
        grid-template-columns: 90px auto auto auto auto auto;
        grid-row-gap: 1px;
        grid-column-gap: 1px;
        background-color: black;
    }

    div.tabs .tab {
        #display: inline;
        border: none;
        padding: 10px 20px;
        margin: 0;
        vertical-align: center;
        text-align: center;
        line-height: 45px;
        background-color: white;
    }

    .add-new {
        color: #B3C100;
        font-size: 30px;
        font-weight: bolder;
        padding: 0 20px;
    }

    .active {
        color: white;
        background-color: #4CB5F5 !important;
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

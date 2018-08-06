import {Pie} from 'vue-chartjs'

export default {
    name: 'PieChart',
    extends: Pie,
    props: {data: Object, options: Object},
    mounted() {
        this.renderChart(this.data, this.options);
    },
    watch: {
        data: function () {
            this.renderChart(this.data, this.options);
        },
        options: function () {
            this.renderChart(this.data, this.options);
        }
    }
}
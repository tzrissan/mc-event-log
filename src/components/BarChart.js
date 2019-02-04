import { Bar } from 'vue-chartjs'

export default {
  name: 'BarChart',
  extends: Bar,
  props: { data: Object, options: Object },
  mounted () {
    this.renderChart(this.data, this.options)
  },
  watch: {
    data: function () {
      this.renderChart(this.data, this.options)
    },
    options: function () {
      this.renderChart(this.data, this.options)
    }
  }
}

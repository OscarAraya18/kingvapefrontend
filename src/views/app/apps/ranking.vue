<template>

  <div>
    <div style="display: flex; justify-content: center; align-items: center;">
      <b-card style="width: 30%; margin-right: 30px;">
        <div style="display: flex;">
          <b-card-text style="font-size: xx-large;">
            Conversaciones totales:
          </b-card-text>
          <div class="flex-grow-1"></div>
          <b-card-text style="font-size: xx-large; color: rgb(52, 52, 142);">
            {{conversacionesTotales}}
          </b-card-text>
        </div>
      </b-card>

      <b-card style="width: 30%;">
        <div style="display: flex;">
          <b-card-text style="font-size: xx-large;">
            Conversaciones vendidas:
          </b-card-text>
          <div class="flex-grow-1"></div>
          <b-card-text style="font-size: xx-large; color: rgb(70, 142, 52);">
            {{conversacionesVendidas}}
          </b-card-text>
        </div>
      </b-card>

      <b-card style="width: 30%; margin-left: 30px;">
        <div style="display: flex;">
          <b-card-text style="font-size: xx-large;">
            Conversaciones no vendidas:
          </b-card-text>
          <div class="flex-grow-1"></div>
          <b-card-text style="font-size: xx-large; color: rgb(184, 39, 29);">
            {{conversacionesNoVendidas}}
          </b-card-text>
        </div>
      </b-card>
    </div>

    <br><br>
    <div style="display: flex; justify-content: center; align-items: center;">
      <div id="chart">
        <apexchart type="pie" width="700" :options="opcionesGraficoCircular" :series="facturadoPorAgente"></apexchart>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import ApexCharts from 'apexcharts'

const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:telasmasbackend.onrender.com');

export default {
  

  data() {
    return {
      conversacionesTotales: 0,
      conversacionesVendidas: 0,
      conversacionesNoVendidas: 0,

      facturadoPorAgente: [],
      
      opcionesGraficoCircular: {
        chart: {
          width: 700,
          type: 'pie',
        },
        labels: [],
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      },

    };
  },

  methods: {
    getPieChartInformation(){
      axios.get(constants.routes.backendAPI+'/selectPieChartInformation').then((response) =>{
        this.$set(this.opcionesGraficoCircular, 'labels', Object.keys(response.data));
        this.facturadoPorAgente = Object.values(response.data);
        console.log(this.opcionesGraficoCircular);
      })
    },

    
  },

  
  

  computed: {

  },

  mounted(){
    this.getPieChartInformation();

    try {
      webSocket.onmessage = (websocketMessage) => {
        //alert(websocketMessage);
      }
    } catch {

    }
  },
  created: function() {
   
  },
};
</script>

<style>
  
</style>

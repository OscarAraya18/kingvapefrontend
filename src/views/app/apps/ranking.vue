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

    <br><br><br><br>
    <div style="display: flex; justify-content: center; align-items: center;">
      
      <div id="chart1" style="margin-left: 100px;">
        <apexchart type="pie" width="800" :options="opcionesGraficoCircular" :series="facturadoPorAgente"></apexchart>
      </div>
      <div class="flex-grow-1"></div>

      <div id="chart2" style="margin-right: 100px;">
        <apexchart type="bar" width="800" :options="opcionesGraficoBarra" :series="conversacionesPorAgente"></apexchart>
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
      
      opcionesGraficoCircular: {},

      conversacionesPorAgente: 
      [
        {
          name: 'VENDIDAS',
          data: [44, 55, 41, 67, 22, 43],
          color: '#008a07'
        }, 
        {
          name: 'NO VENDIDAS',
          data: [13, 23, 20, 8, 13, 27],
          color: '#d10015'
        }
      ],

      opcionesGraficoBarra: {
        chart: {type: 'bar', height: 350, stacked: true},
        plotOptions: {bar: { horizontal: false, borderRadius: 10}},
        xaxis: {type: 'string', categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT','01/05/2011 GMT', '01/06/2011 GMT']},
        fill: {colors: ['#008a07', '#d10015'], opacity: 1}
      },
          
          

    };
  },

  methods: {
    getPieChartInformation(){
      axios.get(constants.routes.backendAPI+'/selectPieChartInformation').then((response) =>{
        this.facturadoPorAgente = Object.values(response.data);
        this.opcionesGraficoCircular = {
          chart: {
            width: 700,
            type: 'pie',
          },
          labels: Object.keys(response.data),
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
        }
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

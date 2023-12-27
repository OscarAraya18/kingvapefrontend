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
      
      <div id="chart1" style="margin-left: 70px; margin-right: 35px;">
        <apexchart type="pie" width="800" :options="opcionesGraficoCircular" :series="facturadoPorAgente"></apexchart>
      </div>
      <div class="flex-grow-1"></div>

      <div id="chart2" style="margin-left: 35px; margin-right: 70px;">
        <apexchart type="bar" width="800" :options="opcionesGraficoBarra" :series="conversacionesPorAgente"></apexchart>
        
        <br><br><br><br>
        <div style="display: flex; justify-content: center;">
          <b-card-text style="font-size: xx-large; color: #00578a">
            Venta del día:
          </b-card-text>
          <b-card-text style="font-size: xx-large; margin-left: 10px;">
            {{vendedoraDelDia}}
          </b-card-text>
        </div>
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

      conversacionesPorAgente: [],
      opcionesGraficoBarra: {},

      vendedoraDelDia: ''
          

    };
  },

  methods: {
    getInformation(){
      
      axios.get(constants.routes.backendAPI+'/selectPieChartInformation').then((response) =>{
        this.facturadoPorAgente = Object.values(response.data);
        this.opcionesGraficoCircular = {chart: {width: 850, type: 'pie', fontSize: 40}, tooltip: {enabled: false}, labels: Object.keys(response.data),
        legend: {fontSize: '30px'}};
      });

      axios.get(constants.routes.backendAPI+'/selectBarChartInformation').then((response) =>{
        this.opcionesGraficoBarra = 
        {
          chart: {type: 'bar', height: 350, stacked: true},
          plotOptions: {bar: { horizontal: false, borderRadius: 10}},
          xaxis: {type: 'string', categories: response.data.result.map(agent => agent.agentName),
          labels: {style: {fontSize: '20px'}}},
          fill: {colors: ['#008a07', '#d10015'], opacity: 1},
          legend: {show: false},
        };
        this.conversacionesPorAgente = 
        [
          {
            name: 'VENDIDAS',
            data: response.data.result.map(agent => agent.whatsappSelledConversations),
            color: '#008a07'
          }, 
          {
            name: 'NO VENDIDAS',
            data: response.data.result.map(agent => agent.whatsappNotSelledConversations),
            color: '#d10015'
          }
        ];
      });

      axios.get(constants.routes.backendAPI+'/selectTodayInformation').then((response) =>{
        this.conversacionesTotales = response.data.result[0].whatsappTotalConversations;
        this.conversacionesVendidas = response.data.result[0].whatsappSelledConversations;
        this.conversacionesNoVendidas = response.data.result[0].whatsappNotSelledConversations;
      });

      axios.get(constants.routes.backendAPI+'/selectTodayTopSell').then((response) =>{
        console.log(response.data);
        this.vendedoraDelDia = response.data.result;
      });


    },
    
  },

  
  

  computed: {

  },

  mounted(){
    this.getInformation();

    setInterval(() => {
      this.getInformation();
    }, 30000);

    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);
        const websocketMessageID = websocketMessageJSON.websocketMessageID;
        if (websocketMessageID == '/updateRanking'){
          this.getInformation();
        }
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

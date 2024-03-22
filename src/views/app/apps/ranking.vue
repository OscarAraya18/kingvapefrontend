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
        <b-card>
          <apexchart type="pie" width="675" :options="opcionesGraficoCircular" :series="facturadoPorAgente"></apexchart>
          <br><br>
          
          <div style="display: flex;">
            <b-card-text style="font-size: xx-large; color: #00578a">
              Venta del día:
            </b-card-text>
            <b-card-text style="font-size: xx-large; margin-left: 10px;">
              {{vendedoraDelDia[0].agentName}}
            </b-card-text>
          </div>
        </b-card>

        <br>
      </div>

      
      <div class="flex-grow-1"></div>

      <div id="chart2" style="margin-left: 35px; margin-right: 70px;">
        <b-card>
          <apexchart type="bar" width="700" :options="opcionesGraficoBarra" :series="conversacionesPorAgente"></apexchart>
        </b-card>
        
        <br>
        <div>
          <b-card>
            <div v-for="agentInformation in feedbackInformation">
              <div style="display: flex; margin-bottom: 15px;">
                <star-rating v-model="agentInformation.agentScore" :star-size="25" :increment="0.5" :border-width="5" :show-rating="false"></star-rating>
                <b-card-text style="font-size: xx-large; margin-left: 20px;">
                  {{agentInformation.agentName}}
                </b-card-text>
              </div>
            </div>
          </b-card>
        </div>

      </div>
    </div>
  </div>
  
</template>

<script>
import axios from 'axios';
import ApexCharts from 'apexcharts'
import StarRating from 'vue-star-rating'


const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:kingvapebackend2.onrender.com');

export default {
  

  components: {
    StarRating
  },

  data() {
    return {
      conversacionesTotales: 0,
      conversacionesVendidas: 0,
      conversacionesNoVendidas: 0,

      facturadoPorAgente: [],
      opcionesGraficoCircular: {},

      conversacionesPorAgente: [],
      opcionesGraficoBarra: {},

      vendedoraDelDia: '',

      feedbackInformation: null,
      
      test: 5

    };
  },

  methods: {
    getAgentColors(agentNames){
      var agentColors = [];
      const colorByAgent = 
      {
        'Sharon Espinoza': '#fae187',
        'Sofia Hernandez': '#a0d995',
        'Daniela Vega': '#dcd9f8',
        'Nicole Badilla': '#a2edce',
        'Diana Jimenez': '#ffa8b8',
        'Stef Ponce': '#b5dcf9',
        'Sergio Barrot': '#060f73',
        'Jose Estrada': '#004a1c',
        'Franco Chacon': '#000000'
      };
      for (var agentIndex in agentNames){
        const agentName = agentNames[agentIndex];
        if (agentName in colorByAgent){
          agentColors.push(colorByAgent[agentName]);
        } else {
          agentColors.push('#d3bead');
        }
      }
      return agentColors;
    },


    getInformation(){

      axios.get(constants.routes.backendAPI+'/selectTodayFeedbackInformation').then((response) =>{
        this.feedbackInformation = response.data;
      });
      
      axios.get(constants.routes.backendAPI+'/selectPieChartInformation').then((response) =>{
        this.facturadoPorAgente = Object.values(response.data);
        this.opcionesGraficoCircular = 
        {
          chart: {width: 850, type: 'pie', fontSize: 40}, 
          tooltip: {enabled: false}, 
          labels: Object.keys(response.data),
          legend: {fontSize: '30px'},
          colors: this.getAgentColors(Object.keys(response.data)),
          dataLabels: {enabled: true}
        };
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
        this.conversacionesTotales = response.data.result.total.whatsappTotalConversations;
        this.conversacionesVendidas = response.data.result.total.whatsappSelledConversations;
        this.conversacionesNoVendidas = response.data.result.total.whatsappNotSelledConversations;
      });

      axios.get(constants.routes.backendAPI+'/selectTodayTopSell').then((response) =>{
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

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

    <br><br><br>
    
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
          <div style="display: flex;">
            <b-card-text style="font-size: xx-large; color: #00578a">
              Vendedor(a) del mes:
            </b-card-text>
            <b-card-text style="font-size: xx-large; margin-left: 10px;">
              {{monthSell}}
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

<style scoped>

canvas {
  overflow-y: hidden;
  overflow-x: hidden;
  width: 100%;
  margin: 0;
}

.animation > div > div {
  padding: 0.25rem 0.75rem;
  height:2.81rem;
  margin-bottom: 2.81rem;
  display:inline-block;
}

.animation div:first-child {
  animation: text-animation 8s infinite;
}

.first div {
  background-color:#20a7d8;
}
.second div {
  background-color:#CD921E;
}
.third div {
  background-color:#c10528;
}

@keyframes text-animation {
  0% {margin-top: 0;}
  10% {margin-top: 0;}
  20% {margin-top: -5.62rem;}
  30% {margin-top: -5.62rem;}
  40% {margin-top: -11.24rem;}
  60% {margin-top: -11.24rem;}
  70% {margin-top: -5.62rem;}
  80% {margin-top: -5.62rem;}
  90% {margin-top: 0;}
  100% {margin-top: 0;}
}

</style>

<script>
import axios from 'axios';
import ApexCharts from 'apexcharts'
import StarRating from 'vue-star-rating'


const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:payitcr.com');

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
      monthSell: '',

      feedbackInformation: null
      
      

    };
  },

  methods: {
    getAgentColors(agentNames){
      var agentColors = [];
      const colorByAgent = 
      {
        'Sharon Espinoza': '#fae187',
        'Mariana Mesen': '#daff8f',
        'Daniela Murillo': '#fcac60',
        'Sergio Barrot': '#424880',
        'Jose Estrada': '#255c34',
        'Franco Chacon': '#8a8a8a',
        'Ricardo Chacon': '#e86800',
        'Emma Garcia': '#b5e3eb',
        'Diana Jimenez': '#ffa8b8',
        'Kathy Gonzalez': '#b0a1ff',
        'Rafat J.': '#000000'
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

    getAgentLabels(agentInformation){
      const pares = Object.entries(agentInformation);
      pares.sort((a, b) => b[1] - a[1]);
      const llavesOrdenadas = pares.map(par => par[0]);
      llavesOrdenadas[0] = llavesOrdenadas[0] + ' 🔥';
      llavesOrdenadas[llavesOrdenadas.length-1] = llavesOrdenadas[llavesOrdenadas.length-1] + ' ❄️';
      return llavesOrdenadas;
    },

    getAgentLabelsForColors(agentInformation){
      const pares = Object.entries(agentInformation);
      pares.sort((a, b) => b[1] - a[1]);
      const llavesOrdenadas = pares.map(par => par[0]);
      return llavesOrdenadas;
    },


    getAgentLabelsForLineChart(agents){
      const sortedAgents = agents.sort((a, b) => {
        const totalA = a.whatsappNotSelledConversations + a.whatsappSelledConversations;
        const totalB = b.whatsappNotSelledConversations + b.whatsappSelledConversations;
        return totalB - totalA;
      });
      const sortedNames = sortedAgents.map(agent => agent.agentName);
      return sortedNames;
    },


    getInformation(){

      axios.get(constants.routes.backendAPI+'/selectTodayFeedbackInformation').then((response) =>{
        this.feedbackInformation = response.data;
      });
      
      axios.get(constants.routes.backendAPI+'/selectPieChartInformation').then((response) =>{
        this.facturadoPorAgente = Object.values(response.data).sort((a, b) => b - a);
        this.opcionesGraficoCircular = 
        {
          chart: {width: 850, type: 'pie', fontSize: 40}, 
          tooltip: {enabled: false}, 
          labels: this.getAgentLabels(response.data),
          legend: {fontSize: '30px'},
          colors: this.getAgentColors(this.getAgentLabelsForColors(response.data)),
          dataLabels: {enabled: false}
        };
      });

      axios.get(constants.routes.backendAPI+'/selectBarChartInformation').then((response) =>{


        console.log(this.getAgentLabelsForLineChart(response.data.result));

        this.opcionesGraficoBarra = 
        {
          chart: {type: 'bar', height: 350, stacked: true},
          plotOptions: {bar: { horizontal: false, borderRadius: 10}},
          xaxis: {type: 'string', categories: this.getAgentLabelsForLineChart(response.data.result),
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

      axios.post(constants.routes.backendAPI+'/selectTodayInformation', 
      {
        todayInitialDate: null,
        todayEndDate: null
      }).then((response) =>{
        this.conversacionesTotales = response.data.result.total.whatsappTotalConversations;
        this.conversacionesVendidas = response.data.result.total.whatsappSelledConversations;
        this.conversacionesNoVendidas = response.data.result.total.whatsappNotSelledConversations;
      });

      axios.get(constants.routes.backendAPI+'/selectTodayTopSell').then((response) =>{
        this.vendedoraDelDia = response.data.result;
      });

      axios.get(constants.routes.backendAPI+'/selectThisMonthTopSell').then((response) =>{
        this.monthSell = response.data.result.agentName;
      });


    }
    
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

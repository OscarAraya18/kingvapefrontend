<template>

  <div>
    
    <div style="display: flex; justify-content: center; align-items: center;">
      <b-card style="width: 30%; margin-right: 30px;">
        <div v-if="clientFollowupReport" style="display: flex; justify-content: center; align-items: center;">
          <div style="display: flex; width: 33%; justify-content: center; align-items: center;">
            <i class="i-Check text-40 text-success"></i>
            <p style="font-size: x-large; margin-left: 15px; margin-top: 15px;">{{ clientFollowupReport.filter(client => client.lastDate != null).filter(client => isMoreThan30Days(client.lastDate, client.isMinor) == false).length }}</p>
          </div>
          <div style="display: flex; width: 33%; justify-content: center; align-items: center;">
            <i class="i-Loading-2 text-40 text-danger"></i>
            <p style="font-size: x-large; margin-left: 15px; margin-top: 15px;">{{ clientFollowupReport.filter(client => client.lastDate != null).filter(client => isMoreThan30Days(client.lastDate, client.isMinor) == true).length }}</p>
          </div>
          <div style="display: flex; width: 33%; justify-content: center; align-items: center;">
            <i class="i-Close text-40 text-gray"></i>
            <p style="font-size: x-large; margin-left: 15px; margin-top: 15px;">{{ clientFollowupReport.filter(client => client.lastDate == null).length }}</p>
          </div>
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

      feedbackInformation: null,
      clientFollowupReport: null
      
      

    };
  },

  methods: {
    getAgentColors(agentNames){
      var agentColors = [];
      const colorByAgent = 
      {
        'Oriana Vargas': '#fff9a6',
        'Sergio Barrot': '#424880',
        'Jose Estrada': '#255c34',
        'Franco Chacon': '#8a8a8a',
        'Ricardo Chacon': '#e86800',
        'Emma Garcia': '#b5e3eb',
        'Diana Jimenez': '#ffa8b8',
        'Clara Salablanca': '#b338ff',
        'Rafat J.': '#000000',
        'Madheline Sierra': '#a0d995'
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

    selectClientFollowupReport(){
      axios.post(constants.routes.backendAPI+'/selectClientFollowupReport')
      .then((response) => {
        if (response.data.success){
          this.clientFollowupReport = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar la cantidad de contactos del reporte', 'Ha ocurrido un error inesperado al consultar la cantidad de contactos del reporte. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar la cantidad de contactos del reporte', 'Ha ocurrido un error inesperado al consultar la cantidad de contactos del reporte. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
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


    },

    isMoreThan30Days(lastDate, isMinor) {
      if (!lastDate) return false; // Si no hay una fecha, no se muestra el icono
      if (isMinor == true) return false;

      const currentDate = new Date(); // Fecha actual
      const parsedLastDate = new Date(lastDate); // Convertir lastDate a objeto Date

      // Calcular la diferencia en milisegundos
      const diffInMs = currentDate - parsedLastDate;

      // Convertir la diferencia a días
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      // Comprobar si han pasado 30 días o más
      return diffInDays >= 60;
    },
    
  },

  
  

  computed: {

  },

  mounted(){


    this.getInformation();
    this.selectClientFollowupReport();

    setInterval(() => {
      this.getInformation();
      this.selectClientFollowupReport();
    }, 30000);

    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);
        const websocketMessageID = websocketMessageJSON.websocketMessageID;
        if (websocketMessageID == '/updateRanking'){
          this.getInformation();
          this.selectClientFollowupReport();
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

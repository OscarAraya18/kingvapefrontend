<template>
  <div class="main-content">
    <div style="display: flex;">
      <div style="width: 48%; margin-right: 2%;">
        <br><br><br>
        <div style="display: flex;">

          <b-card style="width: 48%; background-color: #fed330; margin-right: 1%;">
            <div style="display: flex;">
              <b-badge style="font-size: x-large; margin-right: 20px; max-height: 40px;" pill variant="secondary">{{motosZapote}}</b-badge>
              <h2 style="margin-top: 5px; margin-bottom: 30px;"><strong>ZAPOTE:</strong></h2>
            </div>
            <div v-for="(agent, key) in deliveryInformation['1']" :key="key" style="margin-top: 5px; margin-bottom: 5px;">
              <p v-if="key == 'Sin mensajero asignado'" style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key }}</strong>: {{ agent }}</p>
              <div v-else style="display: flex;">
                <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key.split(' ')[0] }}</strong>:</p>
                <div class="flex-grow-1"></div>
                <b-badge style="margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">{{ agent.route }}</b-badge>
                <b-badge style="margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">{{ agent.delivered }}</b-badge>
              </div>
            </div>
          </b-card>
          <br>
          <b-card style="width: 48%; background-color: #db67a3; margin-left: 1%;">
            <div style="display: flex;">
              <b-badge style="font-size: x-large; margin-right: 20px; max-height: 40px;" pill variant="secondary">{{motosEscazu}}</b-badge>
              <h2 style="margin-top: 5px; margin-bottom: 30px;"><strong>ESCAZÚ:</strong></h2>
            </div>
            <div v-for="(agent, key) in deliveryInformation['4']" :key="key" style="margin-top: 5px; margin-bottom: 5px;">
              <p v-if="key == 'Sin mensajero asignado'" style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key }}</strong>: {{ agent }}</p>
              <div v-else style="display: flex;">
                <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key.split(' ')[0] }}</strong>:</p>
                <div class="flex-grow-1"></div>
                <b-badge style="margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">{{ agent.route }}</b-badge>
                <b-badge style="margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">{{ agent.delivered }}</b-badge>
              </div>
            </div>
          </b-card>
        </div>
        
        <br><br><br>

        <div style="display: flex;">
          <b-card style="width: 48%; background-color: #a78dcc; margin-right: 1%;">
            <div style="display: flex;">
              <b-badge style="font-size: x-large; margin-right: 20px; max-height: 40px;" pill variant="secondary">{{motosHeredia}}</b-badge>
              <h2 style="margin-top: 5px; margin-bottom: 30px;"><strong>HEREDIA:</strong></h2>
            </div>
            <div v-for="(agent, key) in deliveryInformation['5']" :key="key" style="margin-top: 5px; margin-bottom: 5px;">
              <p v-if="key == 'Sin mensajero asignado'" style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key }}</strong>: {{ agent }}</p>
              <div v-else style="display: flex;">
                <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key.split(' ')[0] }}</strong>:</p>
                <div class="flex-grow-1"></div>
                <b-badge style="margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">{{ agent.route }}</b-badge>
                <b-badge style="margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">{{ agent.delivered }}</b-badge>
              </div>
            </div>
          </b-card>
          <br>
          <b-card style="width: 48%; background-color: #55b5ab; margin-left: 1%;">
            <div style="display: flex;">
              <b-badge style="font-size: x-large; margin-right: 20px; max-height: 40px;" pill variant="secondary">{{motosCartago}}</b-badge>
              <h2 style="margin-top: 5px; margin-bottom: 30px;"><strong>CARTAGO:</strong></h2>
            </div>
            <div v-for="(agent, key) in deliveryInformation['3']" :key="key" style="margin-top: 5px; margin-bottom: 5px;">
              <p v-if="key == 'Sin mensajero asignado'" style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key }}</strong>: {{ agent }}</p>
              <div v-else style="display: flex;">
                <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key.split(' ')[0] }}</strong>:</p>
                <div class="flex-grow-1"></div>
                <b-badge style="margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">{{ agent.route }}</b-badge>
                <b-badge style="margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">{{ agent.delivered }}</b-badge>
              </div>
            </div>
          </b-card>
        </div>
      </div>

      <div style="width: 50%;">
        <br>
        <b-card style="background-color: rgb(214, 214, 214);">
          <MapComponent style="border-radius: 2%" v-if="openMap" :route="true" :multipleClients="locations" mapHeight="370px" mapWidth="100%"></MapComponent>
        </b-card>
        <br>
        <b-card style="background-color: rgb(214, 214, 214); max-height: 340px; overflow-y: auto;">
          <div v-for="time in timeInformation" style="margin-top: 5px; margin-bottom: 5px;">
            
            <div>
              <h4><strong>{{ getTimerRepresentation(time.timeInSeconds) }}: </strong> {{ time.clientName }} </h4>
            </div>

          </div>
        </b-card>
      </div>
    
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 
import Vue from 'vue';
import MapComponent from "../../../components/mapComponent.vue";


export default {
  components: {
    MapComponent
  },

  data() {
    return {
      deliveryInformation: {},
      timeInformation: [],
      locations: [],
      openMap: false,

      sucursal: 0,

      queryInterval: null,
      timeInterval: null,

      motosZapote: 0,
      motosEscazu: 0,
      motosHeredia: 0,
      motosCartago: 0
    };
  },

  methods: {
    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    selectMensajerosDisponibles(){
      axios.post(constants.routes.backendAPI+'/selectMensajerosDisponibles').then((response) =>{
        if (response.data.success){
          var cantidadZapote = 0;
          var cantidadEscazu = 0;
          var cantidadHeredia = 0;
          var cantidadCartago = 0;
          for (var agentIndex in response.data.result){
            const localityID = response.data.result[agentIndex].localityAgentLocalityID;
            if (localityID == 1){
              cantidadZapote += 1;
            } else if (localityID == 4){
              cantidadEscazu += 1;
            } else if (localityID == 5){
              cantidadHeredia += 1;
            } else {
              cantidadCartago += 1;
            }
          }
          this.motosZapote = cantidadZapote;
          this.motosEscazu = cantidadEscazu;
          this.motosHeredia = cantidadHeredia;
          this.motosCartago = cantidadCartago;
        } else {
          this.showNotification('danger', 'Error al solicitar la lista de motorizados disponibles', 'Ha ocurrido un error inesperado al solicitar la lista de motorizados disponibles. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al solicitar la lista de motorizados disponibles', 'Ha ocurrido un error inesperado al solicitar la lista de motorizados disponibles. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    getTimerRepresentation(timeInSeconds){
      const hours = Math.floor(timeInSeconds / 3600);
      const minutes = Math.floor((timeInSeconds % 3600) / 60);
      const remainingSeconds = timeInSeconds % 60;
      const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      return timeFormat;
    },

    selectTodayDeliveryInformation(){
      axios.post(constants.routes.backendAPI+'/selectTodayDeliveryInformation').then((response) =>{
        if (response.data.success){
          this.deliveryInformation = {};
          
          this.locations = [];
          this.timeInformation = [];
          
          const informationList = response.data.result;
          for (var index in informationList){

            const information = informationList[index];
            const localityID = information.whatsappInvoiceLocalityID;

            if (information.whatsappInvoiceState == 'R'){
              this.locations.push
              ({
                'whatsappConversationID': information.whatsappInvoiceID,
                'latitude': JSON.parse(information.whatsappInvoiceClientLocation).latitude,
                'longitude': JSON.parse(information.whatsappInvoiceClientLocation).longitude,
                'whatsappConversationRecipientProfileName': information.whatsappConversationRecipientProfileName,
                'whatsappConversationRecipientPhoneNumber': information.whatsappConversationRecipientPhoneNumber,
                'amount': information.amount,
                'opened': false
              });
            }
            

            if (!this.deliveryInformation[localityID]){
              Vue.set(this.deliveryInformation, localityID, {'Sin mensajero asignado': 0});
            }
            const agentName = information.localityAgentName;
            if (!this.deliveryInformation[localityID][agentName]){
              if (agentName){
                Vue.set(this.deliveryInformation[localityID], agentName, {'delivered': 0, 'route': 0}); 
              }
            }
            const state = information.whatsappInvoiceState;
            if (agentName){
              if (state == 'E'){
                Vue.set(this.deliveryInformation[localityID][agentName], 'delivered', this.deliveryInformation[localityID][agentName]['delivered'] + 1);
              } else if (state == 'R') {
                Vue.set(this.deliveryInformation[localityID][agentName], 'route', this.deliveryInformation[localityID][agentName]['route'] + 1);
              }
            } else {
              if (state == 'S'){
                this.sucursal += 1;
                Vue.set(this.deliveryInformation[localityID], 'Sin mensajero asignado', this.deliveryInformation[localityID]['Sin mensajero asignado'] + 1);
              }
            }
            if (state == 'C' || state == 'S' || state == 'R'){
              this.timeInformation.push
              ({
                'timeInSeconds': Math.round((new Date() - new Date(information.whatsappInvoiceCentralDateTime))/1000),
                'clientName': information.whatsappConversationRecipientProfileName,
                'clientPhoneNumber': information.whatsappConversationRecipientPhoneNumber
              });
            }
            
          }
          this.openMap = true;

        } else {
          this.showNotification('danger', 'Error al generar el comentario', 'Ha ocurrido un error inesperado al generar el comentario. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch((e) =>{
        console.log(e)
        this.showNotification('danger', 'Error al generar el comentario', 'Ha ocurrido un error inesperado al generar el comentario. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    }
  },

  mounted(){
    this.selectTodayDeliveryInformation();
    this.selectMensajerosDisponibles();
    this.queryInterval = setInterval(() => {
      this.selectTodayDeliveryInformation();
      this.selectMensajerosDisponibles();

    }, 6000);

    this.timeInterval = setInterval(() => {
      for (var time in this.timeInformation){
        const timer = this.timeInformation[time];
        timer.timeInSeconds += 1;
      }
      this.timeInformation.sort((a, b) => b.timeInSeconds - a.timeInSeconds);
    }, 1000);
  },

  beforeDestroy(){
    clearInterval(this.queryInterval);
    clearInterval(this.timeInterval);
  }
};
</script>

<style></style>
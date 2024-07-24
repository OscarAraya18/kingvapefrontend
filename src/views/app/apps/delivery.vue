<template>
  <div class="main-content">
    <div style="display: flex;">
      <div style="width: 50%;">
        <b-card style="width: 100%; background-color: #fed330;">
          <h2 style="margin-top: 5px; margin-bottom: 20px;"><strong>ZAPOTE:</strong></h2>
          <div v-for="(agent, key) in deliveryInformation['1']" :key="key" style="margin-top: 5px; margin-bottom: 5px;">
            <p v-if="key == 'Sin mensajero asignado'" style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key }}</strong>: {{ agent }}</p>
            <div v-else style="display: flex;">
              <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>{{ key }}</strong>:</p>
              <b-badge style="cursor: pointer; margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">{{ agent.route }}</b-badge>
              <b-badge style="cursor: pointer; margin-left:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">{{ agent.delivered }}</b-badge>
            </div>
          </div>
        </b-card>
        <br>
        <b-card style="width: 100%; background-color: #db67a3;">
          <h2 style="margin-top: 5px; margin-bottom: 20px;"><strong>ESCAZÚ:</strong></h2>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
        </b-card>
        <br>
        <b-card style="width: 100%; background-color: #a78dcc;">
          <h2 style="margin-top: 5px; margin-bottom: 20px;"><strong>HEREDIA:</strong></h2>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
        </b-card>
        <br>
        <b-card style="width: 100%; background-color: #55b5ab;">
          <h2 style="margin-top: 5px; margin-bottom: 20px;"><strong>CARTAGO:</strong></h2>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
          <p style="font-size: large; margin-top: 5px; margin-bottom: 5px;"><strong>Motorizado 2:</strong> 2</p>
        </b-card>
      </div>
    </div>
    
    <div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 
import Vue from 'vue';


export default {
  data() {
    return {
      deliveryInformation: {}
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

    selectTodayDeliveryInformation(){
      axios.post(constants.routes.backendAPI+'/selectTodayDeliveryInformation').then((response) =>{
        if (response.data.success){
          const informationList = response.data.result;
          for (var index in informationList){
            const information = informationList[index];
            const localityID = information.whatsappInvoiceLocalityID;
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
                Vue.set(this.deliveryInformation[localityID], 'Sin mensajero asignado', this.deliveryInformation[localityID]['Sin mensajero asignado'] + 1);
              }
            }
            

          }
          console.log(this.deliveryInformation);
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
  }
};
</script>

<style></style>
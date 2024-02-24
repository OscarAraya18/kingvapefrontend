<template>
  <div class="main-content">
    <b-form-input v-model="transferPhoneNumber" class="mb-3" placeholder="Número de teléfono"></b-form-input>
    <b-form-input v-model="transferName" class="mb-3" placeholder="Nombre"></b-form-input>
    <b-form-select v-model="transferID" class="mb-3" :options="transferIDOptions"></b-form-select>
    <b-form-input v-model="transferOrder" class="mb-3" placeholder="Pedido"></b-form-input>
    <br>
    <button v-if="loading==false" class="btn mb-3" @click="insertStoreMessage()">Transferir al call center</button>
    <div v-else>
      <span class="spinner-glow spinner-glow-primary"></span>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:kingvapebackend2.onrender.com');


export default {
  data() {
    return {
      transferIDOptions: [{value: 'S', text: 'S'}, {value: 'N', text: 'N'}],
      transferPhoneNumber: '',
      transferName: '',
      transferID: '',
      transferOrder: '',
      loading: false
    };
  },

  mounted(){
    
    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);
        const websocketMessageID = websocketMessageJSON.websocketMessageID;
        const websocketMessageContent = websocketMessageJSON.websocketMessageContent.result;

        if (websocketMessageID == '/agent/update/agentStatus'){
          for (var agentIndex in this.agents){
            if (this.agents[agentIndex].id == websocketMessageContent.agentID){
              var status = '';
              if (websocketMessageContent.agentStatus == 'online'){
                status = 'ONLINE';
              } else {
                status = 'OFFLINE';
              }
              this.agents[agentIndex].status = status;
            }
          }
        }
      }
    } catch {
  
    }
  },

  methods: {
    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    insertStoreMessage(){
      this.loading = true;
      var storeMessageStoreName = '';
      if (localStorage.getItem('localityName') == 'King Vape Escazú'){
        storeMessageStoreName = 'Escazu';
      } else if (localStorage.getItem('localityName') == 'King Vape Cartago'){
        storeMessageStoreName = 'Cartago';
      }
      axios.post(constants.routes.backendAPI+'/insertStoreMessage', {
        storeMessageStoreName: storeMessageStoreName,
        storeMessageRecipientPhoneNumber: this.transferPhoneNumber,
        storeMessageRecipientProfileName: this.transferName,
        storeMessageRecipientOrder: this.transferOrder,
        storeMessageRecipientID: this.transferID
      }).then((response) =>{
        if (response.data.success){
          this.loading = false;
          this.showNotification('success', 'Conversación transferida', 'La conversación se ha transferido exitosamente al call center.')

        } else {
          this.loading = false;
          this.showNotification('danger', 'Error al transferir la conversación', 'Ha ocurrido un error inesperado al transferir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        console.log(error);
        this.loading = false;
        this.showNotification('danger', 'Error al transferir la conversación', 'Ha ocurrido un error inesperado al transferir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    }

  },
};
</script>

<style></style>
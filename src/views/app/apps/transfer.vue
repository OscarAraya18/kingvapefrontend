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


    <br><br>

    <vue-good-table
      :columns="transferColumns"
      :rows="transferRows"
      styleClass="order-table vgt-table"
      :line-numbers="false">
      <template slot="table-row" slot-scope="props">
        <div v-if="props.column.field == 'storeMessageAssignedAgentID'">
          <div v-if="props.row.agentName == null">
            <span class="badge badge-pill badge-danger p-2">Sin agente asignado</span>
          </div>
          <div v-else>
            <span class="badge badge-pill badge-success p-2">Atendido por {{ props.row.agentName }}</span>
          </div>
        </div>
      </template>
    </vue-good-table>

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
      loading: false,

      transferRows: [],
      transferColumns: [
        {
          label: "ID del mensaje",
          field: "storeMessageID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Estado",
          field: "storeMessageAssignedAgentID",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Número de teléfono",
          field: "storeMessageRecipientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre",
          field: "storeMessageRecipientProfileName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Pedido",
          field: "storeMessageRecipientOrder",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cédula",
          field: "storeMessageRecipientID",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ]

    };

  },

  mounted(){
    this.selectStoreMessageByStoreMessageStoreName();
    setInterval(() => {
      this.selectStoreMessageByStoreMessageStoreName();
    }, 5000);
  },

  methods: {
    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    selectStoreMessageByStoreMessageStoreName(){
      var storeMessageStoreName = '';
      if (localStorage.getItem('agentType') == 'admin'){
        storeMessageStoreName = '';
      } else {
        if (localStorage.getItem('localityName') == 'King Vape Escazú'){
          storeMessageStoreName = 'Escazu';
        } else if (localStorage.getItem('localityName') == 'King Vape Cartago'){
          storeMessageStoreName = 'Cartago';
        }
      }
      
      axios.post(constants.routes.backendAPI+'/selectStoreMessageByStoreMessageStoreName', {
        storeMessageStoreName: storeMessageStoreName
      }).then((response) =>{
        console.log(this.transferRows);

        if (response.data.success){
          this.transferRows = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar los mensajes', 'Ha ocurrido un error inesperado al consultar los mensajes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((e) => {
        console.log(e);
        this.showNotification('danger', 'Error al consultar los mensajes', 'Ha ocurrido un error inesperado al consultar los mensajes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    insertStoreMessage(){
      
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.transferPhoneNumber) 
      && regularExpressionChecker.test(this.transferName)
      && regularExpressionChecker.test(this.transferOrder)){

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
        .catch(() => {
          this.loading = false;
          this.showNotification('danger', 'Error al transferir la conversación', 'Ha ocurrido un error inesperado al transferir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
        
      } else {
        this.loading = false;
        this.showNotification('danger', 'Error al transferir la conversación', 'Complete todos los espacios requeridos e intente de nuevo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      }
    }

  },
};
</script>

<style></style>
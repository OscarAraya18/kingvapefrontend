<template>
  <div class="main-content">
    <b-card>
      <b-form-input @keydown.enter="selectContact()" v-model="transferPhoneNumber" class="mb-3" placeholder="Número de teléfono"></b-form-input>
      <b-form-input v-model="transferName" class="mb-3" placeholder="Nombre (por defecto Sin registro)"></b-form-input>
      <b-form-select v-model="transferID" class="mb-3" :options="transferIDOptions"></b-form-select>
      <b-form-textarea v-model="transferOrder" class="mb-3" rows="3" placeholder="Pedido (por defecto No indica)"></b-form-textarea>
      <b-form-select v-if="isAdmin" v-model="transferLocality" class="mb-3" :options="transferLocalityOptions"></b-form-select>
      <b-form-select v-if="isZapote" v-model="transferZapoteLocality" class="mb-3" :options="transferZapoteLocalityOptions"></b-form-select>

      <br>
      <button v-if="loading==false" class="btn btn-info" @click="insertStoreMessage()">Transferir al call center</button>
      <div v-else>
        <span class="spinner-glow spinner-glow-primary"></span>
      </div>
    </b-card>


    <br><br>

    <b-card>
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
              <div v-if="props.row.storeMessageDeleteReason == null">
                <span class="badge badge-pill badge-success p-2">Atendido por {{ props.row.agentName }}</span>
              </div>
              <div v-else>
                <span class="badge badge-pill badge-warning p-2">Eliminado por {{ props.row.agentName }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="props.column.field == 'storeMessageStartDateTime'">
            {{ parseHour(props.row.storeMessageStartDateTime) }}
          </div>

          <div v-else-if="props.column.field == 'storeMessageRecipientPhoneNumber'">
            {{ parsePhone(props.row.storeMessageRecipientPhoneNumber) }}
          </div>

          <div v-else-if="props.column.field == 'storeMessageDeleteReason'">
            <div v-if="props.row.storeMessageDeleteReason == null">
              <div v-if="props.row.agentName == null">
                Esperando agente
              </div>
              <div v-else>
                Atendido
              </div>
            </div>
            <div v-else>
              {{props.row.storeMessageDeleteReason}}
            </div>
          </div>
          <div v-else-if="props.column.field == 'storeMessageRecipientID'">
            <div v-if="props.row.storeMessageRecipientID == 'S'">
              ✔️
            </div>
            <div v-else>
              ❌
            </div>
          </div>
        </template>
      </vue-good-table>
    </b-card>

    <br><br>

  </div>
</template>

<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:payitcr.com');


export default {
  data() {
    return {
      isZapote: false,
      isAdmin: false,



      transferIDOptions: [{value: 'S', text: '✔️'}, {value: 'N', text: '❌'}],
      transferLocalityOptions: [{value: 'Escazu', text: 'King Vape Escazú'}, {value: 'Cartago', text: 'King Vape Cartago'}, {value: 'Zapote', text: 'King Vape Zapote'}, {value: 'Heredia', text: 'King Vape Heredia'}, {value: 'Planet Vape', text: 'Planet Vape'}],

      transferZapoteLocalityOptions: [{value: 'Zapote', text: 'King Vape Zapote'}, {value: 'Heredia', text: 'King Vape Heredia'}],

      transferZapoteLocality: 'Zapote',

      transferPhoneNumber: '506',
      transferName: '',
      transferID: 'S',
      transferOrder: '',
      transferLocality: '',
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
        },
        {
          label: "Hora",
          field: "storeMessageStartDateTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Localidad",
          field: "storeMessageStoreName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nota",
          field: "storeMessageDeleteReason",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      queryInterval: null,

      backendURL: 'https://payitcr.com',
      errorCount: 0

    };

  },

  mounted(){
    if (localStorage.getItem('localityName') == 'King Vape Zapote'){
      this.isZapote = true;
    } else {
      this.isZapote = false;
    }
    if (localStorage.getItem('agentType') == 'admin' || localStorage.getItem('agentName') == 'Diana Jimenez' || localStorage.getItem('agentName') == 'Jose Estrada' || localStorage.getItem('agentName') == 'Emma Garcia'){
      this.isAdmin = true;
    }
    this.selectStoreMessageByStoreMessageStoreName();
    this.queryInterval = setInterval(() => {
      this.selectStoreMessageByStoreMessageStoreName();
    }, 7000);
  },

  methods: {
    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    parseHour(originalHour){
      const parsingDate = new Date(originalHour);
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      var formattedDate = parsingDate.toLocaleString('en-GB', options);
      if (formattedDate.slice(-2) == 'am'){
        formattedDate = formattedDate.slice(0,-2) + 'AM'
      } else if (formattedDate.slice(-2) == 'pm') {
        formattedDate = formattedDate.slice(0,-2) + 'PM'
      }
      return formattedDate;
    },

    parsePhone(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
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
        } else if (localStorage.getItem('localityName') == 'King Vape Zapote'){
          storeMessageStoreName = 'Zapote';
        } else if (localStorage.getItem('localityName') == 'King Vape Heredia'){
          storeMessageStoreName = 'Heredia';
        } else if (localStorage.getItem('localityName') == 'King Vape Metro Plaza'){
          storeMessageStoreName = 'Metro Plaza';
        } else if (localStorage.getItem('localityName') == 'King Vape San Rafael'){
          storeMessageStoreName = 'San Rafael';
        } else if (localStorage.getItem('localityName') == 'King Vape CC del Sur'){
          storeMessageStoreName = 'CC del Sur';
        } else if (localStorage.getItem('localityName') == 'King Vape Tres Rios'){
          storeMessageStoreName = 'Tres Rios';
        }
      }
      
      axios.post(this.backendURL+'/selectStoreMessageByStoreMessageStoreName', {
        storeMessageStoreName: storeMessageStoreName
      }).then((response) =>{

        if (response.data.success){
          this.errorCount = 0;
          this.transferRows = response.data.result;
        } else {
          this.errorCount = this.errorCount + 1;
          if (this.errorCount >= 3){
            this.showNotification('danger', 'Error al consultar los mensajes', 'Ha ocurrido un error inesperado al consultar los mensajes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        }
      })
      .catch((e) => {
        this.errorCount = this.errorCount + 1;
        if (this.errorCount >= 3){
          this.showNotification('danger', 'Error al consultar los mensajes', 'Ha ocurrido un error inesperado al consultar los mensajes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
    },

    insertStoreMessage(){
      
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.transferPhoneNumber)){

        this.transferPhoneNumber = this.transferPhoneNumber.replace(' ', '');
        this.transferPhoneNumber = this.transferPhoneNumber.replace('(', '');
        this.transferPhoneNumber = this.transferPhoneNumber.replace(')', '');
        this.transferPhoneNumber = this.transferPhoneNumber.replace('+', '');


        if (this.transferName == ''){
          this.transferName = 'Sin registro';
        }

        if (this.transferOrder == ''){
          this.transferOrder = 'No indica';
        }

        if (this.transferID != ''){
          this.loading = true;
          var storeMessageStoreName = '';

          if (localStorage.getItem('localityName') == 'King Vape Escazú'){
            storeMessageStoreName = 'Escazu';
          } else if (localStorage.getItem('localityName') == 'King Vape Cartago'){
            storeMessageStoreName = 'Cartago';
          } else if (localStorage.getItem('localityName') == 'King Vape Zapote'){
            storeMessageStoreName = this.transferZapoteLocality;
          } else if (localStorage.getItem('localityName') == 'King Vape Heredia'){
            storeMessageStoreName = 'Heredia';
          } else if (localStorage.getItem('localityName') == 'King Vape Metro Plaza'){
            storeMessageStoreName = 'Metro Plaza';
          } else if (localStorage.getItem('localityName') == 'King Vape San Rafael'){
            storeMessageStoreName = 'San Rafael';
          } else if (localStorage.getItem('localityName') == 'King Vape CC del Sur'){
            storeMessageStoreName = 'CC del Sur';
          } else if (localStorage.getItem('localityName') == 'King Vape Tres Rios'){
            storeMessageStoreName = 'Tres Rios';
          } else {
            storeMessageStoreName = this.transferLocality;
          }
          
          axios.post(constants.routes.backendAPI+'/insertStoreMessage', {
            storeMessageStoreName: storeMessageStoreName,
            storeMessageRecipientPhoneNumber: this.transferPhoneNumber,
            storeMessageRecipientProfileName: this.transferName,
            storeMessageRecipientOrder: this.transferOrder,
            storeMessageRecipientID: this.transferID
          }).then((response) =>{
            if (response.data.success){
              this.transferPhoneNumber = '506';
              this.transferName = '';
              this.transferID = 'S';
              this.transferOrder = '';
              this.transferLocality = '';
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
      } else {
        this.loading = false;
        this.showNotification('danger', 'Error al transferir la conversación', 'Complete todos los espacios requeridos e intente de nuevo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      }
    }
  },

  beforeDestroy(){
    clearInterval(this.queryInterval);
  }

};
</script>

<style></style>
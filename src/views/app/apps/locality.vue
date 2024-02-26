<template>
  <div>

    <b-modal scrollable size="m" centered id="transactionMessageModal" hide-header hide-footer>
      <div v-if="loaders.transactionMessage == false && transactionMessage != null">
        <p v-if="transactionMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{transactionMessage.whatsappTextMessageBody}}</p>
        <div v-if="transactionMessage.whatsappGeneralMessageType == 'image'"> 
          <img style="width: 250px;" :src="`data:image/png;base64,${transactionMessage.whatsappImageMessageFile}`">
          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="transactionMessage.whatsappImageMessageCaption != null">{{transactionMessage.whatsappImageMessageCaption}}</p>
        </div>
        <div v-if="transactionMessage.whatsappGeneralMessageType=='document'" class="m-0">
          <a style="color: black;" :href="`data:${transactionMessage.whatsappDocumentMessageMimeType};base64,${transactionMessage.whatsappDocumentMessageFile}`" :download="transactionMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{transactionMessage.whatsappDocumentMessageFileName}}</strong></p></a>
        </div>
      </div>
      <div v-else style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
    </b-modal>

    <b-modal hide-footer hide-header scrollable size="lg" centered id="openClosePaymentMethod">
      <div v-if="loader == true" style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
      <div v-if="isAdmin">
        <div style="width: 100%;">
          <h5><strong>Filtro por fecha inicial:</strong></h5>
          <b-form-datepicker v-model="initialDateOptionClose"></b-form-datepicker>
        </div>
        <br>
        <div style="width: 100%;">
          <h5><strong>Filtro por fecha final:</strong></h5>
          <b-form-datepicker v-model="endDateOptionClose"></b-form-datepicker>
        </div>
        <br>
        <div style="width: 100%;">
          <h5><strong>Filtro por localidad:</strong></h5>
          <div style="border: 1px solid rgb(140, 140, 140); border-radius: 5px; height: 100px; overflow-y: auto; padding-top: 10px; padding-bottom: 10px;">
            <div v-for="locality in localitiesOptions">
              <input @click="changeLocalityOptions(locality)" type="checkbox" v-model="locality.selected" style="accent-color: #FFD733; margin-left:10px; margin-right: 10px;">
              {{ locality.localityName }}
            </div>
          </div>
        </div>
        <br>
        <div style="width: 100%;">
          <h5><strong>Filtro por agente:</strong></h5>
          <div style="border: 1px solid rgb(140, 140, 140); border-radius: 5px; height: 180px; overflow-y: auto; padding-top: 10px; padding-bottom: 10px;">
            <div v-for="agent in agentOptions">
              <div v-if="agent.visible">
                <input type="checkbox" v-model="agent.selected" style="accent-color: #FFD733; margin-left:10px; margin-right: 10px;">
                {{ agent.agentName }}
              </div>
            </div>
          </div>
        </div>
        <br>
        <div style="width: 100%; display: flex;">
          <button class="btn btn-icon btn-info" style="margin-right:1%; width: 49%; font-size: 15px;" @click="generateInvoice()"><i class="i-Search-People"></i>Generar factura</button>
          <button class="btn btn-icon" style="margin-left:1%; width: 49%; background-color: rgb(255, 184, 32); font-size: 15px;" @click="cleanFilterClose()"><i class="i-Folder-Trash"></i>Limpiar filtros</button>
        </div>
      </div>
      
      <div v-else>
        <b-form-input v-model="passwordInput" placeholder="Contraseña de administrador"></b-form-input>
        <br>
        <div style="text-align: center;">
          <button class="btn btn-info" style="width: 50%; font-size: 15px;" @click="generateTodayInvoice()">Generar cierre</button>
        </div>
      </div>
    
    </b-modal>


    <div v-if="agentType == 'agent'">
      <h4><strong>Transacciones a validar:</strong></h4>
      <br>
    </div>

    <div class="card mb-30">
      <div class="card-body p-0">
        <vue-good-table
          :columns="transactionsColumns"
          :line-numbers="false"
          styleClass="order-table vgt-table"
          :rows="notUsedTransactions">
          <template slot="table-row" slot-scope="props">
            <div v-if="props.column.field == 'transactionApprover'">
              <div v-if="agentType == 'locality'">
                <b-form-select @change="selectTransactionApprover(props.row.transactionID, props.row.transactionApproverLocalityAgentID)" v-model="props.row.transactionApproverLocalityAgentID" class="mb-1" :options="approverOptions"></b-form-select>
              </div>
              <div v-else>
                {{ agentName }}
              </div>
            </div>
            <div v-else-if="props.column.field == 'transactionAction'" style="text-align: right;">
              <button class="btn btn-primary text-black btn-rounded" @click="validateTransaction(props.row)">Validar</button>
            </div>
            <div v-else-if="props.column.field == 'transactionStore'">
              <div v-if="agentType == 'locality'">
                {{ localityName }}
              </div>
              <div v-else>
                <b-form-select @change="selectTransactionStore(props.row.transactionID, props.row.transactionStoreLocalityID)" v-model="props.row.transactionStoreLocalityID" class="mb-1" :options="localitiesOptions"></b-form-select>
              </div>
            </div>

            <div v-else-if="props.column.field == 'transactionSystemDate'" >
              {{ parseDateTime(props.row.transactionSystemDate) }}
            </div>

          </template>
        </vue-good-table>

      </div>
    </div>

    <button class="btn btn-info" style="width: 100%; font-size: 15px;" @click="openInvoiceModal()" v-b-modal.openClosePaymentMethod>Cierre</button>


    <div v-if="agentType == 'agent'">
      <br><br><br><br>
      <h4><strong>Transacciones previas:</strong></h4>
      <br>
      <div style="display: flex;">
        <div style="width: 40%; margin-right: 2%;">
          <h5><strong>Fecha inicial:</strong></h5>
          <b-form-datepicker v-model="initialDateOption"></b-form-datepicker>
        </div>
        <div style="width: 45%;">
          <h5><strong>Fecha final:</strong></h5>
          <b-form-datepicker v-model="endDateOption"></b-form-datepicker>
        </div>
        <div>
          <button class="btn btn-icon" style="width: 100%; background-color: #F9E530; font-size: 15px; margin-left: 30px;" @click="filter()"><i class="i-Search-People"></i>Aplicar filtro</button>
          <br><br>
          <button class="btn btn-icon" style="width: 100%; background-color: rgb(255, 184, 32); font-size: 15px; margin-left: 30px;" @click="cleanFilter()"><i class="i-Folder-Trash"></i>Limpiar filtros</button>
        </div>
      </div>
      <br><br>

      <div class="card mb-30">
        <div class="card-body p-0">
          <vue-good-table
            :columns="usedTransactionColumns"
            :line-numbers="false"
            styleClass="order-table vgt-table"
            :rows="usedTransactions">
            <template slot="table-row" slot-scope="props">
              <div v-if="props.column.field == 'transactionAction'" style="text-align: right;">
                <button class="btn btn-danger text-black btn-rounded" @click="reverseTransaction(props.row)">Reversar</button>
              </div>
              <div v-else-if="props.column.field == 'transactionRelatedMessageID'" style="text-align: right;">
                <div v-if="props.row.transactionRelatedMessageID == null">
                  <button class="btn btn-gray text-black btn-rounded" style="cursor: no-drop">No disponible</button>
                </div>
                <div v-else> 
                  <button v-b-modal.transactionMessageModal @click="selectTransactionMessage(props.row.transactionRelatedMessageID)" class="btn btn-info text-black btn-rounded">Abrir</button>
                </div>
              </div>
              <div v-else-if="props.column.field == 'agentName'">
                <div v-if="props.row.agentName != null">
                  {{ props.row.agentName }}
                </div>
                <div v-else>
                  {{ props.row.localityAgentName }}
                </div>
              </div>
              
            </template>
          </vue-good-table>
        </div>
      </div>

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
      loaders:
      {
        transactionMessage: false
      },

      filtering: false,

      agentType: '',
      agentName: '',
      localityName: '',

      transactionsColumns: [
        {
          label: "Número de referencia",
          field: "transactionID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Descripción",
          field: "transactionNote",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cantidad",
          field: "transactionAmount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha del banco",
          field: "transactionDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha del sistema",
          field: "transactionSystemDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Tiempo transcurrido",
          field: "transactionTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Aprovado por",
          field: "transactionApprover",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Localidad",
          field: "transactionStore",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "",
          field: "transactionAction",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      notUsedTransactions: [],
      selectedApprover: '',
      approverOptions: [],
      localitiesOptions: [],
      selectedTransactionApprovers: {},
      selectedTransactionStores: {},


      usedTransactionColumns: [
        {
          label: "Número de referencia",
          field: "transactionID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Descripción",
          field: "transactionNote",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cantidad",
          field: "transactionAmount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha del banco",
          field: "transactionDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha del sistema",
          field: "transactionSystemDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Aprovado por",
          field: "agentName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Localidad",
          field: "localityName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de aprobación",
          field: "transactionApprovedDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Mensaje relacionado",
          field: "transactionRelatedMessageID",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "",
          field: "transactionAction",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],
      
      usedTransactions: [],

      
      initialDateOption: '',
      endDateOption: '',


      isAdmin: '',
      localitiesOptions: [],
      agentOptions: [],

      initialDateOptionClose: '',
      endDateOptionClose: '',
      passwordInput: ''


    };
  },

  methods: {
    filter(){
      this.filtering = true;
      axios.post(constants.routes.backendAPI+'/selectUsedTransactions',
      {
        initialDate: this.initialDateOption,
        endDate: this.endDateOption
      })
      .then((response) =>{
        if (response.data.success){
          this.usedTransactions = response.data.result;
          this.usedTransactions = this.usedTransactions.map(transaction => {
            return {
              ...transaction,
              transactionApproverLocalityAgentID: this.getSelectedTransactionApprover(transaction.transactionID),
              transactionDate: this.parseDate(transaction.transactionDate),
              transactionApprovedDate: this.parseDateTime(transaction.transactionApprovedDate),
              transactionSystemDate: this.parseDateTime(transaction.transactionSystemDate),
              transactionAmount: `₡ ${parseFloat(transaction.transactionAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`
            };
          });
        } else {
          this.showNotification('danger', 'Error al consultar las transacciones previas', 'Ha ocurrido un error inesperado al consultar las transacciones previas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las transacciones previas', 'Ha ocurrido un error inesperado al consultar las transacciones previas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectTransactionMessage(whatsappGeneralMessageID){
      this.loaders.transactionMessage = true;
      axios.post(constants.routes.backendAPI+'/selectWhatsappGeneralMessage', 
      {
        whatsappGeneralMessageID: whatsappGeneralMessageID
      })
      .then((response) => {
        if (response.data.success){
          this.transactionMessage = response.data.result;
          this.loaders.transactionMessage = false;
        } else {
          this.loaders.transactionMessage = false;
          this.showNotification('danger', 'Error al abrir el mensaje de la transacción', 'Ha ocurrido un error inesperado al abrir el mensaje de la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al abrir el mensaje de la transacción', 'Ha ocurrido un error inesperado al abrir el mensaje de la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    cleanFilter(){
      this.initialDateOption = '';
      this.endDateOption = '';
      this.filtering = false;
    },

    parseDate(originalHour){
      const parsingDate = new Date(originalHour);
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      var formattedDate = parsingDate.toLocaleString('en-GB', options).slice(0,-10);
      return formattedDate;
    },

    parseDateTime(originalHour){
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
      if (formattedDate.includes('00') && formattedDate.includes('PM')){
        formattedDate = formattedDate.replace('00', '12');
      }
      return formattedDate;
    },

    startTimer(){
      setInterval(() => {
        for (var transactionIndex in this.notUsedTransactions){
          this.notUsedTransactions[transactionIndex].transactionTime = this.getElapsedTime(this.notUsedTransactions[transactionIndex].transactionSystemDate);
        }
      }, 1000);
    },

    getElapsedTime(transactionSystemDate){
      const startDate = new Date(transactionSystemDate);

      const now = new Date();

      const timeDifference = now - startDate;

      const segundos = Math.floor(timeDifference / 1000) % 60;
      const minutos = Math.floor(timeDifference / (1000 * 60)) % 60;
      const horas = Math.floor(timeDifference / (1000 * 60 * 60)) % 24;
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

    },

    reverseTransaction(transaction){
      this.$swal({
        title: "Reversar transacción",
        html: 
        `
        Está a punto de reversar la transacción ${transaction.transactionID}<br>
        <strong>¿Desea continuar?</strong>
        `,
        showCancelButton: true,
        confirmButtonColor: "#1aad55",
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#d33",
        confirmButtonText: "Aceptar"
      }).then((result) => {
        if (result.isConfirmed == true){
          axios.post(constants.routes.backendAPI+'/reverseTransaction', 
          {
            transactionID: transaction.transactionID
          }).then((response) =>{
            if (response.data.success){
              if (this.selectedTransactionStores[transaction.transactionID]){
                delete this.selectedTransactionStores[transaction.transactionID];
              }
              if (this.filtering == true){
                this.filter();
              } else {
                this.selectUsedTransactions();
              }
              this.showNotification('success', 'Transacción reversada', 'Se ha reversado exitosamente la transacción.')
            } else {
              this.showNotification('danger', 'Error al reversar la transacción', 'Ha ocurrido un error inesperado al reversar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
            }
          }).catch(() => {
            this.showNotification('danger', 'Error al reversar la transacción', 'Ha ocurrido un error inesperado al reversar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          })
        }
      });
    },

    validateTransaction(transaction){
      if (this.agentType == 'locality'){
        if (transaction.transactionApproverLocalityAgentID != 0){
          this.$swal({
            title: "Transacción a validar",
            html: 
            `
            <strong>Número de referencia: </strong> ${transaction.transactionID} <br>
            <strong>Descripción: </strong> ${transaction.transactionNote} <br>
            <strong>Monto: </strong> ${transaction.transactionAmount} <br>
            <strong>Fecha: </strong> ${transaction.transactionDate} <br><br>
            <strong>Aprovado por: </strong> ${this.approverOptions.find(option => option.value === transaction.transactionApproverLocalityAgentID).text} <br>
            <strong>Localidad: </strong> ${this.localityName}
            `,
            showCancelButton: true,
            confirmButtonColor: "#1aad55",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#d33",
            confirmButtonText: "Aceptar"
          }).then((result) => {
            if (result.isConfirmed == true){
              axios.post(constants.routes.backendAPI+'/syncTransaction', 
              {
                transactionID: transaction.transactionID,
                transactionStore: localStorage.getItem('localityID'),
                transactionApprover: transaction.transactionApproverLocalityAgentID,
                transactionRelatedMessageID: null
              }).then((response) =>{
                if (response.data.success){
                  if (this.selectedTransactionApprovers[transaction.transactionID]){
                    delete this.selectedTransactionApprovers[transaction.transactionID];
                  }
                  this.selectNotUsedTransactions();
                  this.showNotification('success', 'Transacción validada', 'Se ha validado exitosamente la transacción.')
                } else {
                  this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
                }
              }).catch(() => {
                this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
              })
            }
          });
        } else {
          this.showNotification('danger', 'Error al validar transacción', 'Debe seleccionar el nombre de quien aprueba la transacción. Seleccione un nombre e intentelo de nuevo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }

      } else {

        if (transaction.transactionStoreLocalityID != 0){
          this.$swal({
            title: "Transacción a validar",
            html: 
            `
            <strong>Número de referencia: </strong> ${transaction.transactionID} <br>
            <strong>Descripción: </strong> ${transaction.transactionNote} <br>
            <strong>Monto: </strong> ${transaction.transactionAmount} <br>
            <strong>Fecha: </strong> ${transaction.transactionDate} <br><br>
            <strong>Aprovado por: </strong> ${this.agentName} <br>
            <strong>Localidad: </strong> ${this.localitiesOptions.find(option => option.value === transaction.transactionStoreLocalityID).text}
            `,
            showCancelButton: true,
            confirmButtonColor: "#1aad55",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#d33",
            confirmButtonText: "Aceptar"
          }).then((result) => {
            if (result.isConfirmed == true){
              axios.post(constants.routes.backendAPI+'/syncTransaction', 
              {
                transactionID: transaction.transactionID,
                transactionStore: transaction.transactionStoreLocalityID,
                transactionApprover: localStorage.getItem('agentID'),
                transactionRelatedMessageID: null
              })
              .then((response) =>{
                if (response.data.success){
                  this.selectNotUsedTransactions();
                  this.showNotification('success', 'Transacción validada', 'Se ha validado exitosamente la transacción.')
                } else {
                  this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
                }
              })
              .catch(() => {
                this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
              })
            }
          });
        } else {
          this.showNotification('danger', 'Error al validar transacción', 'Debe seleccionar el nombre de la sucursal de la transacción. Seleccione un nombre e intentelo de nuevo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }

      }
    },

    selectTransactionApprover(transactionID, transactionApproverLocalityAgentID){
      this.selectedTransactionApprovers[transactionID] = transactionApproverLocalityAgentID;
    },

    selectTransactionStore(transactionID, transactionStoreLocalityID){
      this.selectedTransactionStores[transactionID] = transactionStoreLocalityID;
    },

    getSelectedTransactionApprover(transactionID){
      if (transactionID in this.selectedTransactionApprovers){
        return this.selectedTransactionApprovers[transactionID];
      }
    },

    getSelectedTransactionStore(transactionID){
      if (transactionID in this.selectedTransactionStores){
        return this.selectedTransactionStores[transactionID];
      }
    },

    selectNotUsedTransactions(){
      axios.post(constants.routes.backendAPI+'/selectNotUsedTransactions')
      .then((response) =>{
        if (response.data.success){
          this.notUsedTransactions = response.data.result;
          this.notUsedTransactions = this.notUsedTransactions.map(transaction => {
            return {
              ...transaction,
              transactionApproverLocalityAgentID: this.getSelectedTransactionApprover(transaction.transactionID),
              transactionStoreLocalityID: this.getSelectedTransactionStore(transaction.transactionID),
              transactionTime: this.getElapsedTime(transaction.transactionSystemDate),
              transactionDate: this.parseDate(transaction.transactionDate),
              transactionSystemDate: transaction.transactionSystemDate,
              transactionAmount: `₡ ${parseFloat(transaction.transactionAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`
            };
          });
        } else {
          this.showNotification('danger', 'Error al consultar las transacciones a validar', 'Ha ocurrido un error inesperado al consultar las transacciones a validar. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((e) => {
        console.log(e);
        this.showNotification('danger', 'Error al consultar las transacciones a validar', 'Ha ocurrido un error inesperado al consultar las transacciones a validar. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectUsedTransactions(){
      axios.post(constants.routes.backendAPI+'/selectUsedTransactions',
      {
        initialDate: '',
        endDate: ''
      })
      .then((response) =>{
        if (response.data.success){
          this.usedTransactions = response.data.result;
          this.usedTransactions = this.usedTransactions.map(transaction => {
            return {
              ...transaction,
              transactionApproverLocalityAgentID: this.getSelectedTransactionApprover(transaction.transactionID),
              transactionDate: this.parseDate(transaction.transactionDate),
              transactionApprovedDate: this.parseDateTime(transaction.transactionApprovedDate),
              transactionSystemDate: this.parseDateTime(transaction.transactionSystemDate),
              transactionAmount: `₡ ${parseFloat(transaction.transactionAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`
            };
          });
        } else {
          this.showNotification('danger', 'Error al consultar las transacciones previas', 'Ha ocurrido un error inesperado al consultar las transacciones previas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((e) => {
        console.log(e);
        this.showNotification('danger', 'Error al consultar las transacciones previas', 'Ha ocurrido un error inesperado al consultar las transacciones previas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectLocalityAgents(){
      axios.post(constants.routes.backendAPI+'/selectLocalityAgents', 
      {
        localityAgentLocalityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          for (var localityAgentIndex in response.data.result){
            const localityAgentID = response.data.result[localityAgentIndex].localityAgentID;
            const localityAgentName = response.data.result[localityAgentIndex].localityAgentName;
            this.approverOptions.push({value: localityAgentID, text: localityAgentName});
          }
        } else {
          this.showNotification('danger', 'Error al consultar los agentes de la localidad', 'Ha ocurrido un error inesperado al consultar los agentes de la localidad. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar los agentes de la localidad', 'Ha ocurrido un error inesperado al consultar los agentes de la localidad. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectLocalities(){
      axios.post(constants.routes.backendAPI+'/selectLocalities')
      .then((response) =>{
        if (response.data.success){
          for (var localityIndex in response.data.result){
            const localityID = response.data.result[localityIndex].localityID;
            const localityName = response.data.result[localityIndex].localityName;
            this.localitiesOptions.push({value: localityID, text: localityName});
          }
        } else {
          this.showNotification('danger', 'Error al consultar las localidades', 'Ha ocurrido un error inesperado al consultar las localidades. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las localidades', 'Ha ocurrido un error inesperado al consultar las localidades. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    cleanPassword(){
      this.passwordInput = '';
    },

    generateTodayInvoice(){
      if (localStorage.getItem('localityPassword') == this.passwordInput){
        axios.post(constants.routes.backendAPI+'/generateTodayInvoice', {
          localityID: localStorage.getItem('localityID')
        }).then((response) =>{
          if (response.data.success){
            alert('entro')
            const invoiceBase64 = response.data.result;
            const byteCharacters = atob(invoiceBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Reporte de transacciones.pdf';
            link.click();
          } else {
            this.showNotification('danger', 'Error al generar la factura', 'Ha ocurrido un error inesperado al generar la factura. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al generar la factura', 'Ha ocurrido un error inesperado al generar la factura. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
      } else {
        this.showNotification('danger', 'Contraseña de administrador incorrecta', 'Por favor coloque la contraseña correcta para generar el cierre. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      }
    },

    generateInvoice(){
      var localities = [];
      var agents = [];
      for (var localityIndex in this.localitiesOptions){
        if (this.localitiesOptions[localityIndex].selected){
          localities.push(this.localitiesOptions[localityIndex].localityID);
        }
      }
      for (var agentIndex in this.agentOptions){
        if (this.agentOptions[agentIndex].selected && this.agentOptions[agentIndex].visible){
          agents.push(this.agentOptions[agentIndex].agentID);
        }
      }
      axios.post(constants.routes.backendAPI+'/generateInvoice', {
        localities: localities,
        agents: agents,
        initialDate: this.initialDateOption,
        endDate: this.endDateOption
      }).then((response) =>{
        if (response.data.success){
          const invoiceBase64 = response.data.result;
          const byteCharacters = atob(invoiceBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'Reporte de transacciones.pdf';
          link.click();
        } else {
          this.showNotification('danger', 'Error al generar la factura', 'Ha ocurrido un error inesperado al generar la factura. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al generar la factura', 'Ha ocurrido un error inesperado al generar la factura. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    cleanFilterClose(){
      this.initialDateOptionClose = '';
      this.initialDateOptionClose = '';
      for (var agentIndex in this.agentOptions){
        this.agentOptions[agentIndex].visible = true;
        this.agentOptions[agentIndex].selected = true;
      }
      for (var localityIndex in this.localitiesOptions){
        this.localitiesOptions[localityIndex].selected = true;
      }
    },

    changeLocalityOptions(locality){
      for (var agentIndex in this.agentOptions){
        if (this.agentOptions[agentIndex].localityID == locality.localityID){
          this.agentOptions[agentIndex].visible = !this.agentOptions[agentIndex].visible;
        }
      }
    },

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    selectLocalityAgents(){
      axios.post(constants.routes.backendAPI+'/selectAllLocalityAgents').then((response) =>{
        if (response.data.success){
          this.agentOptions = [];
          for (var agentIndex in response.data.result){
            const agentID = response.data.result[agentIndex].agentID;
            const agentName = response.data.result[agentIndex].agentName;
            const localityID = response.data.result[agentIndex].localityID;
            this.agentOptions.push({agentID: agentID, agentName: agentName, localityID: localityID, selected: true, visible: true});
          }
        } else {
          this.showNotification('danger', 'Error al consultar los agentes', 'Ha ocurrido un error inesperado al consultar los agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar los agentes', 'Ha ocurrido un error inesperado al consultar los agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectLocalitiesClose(){
      axios.post(constants.routes.backendAPI+'/selectLocalities')
      .then((response) =>{
        if (response.data.success){
          this.localitiesOptions = [];
          for (var localityIndex in response.data.result){
            const localityID = response.data.result[localityIndex].localityID;
            const localityName = response.data.result[localityIndex].localityName;
            this.localitiesOptions.push({localityID: localityID, localityName: localityName, selected: true});
          }
        } else {
          this.showNotification('danger', 'Error al consultar las localidades', 'Ha ocurrido un error inesperado al consultar las localidades. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las localidades', 'Ha ocurrido un error inesperado al consultar las localidades. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    openInvoiceModal(){
      this.cleanFilterClose();
      this.selectLocalityAgents();
      this.selectLocalitiesClose();
    },


  },


  computed: {},

  mounted(){
    if (localStorage.getItem('locality') == 'yes'){
      this.agentType = 'locality';
      this.localityName = localStorage.getItem('localityName');
      this.selectLocalityAgents();
    } else {
      this.agentType = 'agent';
      this.agentName = localStorage.getItem('agentName');
      this.selectLocalities();
    }
    
    if (localStorage.getItem('agentType') == 'admin'){
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }
    
    this.selectNotUsedTransactions();
    this.selectUsedTransactions();
    setInterval(() => {
      this.selectNotUsedTransactions();
      if (this.filtering == false){
        this.selectUsedTransactions();
      }
    }, 10000);
    this.startTimer();
  },

  created: function() {}

};
</script>

<style>
  
</style>

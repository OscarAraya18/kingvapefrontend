<template>
  <div class="card mb-30">
    <div class="card-body p-0">
      <vue-good-table
        :columns="transactionsColumns"
        :line-numbers="false"
        styleClass="order-table vgt-table"
        :rows="notUsedTransactions"
      >
        <template slot="table-row" slot-scope="props">
          <div v-if="props.column.field == 'transactionApprover'">
            <b-form-select @change="selectTransactionApprover(props.row.transactionID, props.row.transactionApproverLocalityAgentID)" v-model="props.row.transactionApproverLocalityAgentID" class="mb-1" :options="approverOptions"></b-form-select>
          </div>

          <div v-else-if="props.column.field == 'transactionAction'" style="text-align: right;">
            <button class="btn btn-primary text-black btn-rounded" @click="validateTransaction(props.row)">Validar</button>
          </div>
        </template>
      </vue-good-table>
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
          label: "Fecha",
          field: "transactionDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "",
          field: "transactionApprover",
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

      selectedTransactionApprovers: {}

    };
  },

  methods: {
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
      var formattedDate = parsingDate.toLocaleString('en-GB', options).slice(0,-10);
      return formattedDate;
    },

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    validateTransaction(transaction){
      if (transaction.transactionApproverLocalityAgentID != 0){
        this.$swal({
          title: "Transacción a validar",
          html: 
          `
          <strong>Número de referencia: </strong> ${transaction.transactionID} <br>
          <strong>Descripción: </strong> ${transaction.transactionNote} <br>
          <strong>Monto: </strong> ${transaction.transactionAmount} <br>
          <strong>Fecha: </strong> ${transaction.transactionDate} <br><br>
          <strong>Aprovado por: </strong> ${this.approverOptions.find(option => option.value === transaction.transactionApproverLocalityAgentID).text}
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
              transactionStore: localStorage.getItem('localityName'),
              transactionApprover: transaction.transactionApproverLocalityAgentID,
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
            .catch((error) => {
              this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
            })
          }
        });
      } else {
        this.showNotification('danger', 'Error al validar transacción', 'Debe seleccionar el nombre de quien aprueba la transacción. Seleccione un nombre e intentelo de nuevo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      }
    },

    selectTransactionApprover(transactionID, transactionApproverLocalityAgentID){
      this.selectedTransactionApprovers[transactionID] = transactionApproverLocalityAgentID;
    },

    getSelectedTransactionApprover(transactionID){
      if (transactionID in this.selectedTransactionApprovers){
        return this.selectedTransactionApprovers[transactionID];
      }
      return 0;
    },

    selectNotUsedTransactions(){
      axios.post(constants.routes.backendAPI+'/selectNotUsedTransactions')
      .then((response) =>{
        console.log(response.data);
        if (response.data.success){
          this.notUsedTransactions = response.data.result;
          this.notUsedTransactions = this.notUsedTransactions.map(transaction => {
            return {
              ...transaction,
              transactionApproverLocalityAgentID: this.getSelectedTransactionApprover(transaction.transactionID),
              transactionDate: this.parseHour(transaction.transactionDate),
              transactionAmount: `₡ ${parseFloat(transaction.transactionAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`
            };
          });
        } else {
          this.showNotification('danger', 'Error al consultar las transacciones', 'Ha ocurrido un error inesperado al consultar las transacciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar las transacciones', 'Ha ocurrido un error inesperado al consultar las transacciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
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
          this.showNotification('danger', 'Error al consultar las transacciones', 'Ha ocurrido un error inesperado al consultar las transacciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar las transacciones', 'Ha ocurrido un error inesperado al consultar las transacciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },


  },


  computed: {

  },

  mounted(){
    this.selectNotUsedTransactions();
    this.selectLocalityAgents();
    setInterval(() => {
      this.selectNotUsedTransactions();
    }, 10000);
  },

  created: function() {
   
  },
};
</script>

<style>
  
</style>

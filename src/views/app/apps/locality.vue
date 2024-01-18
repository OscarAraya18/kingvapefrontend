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
            
          </div>

          <button v-else-if="props.column.field == 'transactionAction'" class="btn btn-outline-primary text-black btn-rounded" @click="whatsappConversationOpenAction(props.row.whatsappConversationID)">Validar</button>
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


      notUsedTransactions: []

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

    selectNotUsedTransactions(){
      axios.post(constants.routes.backendAPI+'/selectNotUsedTransactions')
      .then((response) =>{
        if (response.data.success){
          this.notUsedTransactions = response.data.result;
          this.notUsedTransactions = this.notUsedTransactions.map(transaction => {
            return {
              ...transaction,
              transactionDate: this.parseHour(transaction.transactionDate),
              transactionAmount: `₡ ${parseFloat(transaction.transactionAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}`
            };
          });
        } else {
          //this.showNotification('danger', 'Error al consultar las transacciones', 'Ha ocurrido un error inesperado al consultar las transacciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        //this.showNotification('danger', 'Error al consultar las transacciones', 'Ha ocurrido un error inesperado al consultar las transacciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    }
  },


  computed: {

  },

  mounted(){
    this.selectNotUsedTransactions();
    setInterval(() => {
      this.selectNotUsedTransactions();
    }, 5000);
  },

  created: function() {
   
  },
};
</script>

<style>
  
</style>

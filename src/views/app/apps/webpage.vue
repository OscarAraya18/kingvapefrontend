<template>
  <div>
    <b-card>
      <vue-good-table
        :rows="webpageOrderRows"
        :columns="webpageOrderColumns"
        styleClass="order-table vgt-table"
        :line-numbers="false"
      >
        <template slot="table-row" slot-scope="props">
          <div v-if="props.column.field == 'webpageOrderCreationDate'">
            <p>{{ parseDate(props.row.webpageOrderCreationDate) }}</p>
          </div>
          <div v-else-if="props.column.field == 'webpageOrderClientPhoneNumber'">
            <p>{{ parsePhoneNumber(props.row.webpageOrderClientPhoneNumber) }}</p>
          </div>
          <div v-else-if="props.column.field == 'webpageOrderNote'">
            <div style="width: 400px;">
              <p>{{ props.row.webpageOrderNote }}</p>
            </div>
          </div>
          <div v-else-if="props.column.field == 'webpageOrderAmount'">
            <p>₡ {{ props.row.webpageOrderAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</p>
          </div>
          <div v-else-if="props.column.field == 'webpageOrderProducts'">
            <i :id="'tooltip'+props.row.webpageOrderID" class="i-Shopping-Cart text-info" style="font-size: xx-large; cursor: pointer;"></i>
            <b-tooltip placement="left" :target="'tooltip'+props.row.webpageOrderID">
              <div v-for="webpageProduct in props.row.webpageOrderProducts">
                <br>
                <p style="margin: 5px;"><strong>SKU: </strong>{{ webpageProduct.CodigoP }}</p>
                <p style="margin: 5px;"><strong>NOMBRE: </strong>{{ webpageProduct.descripcion }}</p>
                <p style="margin: 5px;"><strong>CANTIDAD: </strong>{{ webpageProduct.cantidad }}</p>
                <br>
              </div>
            </b-tooltip>
          </div>
          <div v-else-if="props.column.field == 'webpageOrderAction'">
            <div v-if="props.row.loader">
              <span class="spinner-glow spinner-glow-black"></span>
            </div>
            <i v-else @click="processWebpageOrder(props.row)" class="i-Speach-Bubble-3 text-black" style="font-size: x-large; cursor: pointer;"></i>
          </div>
        </template>
      </vue-good-table>
    </b-card>
  </div>
</template>

<script>

import axios from 'axios';
const constants = require('@../../../src/constants.js'); 

export default {
  watch: {
    
  }, 

  data() {
    return {
      webpageOrderRows: 
      [
        {
          webpageOrderID: 1,
          loader: false,
          webpageOrderCreationDate: 'Fri Jan 03 2025 20:53:52 GMT+0000 (Coordinated Universal Time)',
          webpageOrderClientName: 'Oscar Araya',
          webpageOrderClientPhoneNumber: 50660694075,
          webpageOrderClientID: 117770329,
          webpageOrderClientEmail: 'osaronaragar15@gmail.com',
          webpageOrderNote: 'Nota de prueba (acá va información relevante que coloca el cliente en la página web)',
          webpageOrderAmount: 12000,
          webpageOrderProducts: [{"CodigoP":"6226173","descripcion":"PURE VAPE MINT WATERMELON 3MG 120ML","cantidad":1,"precio":8000,"id":2,"descuento":0},{"CodigoP":"6941291536769","descripcion":"VOOPOO PNP TW30 0.3OHM 28-36W 1PCS","cantidad":1,"precio":4000,"id":2,"descuento":0}],
        },
        {
          webpageOrderID: 2,
          loader: false,
          webpageOrderCreationDate: 'Fri Jan 03 2025 20:53:52 GMT+0000 (Coordinated Universal Time)',
          webpageOrderClientName: 'Oscar Araya',
          webpageOrderClientPhoneNumber: 50660694075,
          webpageOrderClientID: 117770329,
          webpageOrderClientEmail: 'osaronaragar15@gmail.com',
          webpageOrderNote: 'Nota de prueba (acá va información relevante que coloca el cliente en la página web)',
          webpageOrderAmount: 12000,
          webpageOrderProducts: [{"CodigoP":"6226173","descripcion":"PURE VAPE MINT WATERMELON 3MG 120ML","cantidad":1,"precio":8000,"id":2,"descuento":0},{"CodigoP":"6941291536769","descripcion":"VOOPOO PNP TW30 0.3OHM 28-36W 1PCS","cantidad":1,"precio":4000,"id":2,"descuento":0}],
        }
      ],
      webpageOrderColumns:
      [
        {label: "ID", field: "webpageOrderID"},
        {label: "Fecha", field: "webpageOrderCreationDate"},
        {label: "Nombre", field: "webpageOrderClientName"},
        {label: "Número", field: "webpageOrderClientPhoneNumber"},
        {label: "Correo", field: "webpageOrderClientEmail"},
        {label: "Nota", field: "webpageOrderNote"},
        {label: "Monto", field: "webpageOrderAmount"},
        {label: "Productos", field: "webpageOrderProducts"},
        {label: "Contactar", field: "webpageOrderAction"}
      ],

      processWebpageOrderLoader: false
    };
  },

  methods: {
    parsePhoneNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    parseDate(originalDate){
      const parsingDate = new Date(originalDate);
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

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    async processWebpageOrder(webpageOrder){
      webpageOrder.loader = true;
      const processWebpageOrderRequestQuery =
      {
        'webpageOrderID': webpageOrder.webpageOrderID,
        'agentID': localStorage.getItem('agentID')
      };
      axios.post(constants.routes.backendAPI+'/processWebpageOrder', processWebpageOrderRequestQuery).then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Conversación iniciada', 'Se ha iniciado una conversación con el cliente de la órden "' + webpageOrder.webpageOrderID + '".')
        } else {
          this.showNotification('danger', 'Error al procesar el pedido de la página web', 'Ha ocurrido un error inesperado al procesar el pedido de la página web. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
        webpageOrder.loader = false;
      })
      .catch(() => {
        this.showNotification('danger', 'Error al procesar el pedido de la página web', 'Ha ocurrido un error inesperado al procesar el pedido de la página web. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        webpageOrder.loader = false;
      })
    },
  },

  computed: {



  },

  async created(){

  },

  mounted(){    
    
  }, 

  beforeDestroy(){

  }

};
</script>

<style>

</style>

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
          <div v-if="props.column.field == 'webpageOrderCreationDatetime'">
            <p>{{ props.row.webpageOrderCreationDatetime }}</p>
          </div>
          <div v-else-if="props.column.field == 'webpageOrderClientPhoneNumber'">
            <p>{{ parsePhoneNumber(props.row.webpageOrderClientPhoneNumber) }}</p>
          </div>
          <div v-else-if="props.column.field == 'webpageOrderNote'">
            <div style="width: 300px;">
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
                <p style="margin: 5px;"><strong>SKU: </strong>{{ webpageProduct.productID }}</p>
                <p style="margin: 5px;"><strong>NOMBRE: </strong>{{ webpageProduct.productName }}</p>
                <p style="margin: 5px;"><strong>PRECIO: </strong>₡ {{ webpageProduct.productPrice.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</p>
                <p style="margin: 5px;"><strong>CANTIDAD: </strong>{{ webpageProduct.productAmount }}</p>
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
      url: 'https://souqbackend-production.up.railway.app',

      webpageOrderRows: [],
      webpageOrderColumns:
      [
        {label: "ID", field: "webpageOrderID"},
        {label: "Fecha", field: "webpageOrderCreationDatetime"},
        {label: "Nombre", field: "webpageOrderClientName"},
        {label: "Número", field: "webpageOrderClientPhoneNumber"},
        {label: "Cédula", field: "webpageOrderClientSSN"},
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


    async selectWebpageOrderFromCallcenter(webpageOrderID, whatsappConversationID){
      const selectWebpageOrderFromCallcenterRequestQuery =
      {
        'webpageOrderID': webpageOrderID,
        'whatsappConversationID': whatsappConversationID
      };
      axios.post(this.url + '/webpage/functions/selectWebpageOrderFromCallcenter', selectWebpageOrderFromCallcenterRequestQuery).then((response) =>{
        if (response.data.success){
          this.webpageOrderRows = response.data.result.map(webpageOrderRow => ({
            ...webpageOrderRow,
            'loader': false
          }));
        } else {
          this.showNotification('danger', 'Error al consultar los pedidos de la página web', 'Ha ocurrido un error inesperado al consultar los pedidos de la página web. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar los pedidos de la página web', 'Ha ocurrido un error inesperado al consultar los pedidos de la página web. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    }, 

    async processWebpageOrder(webpageOrder){
      webpageOrder.loader = true;
      const processWebpageOrderRequestQuery =
      {
        'webpageOrderID': webpageOrder.webpageOrderID,
        'webpageOrderClientName': webpageOrder.webpageOrderClientName,
        'webpageOrderClientPhoneNumber': webpageOrder.webpageOrderClientPhoneNumber,
        'webpageOrderClientSSN': webpageOrder.webpageOrderClientSSN,
        'webpageOrderClientEmail': webpageOrder.webpageOrderClientEmail,
        'webpageOrderNote': webpageOrder.webpageOrderNote,
        'webpageOrderAmount': webpageOrder.webpageOrderAmount,
        'webpageOrderProducts': webpageOrder.webpageOrderProducts,
        'agentID': localStorage.getItem('agentID')
      };
      axios.post(constants.routes.backendAPI+'/processWebpageOrder', processWebpageOrderRequestQuery).then(async (response) =>{
        if (response.data.success){
          this.showNotification('success', 'Conversación iniciada', 'Se ha iniciado una conversación con el cliente de la órden "' + webpageOrder.webpageOrderID + '".')
        } else {
          this.showNotification('danger', 'Error al procesar el pedido de la página web', 'Ha ocurrido un error inesperado al procesar el pedido de la página web. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
        await this.selectWebpageOrderFromCallcenter(webpageOrder.webpageOrderID, response.data.result);
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

  async mounted(){    
    await this.selectWebpageOrderFromCallcenter(null, null);
  }, 

  beforeDestroy(){

  }

};
</script>

<style>

</style>

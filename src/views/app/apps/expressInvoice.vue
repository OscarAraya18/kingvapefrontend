<template>



  <div>
    <b-modal id="whatsappInvoiceProductsModal" size="lg" centered hide-header hide-footer>
      
      <div v-if="updatedWhatsappInvoice">
        <h4><strong>ID:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceID }}</h4>
        <h4><strong>Nombre:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceClientName }}</h4>
        <h4><strong>Número:</strong> {{ parsePhoneNumber(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h4>
      </div>
      <br><br>
      <vue-good-table
        :columns="whatsappInvoiceProductsColumns"
        :line-numbers="false"
        styleClass="order-table vgt-table"
        :rows="whatsappInvoiceProducts">
        <template slot="table-row" slot-scope="props">  
          <div v-if="props.column.field == 'productID'">
            <VueBarcode :value="props.row.productID" width="1" height="50">
            </VueBarcode>
          </div>
          <div v-else-if="props.column.field == 'productPrice'">
            ₡ {{ parseInt(props.row.productPrice).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}
          </div>
          <div v-else-if="props.column.field == 'productDiscount'">
            {{ props.row.productDiscount }} %
          </div>
        </template>
      </vue-good-table>
    </b-modal>



    <b-modal id="confirmationModal" size="lg" centered hide-header hide-footer>
      
      <div v-if="updatedWhatsappInvoice">
        <h4><strong>ID:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceID }}</h4>
        <h4><strong>Nombre:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceClientName }}</h4>
        <h4><strong>Número:</strong> {{ parsePhoneNumber(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h4>
      </div>
      <br><br>
      <div v-if="whatsappInvoiceState == 'X'">
        <b-form-textarea rows="4" class="form-control" placeholder="Motivo de cancelación de la órden" v-model="whatsappInvoiceNotShippedReason"/>
        <br><br>
      </div>
      <div style="text-align: center;">
        <button @click="updateWhatsappInvoiceFromLocalityExpress()" :class="whatsappInvoiceState == 'X' ? 'btn btn-danger' : 'btn btn-success'" style="margin-right: 20px;">{{ whatsappInvoiceState == 'X' ? 'Cancelar órden' : 'Entregar órden'}}</button>
      </div>
    </b-modal>




  <vue-good-table
    :columns="whatsappInvoiceColumns"
    :line-numbers="false"
    styleClass="order-table vgt-table"
    :rows="whatsappInvoiceRows"
  >

    <template slot="table-row" slot-scope="props">
      <div v-if="props.column.field == 'whatsappInvoiceClientName'">
        <p style="margin: 0px;"><strong>Nombre: </strong>{{ props.row.whatsappInvoiceClientName }}</p>
        <p style="margin: 0px;"><strong>Teléfono: </strong>{{ parsePhoneNumber(props.row.whatsappInvoiceClientPhoneNumber) }}</p>
      </div>
      <div v-else-if="props.column.field == 'whatsappInvoiceAmount'">
        <p style="margin: 0px;"><strong>Monto: </strong>₡{{ parseInt(props.row.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</p>
        <p style="margin: 0px;"><strong>Método: </strong>{{ parsePhoneNumber(props.row.whatsappInvoicePaymentMethod) }}</p>
        <p style="margin: 0px;"><strong>Estado: </strong>{{ parsePhoneNumber(props.row.whatsappInvoicePaymentState) }}</p>
      </div>

      <div v-else-if="props.column.field == 'whatsappInvoiceShippingNote'">
        <p style="margin: 0px;"><strong>Nota de entrega: </strong>{{ props.row.whatsappInvoiceShippingNote }}</p>
        <p style="margin: 0px;"><strong>Nota de ubicación: </strong>{{ props.row.whatsappInvoiceLocationNote }}</p>
      </div>

      <div v-else-if="props.column.field == 'whatsappInvoiceProducts'">
        <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(props.row)" class="i-Shopping-Cart text-info" style="font-size: xx-large; cursor: pointer;"></i>
      </div>
      <div v-else-if="props.column.field == 'whatsappInvoiceAction'">
        <div style="display: flex;">
          <button @click="openConfirmationModal(props.row, 'E')" class="btn btn-success" style="margin-right: 20px;" v-b-modal.confirmationModal>Entregar</button>
          <button @click="openConfirmationModal(props.row, 'X')" class="btn btn-danger" v-b-modal.confirmationModal>Cancelar</button>
        </div>
      </div>
    </template>

  </vue-good-table>

  </div>
</template>

<style>

</style>


<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js');
import VueBarcode from 'vue-barcode';


export default {
  components: {VueBarcode},

  data() {
    return {
      whatsappInvoiceRows: [],
      whatsappInvoiceColumns:
      [
        {
          label: "ID",
          field: "whatsappInvoiceID",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cliente",
          field: "whatsappInvoiceClientName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Pago",
          field: "whatsappInvoiceAmount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nota",
          field: "whatsappInvoiceShippingNote",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Productos",
          field: "whatsappInvoiceProducts",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Actualizar estado",
          field: "whatsappInvoiceAction",
          thClass: "text-left",
          tdClass: "text-left",
        },
      ],

      updatedWhatsappInvoice: null,
      whatsappInvoiceProducts: [],
      whatsappInvoiceProductsColumns: [
        {
          label: "Código",
          field: "productID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Nombre",
          field: "productName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cantidad",
          field: "productAmount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Precio",
          field: "productPrice",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Descuento",
          field: "productDiscount",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      whatsappInvoiceState: '',
      whatsappInvoiceNotShippedReason: '',

      errorCount: 0,
      queryInterval: null,

      backendURL: 'https://payitcr.com'
    };
  },

  watch: {
    
  },
  
  methods: {

    openConfirmationModal(whatsappInvoice, whatsappInvoiceState){
      this.updatedWhatsappInvoice = whatsappInvoice;
      this.whatsappInvoiceState = whatsappInvoiceState;
      this.whatsappInvoiceNotShippedReason = '';
    },

    openWhatsappInvoiceProducts(whatsappInvoice){
      try {
        this.updatedWhatsappInvoice = whatsappInvoice;
        this.whatsappInvoiceProducts = JSON.parse(whatsappInvoice.whatsappInvoiceProducts)
      } catch {
        this.whatsappInvoiceProducts = [];
        this.updatedWhatsappInvoice = null;
      }
      
    },

    parsePhoneNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    updateWhatsappInvoiceFromLocalityExpress(){
      const regularExpressionChecker = /\S/;
      if (this.whatsappInvoiceState == 'X' && regularExpressionChecker.test(this.whatsappInvoiceNotShippedReason) == false){
        this.showNotification('danger', 'Error al cancelar la órden', 'Debe colocar un motivo de cancelación de la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      } else {
        this.$root.$emit('bv::hide::modal', 'confirmationModal');

        axios.post(this.backendURL+'/updateWhatsappInvoiceFromLocalityExpress',
        {
          whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
          whatsappInvoiceState: this.whatsappInvoiceState,
          whatsappInvoiceNotShippedReason: (this.whatsappInvoiceState == 'X' ? this.whatsappInvoiceNotShippedReason : '')
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Órden ' + (this.whatsappInvoiceState == 'X' ? 'cancelada' : 'entregada'), 'La órden se ha ' + (this.whatsappInvoiceState == 'X' ? 'cancelado' : 'entregado') + ' exitosamente');
            this.selectAllActiveWhatsappInvoiceFromLocality();
          } else {
            this.showNotification('danger', 'Error al actualizar el estado de la órden', 'Ha ocurrido un error inesperado al actualizar el estado de la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.errorCount = this.errorCount + 1;
          if (this.errorCount >= 3){
            this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }  
        })
      }
    },

    selectAllActiveWhatsappInvoiceFromLocality(){
      axios.post(this.backendURL+'/selectAllActiveWhatsappInvoiceFromLocalityExpress',
      {
        localityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          this.errorCount = 0;
          this.whatsappInvoiceRows = response.data.result;
        } else {
          this.errorCount = this.errorCount + 1;
          if (this.errorCount >= 3){
            this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }        
        }
      })
      .catch(() => {
        this.errorCount = this.errorCount + 1;
        if (this.errorCount >= 3){
          this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }  
      })
    },  
  },

  mounted(){
    this.selectAllActiveWhatsappInvoiceFromLocality();
    this.queryInterval = setInterval(() => {
      this.selectAllActiveWhatsappInvoiceFromLocality();
    }, 10000);

  },

  beforeDestroy(){
    if (this.queryInterval){
      clearInterval(this.queryInterval);
    }
  }
};
</script>
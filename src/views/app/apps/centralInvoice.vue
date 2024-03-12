<template>
  <div>
    <div style="display: flex">
      
      <div style="width: 25%; margin-right: 1%;">
        <b-card style="height: 90vh; background-color: #fed330;">
          <div style="justify-content: center; display: flex;">
            <div style="display: flex;">
              <h2 style="margin-top: auto; margin-bottom: auto;"><strong>ZAPOTE</strong></h2>
              <div style="margin-left: 30px;">
                <b-badge style="font-size: larger; margin-right: 7px; margin-bottom: 10px;" pill variant="danger">{{zapoteCentralInvoiceAmount}}</b-badge>
                <b-badge style="font-size: larger;" pill variant="warning">{{zapoteLocalityInvoiceAmount}}</b-badge>
                <br>
                <b-badge style="font-size: larger; margin-right: 7px;" pill variant="info">{{zapoteRouteInvoiceAmount}}</b-badge>
                <b-badge style="font-size: larger;" pill variant="success">{{zapoteDeliveredInvoiceAmount}}</b-badge>
              </div>
            </div>
          </div>
          
          <br>

          <div style="height: 80vh; overflow-y: auto;">
            <div v-for="zapoteInvoice in zapoteInvoices">
              <div draggable="true" style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white;">
                <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  <h5 style="margin-top: 10px;"><strong>Órden: </strong>{{ zapoteInvoice.invoiceID }}</h5>
                  <h5><strong>Nombre: </strong>{{ zapoteInvoice.invoiceClientName }}</h5>
                  <h5><strong>Número: </strong>{{ zapoteInvoice.invoiceClientPhoneNumber }}</h5>
                  <h5><strong>Monto: </strong>{{ zapoteInvoice.invoiceAmount }}</h5>
                  <h5><strong>Agente: </strong>{{ zapoteInvoice.invoiceAgentName }}</h5>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">00:00:00</b-badge>
                  <br>
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">00:00:00</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="info">00:00:00</b-badge>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <div style="text-align: end;"> 
                    <i class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px;"></i>
                    <i class="i-Information" style="font-size: xx-large; margin-right: 10px;"></i>
                  </div>
                  <div style="text-align: end;">
                    <br>
                    <b-badge style="margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">E</b-badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          
          
        </b-card>
      </div>

      <div style="width: 25%; margin-right: 1%;">
        <b-card style="height: 90vh; background-color: #e44f9c;" class="hotAnimation">
          <div style="justify-content: center; display: flex;">
            <div style="display: flex;">
              <img src="@/assets/pageAssets/test.webp" alt style="width: 100px; height: auto; margin-right: 10px;" class="animationHot"/>
              <h2 style="margin-top: auto; margin-bottom: auto;"><strong>ESCAZÚ</strong></h2>
              <div style="margin-left: 30px;">
                <b-badge style="font-size: larger; margin-right: 7px; margin-bottom: 10px;" pill variant="danger">{{zapoteCentralInvoiceAmount}}</b-badge>
                <b-badge style="font-size: larger;" pill variant="warning">{{zapoteLocalityInvoiceAmount}}</b-badge>
                <br>
                <b-badge style="font-size: larger; margin-right: 7px;" pill variant="info">{{zapoteRouteInvoiceAmount}}</b-badge>
                <b-badge style="font-size: larger;" pill variant="success">{{zapoteDeliveredInvoiceAmount}}</b-badge>
              </div>
            </div>
          </div>
          
          <br>

          <div style="height: 80vh; overflow-y: auto;"> 
            <div v-for="zapoteInvoice in zapoteInvoices">
              <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white;">
                <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  <h5 style="margin-top: 10px;"><strong>Órden: </strong>{{ zapoteInvoice.invoiceID }}</h5>
                  <h5><strong>Nombre: </strong>{{ zapoteInvoice.invoiceClientName }}</h5>
                  <h5><strong>Número: </strong>{{ zapoteInvoice.invoiceClientPhoneNumber }}</h5>
                  <h5><strong>Monto: </strong>{{ zapoteInvoice.invoiceAmount }}</h5>
                  <h5><strong>Agente: </strong>{{ zapoteInvoice.invoiceAgentName }}</h5>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">00:00:00</b-badge>
                  <br>
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">00:00:00</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="info">00:00:00</b-badge>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <div style="text-align: end;"> 
                    <i class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px;"></i>
                    <i class="i-Information" style="font-size: xx-large; margin-right: 10px;"></i>
                  </div>
                  <div style="text-align: end;">
                    <br>
                    <b-badge style="margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">E</b-badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          
          
        </b-card>
      </div>

      <div style="width: 25%; margin-right: 1%;">
        <b-card style="height: 90vh; background-color: #9f7cd0;">
          <div style="justify-content: center; display: flex;">
            <div style="display: flex;">
              <h2 style="margin-top: auto; margin-bottom: auto;"><strong>HEREDIA</strong></h2>
              <div style="margin-left: 30px;">
                <b-badge style="font-size: larger; margin-right: 7px; margin-bottom: 10px;" pill variant="danger">{{zapoteCentralInvoiceAmount}}</b-badge>
                <b-badge style="font-size: larger;" pill variant="warning">{{zapoteLocalityInvoiceAmount}}</b-badge>
                <br>
                <b-badge style="font-size: larger; margin-right: 7px;" pill variant="info">{{zapoteRouteInvoiceAmount}}</b-badge>
                <b-badge style="font-size: larger;" pill variant="success">{{zapoteDeliveredInvoiceAmount}}</b-badge>
              </div>
            </div>
          </div>
          
          <br>

          <div style="height: 80vh; overflow-y: auto;">
            <div v-for="zapoteInvoice in zapoteInvoices">
              <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white;">
                <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  <h5 style="margin-top: 10px;"><strong>Órden: </strong>{{ zapoteInvoice.invoiceID }}</h5>
                  <h5><strong>Nombre: </strong>{{ zapoteInvoice.invoiceClientName }}</h5>
                  <h5><strong>Número: </strong>{{ zapoteInvoice.invoiceClientPhoneNumber }}</h5>
                  <h5><strong>Monto: </strong>{{ zapoteInvoice.invoiceAmount }}</h5>
                  <h5><strong>Agente: </strong>{{ zapoteInvoice.invoiceAgentName }}</h5>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">00:00:00</b-badge>
                  <br>
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">00:00:00</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="info">00:00:00</b-badge>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <div style="text-align: end;"> 
                    <i class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px;"></i>
                    <i class="i-Information" style="font-size: xx-large; margin-right: 10px;"></i>
                  </div>
                  <div style="text-align: end;">
                    <br>
                    <b-badge style="margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">E</b-badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          
          
        </b-card>
      </div>



      <div style="width: 25%; margin-right: 1%;">
        <b-card style="height: 90vh; background-color: #26a699;">
          <div style="justify-content: center; display: flex;">
            <div style="display: flex;">
              <h2 style="margin-top: auto; margin-bottom: auto;"><strong>CARTAGO</strong></h2>
              <div style="margin-left: 30px;">
                <b-badge style="font-size: larger; margin-right: 7px; margin-bottom: 10px;" pill variant="danger">{{zapoteCentralInvoiceAmount}}</b-badge>
                <b-badge style="font-size: larger;" pill variant="warning">{{zapoteLocalityInvoiceAmount}}</b-badge>
                <br>
                <b-badge style="font-size: larger; margin-right: 7px;" pill variant="info">{{zapoteRouteInvoiceAmount}}</b-badge>
                <b-badge style="font-size: larger;" pill variant="success">{{zapoteDeliveredInvoiceAmount}}</b-badge>
              </div>
            </div>
          </div>
          
          <br>

          <div style="height: 80vh; overflow-y: auto;">
            <div v-for="zapoteInvoice in zapoteInvoices">
              <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white;">
                <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  <h5 style="margin-top: 10px;"><strong>Órden: </strong>{{ zapoteInvoice.invoiceID }}</h5>
                  <h5><strong>Nombre: </strong>{{ zapoteInvoice.invoiceClientName }}</h5>
                  <h5><strong>Número: </strong>{{ zapoteInvoice.invoiceClientPhoneNumber }}</h5>
                  <h5><strong>Monto: </strong>{{ zapoteInvoice.invoiceAmount }}</h5>
                  <h5><strong>Agente: </strong>{{ zapoteInvoice.invoiceAgentName }}</h5>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">00:00:00</b-badge>
                  <br>
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">00:00:00</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="info">00:00:00</b-badge>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <div style="text-align: end;"> 
                    <i class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px;"></i>
                    <i class="i-Information" style="font-size: xx-large; margin-right: 10px;"></i>
                  </div>
                  <div style="text-align: end;">
                    <br>
                    <b-badge style="margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">E</b-badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          
          
        </b-card>
      </div>
    
    </div>
  </div>
</template>

<style>

@keyframes aja {
    0% {
    }
    50% {
      background-color: #e44f9c;
    }
    100% {
    }
  }

  .hotAnimation {
    animation: aja 1.4s infinite;
  }


  @keyframes test {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);

    }
  }

  .animationHot{
    animation: test 1.4s infinite;

  }



</style>


<script>

export default {
  components: {},

  data() {
    return {
      zapoteInvoices: [
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
        {
          'invoiceID': 2323,
          'invoiceAgentName': 'Sharon Espinoza',
          'invoiceClientName': 'Oscar Fernando Araya Garbanzo',
          'invoiceClientPhoneNumber': '50660694075',
          'invoiceAmount': 23000
        },
      ],

      zapoteCentralInvoiceAmount: 0,
      zapoteLocalityInvoiceAmount: 0,
      zapoteRouteInvoiceAmount: 0,
      zapoteDeliveredInvoiceAmount: 0
    };
  },
  methods: {
    
  }
};
</script>
<template>
  <div class="main-content">
    <br>
    <b-row>

      <b-col lg="6" md="6" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          @click="view='activeConversations'"
          style="cursor: pointer;"
        >
          <i class="i-Male"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Hoy</p>
            <p class="text-primary text-24 line-height-1 mb-2">{{activeConversationsRows.length}}</p>
          </div>
        </b-card>
      </b-col>
      <b-col lg="6" md="6" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          @click="getClosedConversations()"
          style="cursor: pointer;"
        >
          <i class="i-Checkout"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Reportes</p>
            <p class="text-primary text-24 line-height-1 mb-2">{{closedConversationsAmount}}</p>
          </div>
        </b-card>
      </b-col>
      
      
    </b-row>
    
    <div v-if="view == 'closedConversations'">

      <br><br>
      <div style="display:flex;">
        <div style="width: 50%; padding-right: 100px; padding-left: 50px;">
          <h4><strong>Filtro por fecha inicial:</strong></h4>
          <b-form-datepicker v-model="initialDateFiltered"></b-form-datepicker>
          <br><br>
          <h4><strong>Filtro por fecha final:</strong></h4>
          <b-form-datepicker v-model="endDateFiltered"></b-form-datepicker>
          <br><br>
          <h4><strong>Filtro por agente:</strong></h4>
          <b-form-select v-model="agentFiltered" class="mb-3" :options="agentOptions"></b-form-select>
          <br><br>
          <h4><strong>Filtro por conversación:</strong></h4>
          <b-form-select v-model="conversationFiltered" class="mb-3" :options="conversationOptions"></b-form-select>
          <br><br>
          <button class="btn btn-icon" style="background-color: #F9E530; font-size: 15px" @click="filter()"><i class="i-Search-People"></i>Aplicar filtro</button>
        </div>

        <div style="width: 50%; padding-right: 100px; padding-left: 50px;">
          <h4><strong>Ordenar por:</strong></h4>
          <b-form-group>
            <b-form-radio-group
              id="radio-group-1"
              v-model="selected"
              :options="options"
              name="radio-options"
              stacked
            ></b-form-radio-group>
          </b-form-group>
          <br>
          <button class="btn btn-icon" style="background-color: #F9E530; font-size: 15px" @click="order()"><i class="i-Search-People"></i>Aplicar ordenamiento</button>
        </div>

      </div>
      
      <br><br><br><br><br><br>
    </div>

    <div class="col-md-12">


      <div v-if="view == 'activeConversations'">
        <p style="font-size: medium;"><strong>Conversaciones recibidas:</strong> {{todayConversationsAmount}}</p>
        <p style="font-size: medium;"><strong>Conversaciones vendidas:</strong> {{todayConvertedConversationsAmount}}</p>
        <p style="font-size: medium;"><strong>Conversaciones no vendidas:</strong> {{todayNotConvertedConversationsAmount}}</p>
        <p style="font-size: medium;"><strong>Mensajes recibidos:</strong> {{todayReceivedMessages}}</p>
        <p style="font-size: medium;"><strong>Mensajes enviados:</strong> {{todaySendedMessages}}</p>
        <p style="font-size: medium;"><strong>Total de ventas:</strong> ₡{{todaySells}}</p>

      <br>

      <button class="btn btn-icon" style="background-color: #F9E530; font-size: 15px" v-b-modal.todayReport @click="openTodayReport()"><i class="i-Engineering"></i>Reporte rápido de ventas</button>


      <b-modal scrollable hide-footer hide-header size="lg" centered hide-backdrop id="todayReport">
        <vue-perfect-scrollbar ref="scrollRef">
          <b-list-group>
            <b-list-group-item v-for="agent in todayReport">
              <h4>
                <strong>{{agent.agentName}}: </strong>
              </h4>
              <br>
              <p style="font-size: medium;"><strong>Conversaciones recibidas:</strong> {{agent.todayConversations}}</p>
              <p style="font-size: medium;"><strong>Conversaciones vendidas:</strong> {{agent.todayConvertedConversations}}</p>
              <p style="font-size: medium;"><strong>Conversaciones no vendidas:</strong> {{agent.todayNotConvertedConversations}}</p>
              <p style="font-size: medium;"><strong>Mensajes recibidos:</strong> {{agent.todayReceived}}</p>
              <p style="font-size: medium;"><strong>Mensajes enviados:</strong> {{agent.todaySent}}</p>
              <p style="font-size: medium;"><strong>Ventas generadas:</strong> ₡{{agent.todayAmount}}</p>
            </b-list-group-item>
          </b-list-group>
          
        </vue-perfect-scrollbar>
      </b-modal>

      <br><br><br>
      </div>

      <div class="card mb-30">

        
        <div class="card-body p-0">

          <vue-good-table
            :columns="activeConversationsColumns"
            :line-numbers="false"
            styleClass="order-table vgt-table"
            :rows="activeConversationsRows"
            v-if="view == 'activeConversations'"
          >
            <template slot="table-row" slot-scope="props">
              <button v-b-modal.conversationModal  v-if="props.column.field == 'openConversation'" class="btn btn-outline-primary text-black btn-rounded" @click="openConversation(props.row.activeConversationID, 'active')">Abrir</button>
              <button v-b-modal.transferHistoryModal v-else-if="props.column.field == 'openTransferHistory'" class="btn btn-outline-primary text-black btn-rounded" @click="openTransferHistory(props.row.activeConversationID, 'active')">Transferencias</button>
            </template>
          </vue-good-table>

          <vue-good-table
            :columns="closedConversationsColumns"
            :line-numbers="false"
            styleClass="order-table vgt-table"
            :rows="closedConversationsRows"
            v-if="view == 'closedConversations'"
          >
            <template slot="table-row" slot-scope="props">
              <button v-b-modal.conversationModal  v-if="props.column.field == 'openConversation'" class="btn btn-outline-primary text-black btn-rounded" @click="openConversation(props.row.activeConversationID, 'closed')">Abrir</button>
              <button v-b-modal.transferHistoryModal v-else-if="props.column.field == 'openTransferHistory'" class="btn btn-outline-primary text-black btn-rounded" @click="openTransferHistory(props.row.activeConversationID, 'closed')">Transferencias</button>
            </template>
          </vue-good-table>

        </div>
      </div>
    </div>

    <b-modal scrollable hide-footer hide-header size="lg" centered hide-backdrop id="conversationModal">
      <div class="chat-content-wrap sidebar-content">
        <vue-perfect-scrollbar ref="scrollRef"
        :settings="{ suppressScrollX: true, wheelPropagation: false }"
        class="chat-content perfect-scrollbar rtl-ps-none ps scroll"
        >
        <div v-for="cuurentActiveConversationMessage in cuurrentActiveConversation.messages" :key="cuurentActiveConversationMessage">
          <div class="d-flex mb-30" :class="GetOwner(cuurentActiveConversationMessage.owner)" >
            <div :style="getColorChat(cuurentActiveConversationMessage.owner)" class="message flex-grow-1">
              <div class="d-flex">
                
                <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="cuurentActiveConversationMessage.owner != 'agent'">
                  
                  <p class="m-0" style="white-space: pre-line;" v-if="cuurentActiveConversationMessage.messageType == 'text'">{{cuurentActiveConversationMessage.messageContent}}</p>
                  
                  <img
                    v-if="cuurentActiveConversationMessage.messageType=='image'"
                    style="width: 250px;"
                    :src="`data:${cuurentActiveConversationMessage.messageContent.mediaExtension};base64,${cuurentActiveConversationMessage.messageContent.mediaContent}`"
                  >

                  <div v-if="cuurentActiveConversationMessage.messageType=='document'" class="m-0">
                    <a :href="`data:${cuurentActiveConversationMessage.messageContent.mediaExtension};base64,${cuurentActiveConversationMessage.messageContent.mediaContent}`" :download="cuurentActiveConversationMessage.messageContent.mediaName">
                      <p style="size: 10%;">Archivo: <strong>{{cuurentActiveConversationMessage.messageContent.mediaName}}</strong></p>
                    </a>
                  </div>

                </div>
                <span v-if="cuurentActiveConversationMessage.owner == 'agent'" style="margin-left: 0; margin-right:auto;" class="text-small text-muted">{{cuurentActiveConversationMessage.messageSentHour}}</span>
                <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{cuurentActiveConversationMessage.messageReceivedHour}}</span>
                
                <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="cuurentActiveConversationMessage.owner == 'agent'">
                  
                  <div v-if="cuurentActiveConversationMessage.messageType == 'text'">
                    <p class="m-0" style="white-space: pre-line;" v-if="cuurentActiveConversationMessage.sendedProduct != '1'">{{cuurentActiveConversationMessage.messageContent}}</p>
                    
                    <p class="m-0" style="white-space: pre-line;" v-if="cuurentActiveConversationMessage.sendedProduct == '1'"><strong>Nombre: </strong>{{cuurentActiveConversationMessage.messageContent.productName}}</p>
                    <p class="m-0" style="white-space: pre-line;" v-if="cuurentActiveConversationMessage.sendedProduct == '1'"><strong>Precio: </strong>{{cuurentActiveConversationMessage.messageContent.productPrice}}</p>

                  </div>

                  <div v-if="cuurentActiveConversationMessage.messageType=='image' || cuurentActiveConversationMessage.messageType=='sticker'">

                    <img
                      v-if="cuurentActiveConversationMessage.messageContent.isBase64=='1'"
                      style="width: 250px;"
                      :src="`data:${cuurentActiveConversationMessage.messageContent.mediaExtension};base64,${cuurentActiveConversationMessage.messageContent.mediaContent}`"
                    >

                    <img
                      v-else
                      style="width: 250px;"
                      :src="cuurentActiveConversationMessage.messageContent.mediaContent"
                    >

                    
                  </div>

                </div>
                
              </div>
            </div>
          </div>
        </div>
      </vue-perfect-scrollbar>
      </div>
    </b-modal>

    <b-modal scrollable hide-footer hide-title size="m" centered hide-backdrop id="transferHistoryModal">
      <vue-perfect-scrollbar ref="scrollRef" style="text-align: center;">
        <h5 v-for="transfer in currentTranferHistory">
          <strong>{{transfer.previousAgentName}}</strong> to <strong>{{transfer.newAgentName}}</strong> ({{transfer.transferDate}} at {{transfer.transferHour}})
        </h5>
        <h5 v-if="currentTranferHistory.length == 0">Sin transferencias</h5>
      </vue-perfect-scrollbar>
    </b-modal>

    


  </div>
</template>
<script>
import {
  dashboardOne,
  dashboardTwo,
  splineAreaWidgetTwo,
  splineAreaWidgetThree,
} from "@/data/dashboard1";

import axios from 'axios';
const constants = require('@../../../src/constants.js'); 

const webSocket = new WebSocket('wss:telasmasbackend.onrender.com');


export default {
  metaInfo: {
    title: "Dashboard",
  },
  data() {
    return {
      selected: 0,
      options: [
        {text: 'Fecha (más reciente a más antiguo)', value: 1},
        {text: 'Fecha (más antiguo a más reciente)', value: 2},
        {text: 'Monto vendido (mayor cantidad a menor cantidad)', value: 3},
        {text: 'Monto vendido (menor cantidad a mayor cantidad)', value: 4},
        {text: 'Cantidad de mensajes (mayor cantidad a menor cantidad)', value: 5},
        {text: 'Cantidad de mensajes (menor cantidad a mayor cantidad)', value: 6},

      ],

      todayConversationsAmount: 0,
      todayConvertedConversationsAmount: 0,
      todayNotConvertedConversationsAmount: 0,
      todayReceivedMessages: 0,
      todaySendedMessages: 0,
      todaySells: 0,

      todayReport: {},

      initialDateFiltered: '',
      endDateFiltered: '',

      agentOptions: [{value:null,text:'Seleccione un agente para filtrar'}],
      agentFiltered: '',

      conversationOptions: [{value:null,text:'Seleccione un tipo de conversación para filtrar'}, {value:'Vendido', text:'Vendido'}, {value:'No vendido', text:'No vendido'}],
      conversationFiltered: '',




      closedConversationsAmount: 0,
      allConversationsAmount: 0,
      activeConversations: {},
      closedConversations: {},
      allConversations: {},
      totalProfit: 0,

      cuurrentActiveConversation: {},
      currentTranferHistory: [],
      view: 'activeConversations',

      dashboardOne,
      dashboardTwo,
      splineAreaWidgetTwo,
      splineAreaWidgetThree,
      activeConversationsColumns: [
        {
          label: "ID de la conversación",
          field: "activeConversationID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Número del cliente",
          field: "recipientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del agente",
          field: "assignedAgentID",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Estado",
          field: "state",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de inicio",
          field: "startDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Hora de inicio",
          field: "startHour",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Tiempo transcurrido",
          field: "time",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Transferencias",
          field: "openTransferHistory",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Conversación",
          field: "openConversation",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      activeConversationsRows: [],
      closedConversationsRows: [],

      closedConversationsColumns: [
        {
          label: "ID",
          field: "activeConversationID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Número del cliente",
          field: "recipientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del agente",
          field: "assignedAgentID",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Tipo de pago",
          field: "payment",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cantidad",
          field: "amount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de inicio",
          field: "startDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Hora de inicio",
          field: "startHour",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de finalización",
          field: "endDate",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Hora de finalización",
          field: "endHour",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          field: "openTransferHistory",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          field: "openConversation",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

    };
  },

  mounted(){
    axios.get(constants.routes.backendAPI+'/getAllActiveConversations').then((response) =>{ 
      this.activeConversations = response.data;
      this.activeConversationsRows = [];
      for (var activeConversationID in this.activeConversations){
        this.activeConversationsRows.push
        (
          {
            activeConversationID: activeConversationID,
            recipientPhoneNumber: this.activeConversations[activeConversationID].recipientPhoneNumber,
            assignedAgentID: this.activeConversations[activeConversationID].assignedAgentID,
            state: this.getConversationState(this.activeConversations[activeConversationID]),
            startDateObject: this.activeConversations[activeConversationID].startDateObject,
            startDate: this.activeConversations[activeConversationID].startDate,
            startHour: this.activeConversations[activeConversationID].startHour,
            time: this.getElapsedTime(Math.round((new Date() - new Date(this.activeConversations[activeConversationID].startDateObject))/1000)),
            openTransferHistory: '',
            openConversation: ''
          }
        )
      }

      axios.get(constants.routes.backendAPI+'/getTodaysDashboardInformation').then((response) =>{ 
        this.todayConversationsAmount = response.data.currentTodayConversation;
        this.todayConvertedConversationsAmount = response.data.currentTodayConverted;
        this.todayNotConvertedConversationsAmount = response.data.currentTodayNotConverted;
        this.todayReceivedMessages = response.data.currentTodayReceived;
        this.todaySendedMessages = response.data.currentTodaySent;
        this.todaySells = response.data.currentTodayAmount;


        axios.get(constants.routes.backendAPI+'/getAgentOptions').then((response) =>{ 
          for (var agentID in response.data){
            this.agentOptions.push(response.data[agentID]);
          }
        })
        .catch(error =>{
          console.log(error);
        })


      })
      .catch(error =>{
        console.log(error);
      })

      


      setInterval(() => {
        for (var activeConversationIndex in this.activeConversationsRows){
          this.activeConversationsRows[activeConversationIndex].time = this.getElapsedTime(Math.round((new Date() - new Date(this.activeConversationsRows[activeConversationIndex].startDateObject))/1000))
          this.activeConversationsRows[activeConversationIndex].state = this.getConversationState(this.activeConversations[this.activeConversationsRows[activeConversationIndex].activeConversationID]);
        }
      }, 1000);

    })
    .catch(error =>{
      console.log(error);
    })

    try {
    webSocket.onmessage = (websocketMessage) => {

      const websocketMessageJSON = JSON.parse(websocketMessage.data);
      console.log(websocketMessageJSON)
      if (websocketMessageJSON['sendingMessage'] == true){
        this.$set(this.activeConversations[websocketMessageJSON['conversationID']].messages, (Object.keys(this.activeConversations[websocketMessageJSON['conversationID']].messages).length + 1).toString(), websocketMessageJSON['messageInformation']);
      
      } else {
        if (websocketMessageJSON['transfer'] == true){
          for (var activeConversationIndex in this.activeConversationsRows){
            if (this.activeConversationsRows[activeConversationIndex].activeConversationID == websocketMessageJSON['conversationID']){
                this.activeConversationsRows[activeConversationIndex].assignedAgentID = websocketMessageJSON['agentName'];
            }
          }
        } else {
          if (this.activeConversations[websocketMessageJSON['conversationID']]){
            this.$set(this.activeConversations[websocketMessageJSON['conversationID']].messages, websocketMessageJSON['messageID'], websocketMessageJSON['messageInformation']);
          } else {
            this.$set(this.activeConversations, websocketMessageJSON['conversationID'], websocketMessageJSON['conversationInformation']);
            this.activeConversationsRows.push
            (
              {
                activeConversationID: websocketMessageJSON['conversationID'],
                recipientPhoneNumber: this.activeConversations[websocketMessageJSON['conversationID']].recipientPhoneNumber,
                assignedAgentID: this.activeConversations[websocketMessageJSON['conversationID']].assignedAgentID,
                state: this.getConversationState(this.activeConversations[websocketMessageJSON['conversationID']]),
                startDateObject: this.activeConversations[websocketMessageJSON['conversationID']].startDateObject,
                startDate: this.activeConversations[websocketMessageJSON['conversationID']].startDate,
                startHour: this.activeConversations[websocketMessageJSON['conversationID']].startHour,
                time: this.getElapsedTime(Math.round((new Date() - new Date(this.activeConversations[websocketMessageJSON['conversationID']].startDateObject))/1000)),
                openTransferHistory: '',
                openConversation: ''
              }
            )
          }

          for (var activeConversationIndex in this.activeConversationsRows){
            this.activeConversationsRows[activeConversationIndex].state = this.getConversationState(this.activeConversations[this.activeConversationsRows[activeConversationIndex].activeConversationID]);
          }
        }
      }
      
      this.$nextTick(() => {
      if (this.$refs.scrollRef) {
          const psContainer = this.$refs.scrollRef.$el;
          psContainer.scrollTop = psContainer.scrollHeight;
        }
      });

    }
    } catch {}
  },

  methods: {
    openTodayReport(){
      axios.get(constants.routes.backendAPI+'/getTodayReport').then((response) =>{ 
        this.todayReport = response.data;
        
      })
      .catch(error =>{
        console.log(error);
      })
    },


    filter(){

      var initialDate = null;
      if (this.initialDateFiltered != ''){
        initialDate = this.initialDateFiltered.substring(5, this.initialDateFiltered.length) + '-' + this.initialDateFiltered.substring(0, 4);
      }

      var endDate = null;
      if (this.endDateFiltered != ''){
        endDate = this.endDateFiltered.substring(5, this.endDateFiltered.length) + '-' + this.endDateFiltered.substring(0, 4);
      }

      var agent = null;
      if (this.endDateFiltered != ''){
        endDate = this.endDateFiltered.substring(5, this.endDateFiltered.length) + '-' + this.endDateFiltered.substring(0, 4);
      }
      alert(this.agentFiltered);

      /*
      axios.get(constants.routes.backendAPI+'/getAllClosedConversations?').then((response) =>{ 
      this.closedConversations = response.data;
      this.closedConversationsRows = [];
      var span = '';
      var amount = 0;
      for (var activeConversationID in this.closedConversations){
        if (this.closedConversations[activeConversationID].status == 'converted'){
          span = '<span class="badge badge-pill badge-outline-success p-2">Converted</span>'
          amount = '₡'+this.closedConversations[activeConversationID].amount;
        } else {
          span = '<span class="badge badge-pill badge-outline-danger p-2">Not converted</span>';
          amount = 'Not converted';
        } 
        alert('2');
        this.closedConversationsRows.push
        (
          {
            activeConversationID: activeConversationID,
            recipientPhoneNumber: this.closedConversations[activeConversationID].recipientPhoneNumber,
            assignedAgentID: this.closedConversations[activeConversationID].assignedAgentID,
            payment: span,
            amount: amount,
            startDateObject: this.closedConversations[activeConversationID].startDateObject,
            startDate: this.closedConversations[activeConversationID].startDate,
            startHour: this.closedConversations[activeConversationID].startHour,
            endDate: this.closedConversations[activeConversationID].endDate,
            endHour: this.closedConversations[activeConversationID].endHour,
            openTransferHistory: '',
            openConversation: ''
          }
        )
      }
      var temp = [];
      for (var closedConversationRow in this.closedConversationsRows){
        if (this.closedConversationsRows[closedConversationRow].startDate == date){
          temp.push(this.closedConversationsRows[closedConversationRow]);
        }
      }
      this.closedConversationsRows = temp;

      })
      .catch(error =>{
        console.log(error);
      })

      */
      
    },
    getClosedConversations(){
      this.view='closedConversations';
      axios.get(constants.routes.backendAPI+'/getAllClosedConversations?').then((response) =>{ 
      this.closedConversations = response.data;
      this.closedConversationsRows = [];
      var span = '';
      var amount = 0;
      for (var activeConversationID in this.closedConversations){
        if (this.closedConversations[activeConversationID].status == 'converted'){
          span = '<span class="badge badge-pill badge-outline-success p-2">Converted</span>'
          amount = '₡'+this.closedConversations[activeConversationID].amount;

        } else {
          span = '<span class="badge badge-pill badge-outline-danger p-2">Not converted</span>'
          amount = 'Not converted';
        }
        this.closedConversationsRows.push
        (
          {
            activeConversationID: activeConversationID,
            recipientPhoneNumber: this.closedConversations[activeConversationID].recipientPhoneNumber,
            assignedAgentID: this.closedConversations[activeConversationID].assignedAgentID,
            payment: span,
            amount: amount,
            startDateObject: this.closedConversations[activeConversationID].startDateObject,
            startDate: this.closedConversations[activeConversationID].startDate,
            startHour: this.closedConversations[activeConversationID].startHour,
            endDate: this.closedConversations[activeConversationID].endDate,
            endHour: this.closedConversations[activeConversationID].endHour,
            openTransferHistory: '',
            openConversation: ''
          }
        )
      }

    })
    .catch(error =>{
      console.log(error);
    })

    },
    getConversationState(conversation){
      
      var lastMessageTime = conversation.messages[(Object.keys(conversation.messages)).length.toString()].dateObject;
      var elapsedSeconds = this.getElapsedTime(Math.round((new Date() - new Date(lastMessageTime))/1000));
      if (conversation.assignedAgentID == 'Sin asignar'){
        return '<span class="badge badge-pill badge-warning p-2 " style="background-color="red"">Not assigned ('+elapsedSeconds+')</span>'
      }
      else if (conversation.messages[(Object.keys(conversation.messages).length).toString()].owner == 'client'){
        return '<span class="badge badge-pill badge-danger p-2 " style="background-color="red"">Esperando al agente ('+elapsedSeconds+')</span>'
      } 
      return '<span class="badge badge-pill badge-success p-2 ">Esperando al cliente ('+elapsedSeconds+')</span>'
    },


    getColorChat(item){
      if(item == 'agent'){
        return "background-color:#d6ffb6";
      } else
      {
        return "background-color:#dedede";
      }

    },
    GetOwner(item){
      if(item != 'agent'){
        return "user";
      } 
    },

    openConversation(activeConversationID, conversationType){
      if (conversationType == 'active'){
        this.cuurrentActiveConversation = this.activeConversations[activeConversationID];
      } else {
        this.cuurrentActiveConversation = this.closedConversations[activeConversationID];
      }
    },

    openTransferHistory(activeConversationID, conversationType){
      if (conversationType == 'active'){
        this.currentTranferHistory = this.activeConversations[activeConversationID].transferHistory;
      } else {
        this.currentTranferHistory = this.closedConversations[activeConversationID].transferHistory;
      }
    },

    getElapsedTime(seconds){
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      return timeFormat;
    }
  }
};
</script>

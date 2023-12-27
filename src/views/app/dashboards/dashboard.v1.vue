<template>
  <div class="main-content">
    <br>
    <b-row>

      <b-col lg="4" md="4" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          @click="view='activeConversations'"
          style="cursor: pointer;"
        >
          <i class="i-Tag-3"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Hoy</p>
            <p class="text-primary text-24 line-height-1 mb-2">{{activeConversationsRows.length}}</p>
          </div>
        </b-card>
      </b-col>
      
      <b-col lg="4" md="4" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          @click="getClosedConversations()"
          style="cursor: pointer;"
        >
          <i class="i-Checkout"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Reportes</p>
          </div>
        </b-card>
      </b-col>

      <b-col lg="4" md="4" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          @click="getEstadisticas()"
          style="cursor: pointer;"
        >
          <i class="i-Male"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Estadísticas</p>
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
          <br>
          <h4><strong>Filtro por fecha final:</strong></h4>
          <b-form-datepicker v-model="endDateFiltered"></b-form-datepicker>
          <br>
          <h4><strong>Filtro por número:</strong></h4>
          <b-form-input v-model="numberFiltered" class="mb-3" placeholder="Coloque un número"></b-form-input>
          <h4><strong>Filtro por agente:</strong></h4>
          <b-form-select v-model="agentFiltered" class="mb-3" :options="agentOptions"></b-form-select>
          <br>
          <h4><strong>Filtro por sucursal de envío:</strong></h4>
          <b-form-select v-model="storeFiltered" class="mb-3" :options="storeOptions"></b-form-select>
          <br>
          <h4><strong>Filtro por conversión:</strong></h4>
          <b-form-select v-model="conversionFiltered" class="mb-3" :options="conversionOptions"></b-form-select>
          <br><br>
          <button class="btn btn-icon" style="background-color: #F9E530; font-size: 15px" @click="filter()"><i class="i-Search-People"></i>Aplicar filtro</button>
          <button class="btn btn-icon" style="background-color: rgb(255, 184, 32); font-size: 15px; margin-left: 30px;" @click="cleanFilter()"><i class="i-Folder-Trash"></i>Limpiar filtros</button>

        </div>

      </div>
      
      <br><br><br><br><br>
    </div>

    <div v-if="view == 'estadisticas'">
      hola
    </div>

    <div class="col-md-12">


      <div v-if="view == 'activeConversations'">
        <br>
        <p style="font-size: medium;"><strong>Conversaciones recibidas:</strong> {{whatsappTotalConversations}}</p>
        <p style="font-size: medium;"><strong>Conversaciones vendidas:</strong> {{whatsappSelledConversations}}</p>
        <p style="font-size: medium;"><strong>Conversaciones no vendidas:</strong> {{whatsappNotSelledConversations}}</p>
        <p style="font-size: medium;"><strong>Conversaciones pendientes:</strong> {{whatsappPendingConversations}}</p>
        <p style="font-size: medium;"><strong>Total de ventas:</strong> ₡{{whatsappTotalSells}}</p>
        <br><br>

        <h4><strong>Filtro por agente:</strong></h4>
          <b-form-select v-model="agentFiltered" class="mb-3" :options="agentOptions" @change="filterByAgent()"></b-form-select>
        <br>

        <button class="btn btn-icon" style="display:none; background-color: #F9E530; font-size: 15px" v-b-modal.todayReport @click="openTodayReport()"><i class="i-Engineering"></i>Reporte rápido de ventas</button>


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
              <button v-b-modal.conversationModal  v-if="props.column.field == 'whatsappConversationOpenAction'" class="btn btn-outline-primary text-black btn-rounded" @click="whatsappConversationOpenAction(props.row.whatsappConversationID)">Abrir</button>
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
              <button v-b-modal.conversationModal  v-if="props.column.field == 'whatsappConversationOpenAction'" class="btn btn-outline-primary text-black btn-rounded" @click="whatsappConversationOpenAction(props.row.whatsappConversationID)">Abrir</button>
            </template>
          </vue-good-table>

        </div>
      </div>
    </div>

    <b-modal scrollable hide-footer hide-header size="lg" centered hide-backdrop id="conversationModal" v-if="currentConversation != null">
      <div v-if="openConversationLoader == true" style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
      <div v-else>
        <div v-for="currentActiveConversationMessage in currentConversation.whatsappConversationMessages">
          
          <div class="d-flex mb-30" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
            <div :style="getMessageOwnerColor(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)" class="message flex-grow-1">
              <div class="d-flex">
                <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                    <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                      
                      <div v-if="currentConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                        <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                      </div>
                      
                      <div v-for="answeredMessage in currentConversation.whatsappConversationMessages">
                        <div v-if="answeredMessage.whatsappGeneralMessageID == currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID">
                          
                          <p v-if="answeredMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{answeredMessage.whatsappTextMessageBody}}</p>
                          <div v-if="answeredMessage.whatsappGeneralMessageType == 'contact'"> 
                            <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{answeredMessage.whatsappContactMessageName}}</p>
                            <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{answeredMessage.whatsappContactMessagePhoneNumber}}</p>
                          </div>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType == 'image'"> 
                            <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`">
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappImageMessageCaption}}</p>
                          </div>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                            <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                          </div>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                            <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 600px; height: 250px"><GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/></GmapMap><br>
                            <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                            <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                          </div>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                            <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                          </div>
                          
                          <audio controls v-if="answeredMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${answeredMessage.whatsappAudioMessageFile}`"></audio>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                            <img v-b-modal.bigImageModal @click="openBigImage(answeredMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="answeredMessage.whatsappFavoriteImageMessageDriveURL">
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappFavoriteImageMessageCaption != null">{{answeredMessage.whatsappFavoriteImageMessageCaption}}</p>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'contact'"> 
                    <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{currentActiveConversationMessage.whatsappContactMessageName}}</p>
                    <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{currentActiveConversationMessage.whatsappContactMessagePhoneNumber}}</p>
                  </div>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                    <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                    <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                  </div>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='video'"> 
                    <video controls width="400" :src="`data:video/mp4;base64,${currentActiveConversationMessage.whatsappVideoMessageFile}`"></video>
                    <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappVideoMessageCaption}}</p>
                  </div>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">
                    <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 600px; height: 250px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
                    <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                    <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                  </div>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='document'" class="m-0">
                    <a style="color: black;" :href="`data:${currentActiveConversationMessage.whatsappDocumentMessageMimeType};base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`" :download="currentActiveConversationMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{currentActiveConversationMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                  </div>
                  
                  <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                    <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                    <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>

                  </div>
                
                </div>
                <span v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null" style="margin-left: 0; margin-right:auto;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null">
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                    <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                      
                      <div v-if="currentConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                        <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                      </div>
                      
                      <div v-for="answeredMessage in currentConversation.whatsappConversationMessages">

                        <div v-if="answeredMessage.whatsappGeneralMessageID == currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID">
                          
                          <p v-if="answeredMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{answeredMessage.whatsappTextMessageBody}}</p>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType == 'contact'"> 
                            <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{answeredMessage.whatsappContactMessageName}}</p>
                            <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{answeredMessage.whatsappContactMessagePhoneNumber}}</p>
                          </div>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType == 'image'"> 
                            <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`">
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappImageMessageCaption}}</p>
                          </div>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                            <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                          </div>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                            <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 600px; height: 250px"><GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/></GmapMap><br>
                            <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                            <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                          </div>
                          
                          <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                            <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                          </div>
                          
                          <audio controls v-if="answeredMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${answeredMessage.whatsappAudioMessageFile}`"></audio>
                        
                          <div v-if="answeredMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                            <img v-b-modal.bigImageModal @click="openBigImage(answeredMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="answeredMessage.whatsappFavoriteImageMessageDriveURL">
                            <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappFavoriteImageMessageCaption != null">{{answeredMessage.whatsappFavoriteImageMessageCaption}}</p>
                          </div>
                        
                        </div>
                      </div>
                    </div>
                  </div>
                  <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'contact'"> 
                    <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{currentActiveConversationMessage.whatsappContactMessageName}}</p>
                    <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{currentActiveConversationMessage.whatsappContactMessagePhoneNumber}}</p>
                  </div>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                    <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                    <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                  </div>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">
                    <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
                    <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                    <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                  </div>
                  
                  <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                  
                  <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                    <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                    <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>
                  </div>
                
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
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
import ApexCharts from 'apexcharts'

const constants = require('@../../../src/constants.js'); 

const webSocket = new WebSocket('wss:telasmasbackend.onrender.com');


export default {
  metaInfo: {
    title: "Dashboard",
  },
  data() {
    return {
      conversacionesTotales: 0,
      conversacionesVendidas: 0,
      conversacionesNoVendidas: 0,

      facturadoPorAgente: [],
      opcionesGraficoCircular: {},

      conversacionesPorAgente: [],
      opcionesGraficoBarra: {},
      vendedoraDelDia: '',

      zoom: 15,

      selected: 0,
      options: [
        {text: 'Fecha (más reciente a más antiguo)', value: 1},
        {text: 'Fecha (más antiguo a más reciente)', value: 2},
        {text: 'Monto vendido (mayor cantidad a menor cantidad)', value: 3},
        {text: 'Monto vendido (menor cantidad a mayor cantidad)', value: 4},
        {text: 'Cantidad de mensajes (mayor cantidad a menor cantidad)', value: 5},
        {text: 'Cantidad de mensajes (menor cantidad a mayor cantidad)', value: 6}
      ],

      whatsappTotalConversations: 0,
      whatsappSelledConversations: 0,
      whatsappNotSelledConversations: 0,
      whatsappPendingConversations: 0,
      whatsappReceivedMessages: 0,
      whatsappSendedMessages: 0,
      whatsappTotalSells: 0,

      todayReport: {},

      initialDateFiltered: '',
      endDateFiltered: '',
      numberFiltered: '',

      agentOptions: [{value:null,text:''}],
      agentFiltered: '',

      storeOptions: [{value:null, text:''}, {value:'Escazú', text:'Escazú'}, {value:'Zapote', text:'Zapote'}, {value:'Cartago', text:'Cartago'}, {value:'Heredia', text:'Heredia'}],
      storeFiltered: '',

      conversionOptions: [{value:null, text:''}, {value:'Vendido', text:'Vendido'}, {value:'No vendido', text:'No vendido'}],
      conversionFIltered: '',

      

      activeConversations: [],

      closedConversations: [],

      currentConversation: {},
      openConversationLoader: false,
      
      view: 'activeConversations',

      activeConversationsColumns: [
        {
          label: "ID de la conversación",
          field: "whatsappConversationID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Número del cliente",
          field: "whatsappConversationRecipientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del cliente",
          field: "whatsappConversationRecipientProfileName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del agente",
          field: "agentName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Estado",
          field: "whatsappConversationState",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de inicio",
          field: "whatsappConversationStartDateTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Tiempo transcurrido",
          field: "whatsappConversationElapsedTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Conversación",
          field: "whatsappConversationOpenAction",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      activeConversationsRows: [],
      originalActiveConversationsRows: [],
      closedConversationsRows: [],

      closedConversationsColumns: [
        {
          label: "ID",
          field: "whatsappConversationID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Número del cliente",
          field: "whatsappConversationRecipientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del cliente",
          field: "whatsappConversationRecipientProfileName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del agente",
          field: "agentName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cantidad",
          field: "whatsappConversationAmount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de inicio",
          field: "whatsappConversationStartDateTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Conversación",
          field: "whatsappConversationOpenAction",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

    };
  },

  mounted(){
    this.selectTodayInformation();
    this.selectAgentNames();
    this.getInformation();

    setInterval(() => {
      this.getInformation();
    }, 30000);
    
    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);
        const websocketMessageID = websocketMessageJSON.websocketMessageID;
        const websocketMessageContent = websocketMessageJSON.websocketMessageContent.result;

        if (websocketMessageID == '/receiveWhatsappMessage'){
          this.selectTodayInformation();
        } else if (websocketMessageID == '/receiveWhatsappConversation'){
          this.selectTodayInformation();
        } else if (websocketMessageID == '/receiveWhatsappPendingConversation'){
          this.selectTodayInformation();
        } else if (websocketMessageID == '/grabPendingConversation') {
          this.selectTodayInformation();
        } else if (websocketMessageID == '/grabStoreConversation') {
          this.selectTodayInformation();
        } else if (websocketMessageID == '/acceptTransferWhatsappConversation'){
          this.selectTodayInformation();
        } else if (websocketMessageID == '/sendWhatsappMessage'){
          this.selectTodayInformation();
        }
      }
    } catch (error) {
      console.log(error);
    }

  },

  methods: {

    getInformation(){
      axios.get(constants.routes.backendAPI+'/selectPieChartInformation').then((response) =>{
        this.facturadoPorAgente = Object.values(response.data);
        this.opcionesGraficoCircular = {chart: {width: 850, type: 'pie', fontSize: 40}, tooltip: {enabled: false}, labels: Object.keys(response.data),
        legend: {fontSize: '30px'}};
      });

      axios.get(constants.routes.backendAPI+'/selectBarChartInformation').then((response) =>{
        this.opcionesGraficoBarra = 
        {
          chart: {type: 'bar', height: 350, stacked: true},
          plotOptions: {bar: { horizontal: false, borderRadius: 10}},
          xaxis: {type: 'string', categories: response.data.result.map(agent => agent.agentName),
          labels: {style: {fontSize: '20px'}}},
          fill: {colors: ['#008a07', '#d10015'], opacity: 1},
          legend: {show: false},
        };
        this.conversacionesPorAgente = 
        [
          {
            name: 'VENDIDAS',
            data: response.data.result.map(agent => agent.whatsappSelledConversations),
            color: '#008a07'
          }, 
          {
            name: 'NO VENDIDAS',
            data: response.data.result.map(agent => agent.whatsappNotSelledConversations),
            color: '#d10015'
          }
        ];
      });

      axios.get(constants.routes.backendAPI+'/selectTodayInformation').then((response) =>{
        this.conversacionesTotales = response.data.result[0].whatsappTotalConversations;
        this.conversacionesVendidas = response.data.result[0].whatsappSelledConversations;
        this.conversacionesNoVendidas = response.data.result[0].whatsappNotSelledConversations;
      });

      axios.get(constants.routes.backendAPI+'/selectTodayTopSell').then((response) =>{
        console.log(response.data);
        this.vendedoraDelDia = response.data.result;
      });
    },

    filterByAgent(){
      if (this.agentFiltered == null){
        this.activeConversationsRows = this.originalActiveConversationsRows;
      } else {
        this.activeConversationsRows = this.originalActiveConversationsRows.filter(activeConversationRow => activeConversationRow.agentName == this.agentFiltered);
      }
    },

    selectAgentNames(){
      this.agentOptions = [{value:null,text:''}];

      axios.get(constants.routes.backendAPI+'/selectAgentNames').then((response) =>{
        if (response.data.success){
          for (var agentIndex in response.data.result){
            this.agentOptions.push({value: response.data.result[agentIndex].agentName, text: response.data.result[agentIndex].agentName});
          }
        } else {
          
        }
      })
      .catch((error) =>{
        console.log(error);
      })
    },

    selectTodayInformation(){
      axios.get(constants.routes.backendAPI+'/selectAllActiveConversationBasicInformation').then((response) =>{
        if (response.data.success){
          this.activeConversations = response.data.result;
          this.activeConversationsRows = [];
          for (var activeConversationIndex in this.activeConversations){
            this.activeConversationsRows.push
            ({
              whatsappConversationID: this.activeConversations[activeConversationIndex].whatsappConversationID,
              whatsappConversationRecipientPhoneNumber: this.activeConversations[activeConversationIndex].whatsappConversationRecipientPhoneNumber,
              whatsappConversationRecipientProfileName: this.activeConversations[activeConversationIndex].whatsappConversationRecipientProfileName,
              agentName: this.activeConversations[activeConversationIndex].agentName || 'Sin asignar',
              whatsappGeneralMessageCreationDateTime: this.activeConversations[activeConversationIndex].whatsappGeneralMessageCreationDateTime,
              whatsappGeneralMessageOwnerPhoneNumber: this.activeConversations[activeConversationIndex].whatsappGeneralMessageOwnerPhoneNumber,
              whatsappConversationState: this.getWhatsappConversationState(this.activeConversations[activeConversationIndex]),
              whatsappConversationStartDateTime: this.parseHour(this.activeConversations[activeConversationIndex].whatsappConversationStartDateTime),
              whatsappConversationElapsedTime: this.getWhatsappConversationElapsedTime(Math.round((new Date() - new Date(this.activeConversations[activeConversationIndex].whatsappConversationStartDateTime))/1000)),
              whatsappConversationOpenAction: ''
            });
            this.originalActiveConversationsRows = this.activeConversationsRows;
          }

          setInterval(() => {
            for (var activeConversationIndex in this.activeConversationsRows){
              this.activeConversationsRows[activeConversationIndex].whatsappConversationState = this.getWhatsappConversationState(this.activeConversationsRows[activeConversationIndex]);
              this.activeConversationsRows[activeConversationIndex].whatsappConversationElapsedTime = this.getWhatsappConversationElapsedTime(Math.round((new Date() - new Date(this.activeConversationsRows[activeConversationIndex].whatsappConversationStartDateTime))/1000))
            }
          }, 1000);

          axios.get(constants.routes.backendAPI+'/selectTodayDashboardInformation').then((response) =>{
            this.whatsappTotalConversations = response.data.result.whatsappTotalConversations;
            this.whatsappSelledConversations = response.data.result.whatsappSelledConversations;
            this.whatsappNotSelledConversations = response.data.result.whatsappNotSelledConversations;
            this.whatsappPendingConversations = response.data.result.whatsappPendingConversations;
            this.whatsappTotalSells = response.data.result.whatsappTotalSells.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3});

            this.whatsappSendedMessages = response.data.result.whatsappSendedMessages;
            this.whatsappReceivedMessages = response.data.result.whatsappReceivedMessages;
          })
          .catch((error) =>{
            console.log(error);
          })
        } else {
          
        }
      })
      .catch((error) =>{
        console.log(error);
      })
    },

    parseHour(originalHour){
      const parsingDate = new Date(originalHour);
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      const formattedDate = parsingDate.toLocaleString('en-US', options);
      return formattedDate;
    },
    
    filter(){
      axios.post(constants.routes.backendAPI+'/selectFilteredConversations', 
      {
        initialDateFiltered: this.initialDateFiltered,
        endDateFiltered: this.endDateFiltered,
        numberFiltered: this.numberFiltered,
        agentFiltered: this.agentFiltered,
        storeFiltered: this.storeFiltered,
        conversionFiltered: this.conversionFiltered
      })
      .then((response) =>{
        if (response.data.success){
          this.closedConversations = response.data.result;
          this.closedConversationsRows = [];
          for (var closedConversationIndex in this.closedConversations){
            this.closedConversationsRows.push
            ({
              whatsappConversationID: this.closedConversations[closedConversationIndex].whatsappConversationID,
              whatsappConversationRecipientPhoneNumber: this.closedConversations[closedConversationIndex].whatsappConversationRecipientPhoneNumber,
              whatsappConversationRecipientProfileName: this.closedConversations[closedConversationIndex].whatsappConversationRecipientProfileName,
              whatsappConversationAmount: this.closedConversations[closedConversationIndex].whatsappConversationAmount,
              agentName: this.closedConversations[closedConversationIndex].agentName || 'Sin asignar',
              whatsappConversationStartDateTime: this.parseHour(this.closedConversations[closedConversationIndex].whatsappConversationStartDateTime),
              whatsappConversationOpenAction: ''
            });
          }
        } else {
          this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        
        this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    
    cleanFilter(){
      this.initialDateFiltered = '';
      this.endDateFiltered = '';
      this.endDateFiltered = '';
      this.agentFiltered = '';
      this.numberFiltered = '';
      this.storeFiltered = '';
      this.conversionFiltered = '';
    },



    getClosedConversations(){
      this.view = 'closedConversations';
    },

    getEstadisticas(){
      this.view = 'estadisticas';
    },


    getWhatsappConversationState(whatsappConversation){
      var whatsappLastGeneralMessageCreationDateTime = whatsappConversation.whatsappGeneralMessageCreationDateTime;
      var whatsappLastGeneralMessageElapsedTime = this.getWhatsappConversationElapsedTime(Math.round((new Date() - new Date(whatsappLastGeneralMessageCreationDateTime))/1000));
      if (whatsappConversation.agentName == 'Sin asignar'){
        return '<span class="badge badge-pill badge-warning p-2 " style="background-color="red"">Pendiente ('+whatsappLastGeneralMessageElapsedTime+')</span>';
      }
      else if (whatsappConversation.whatsappGeneralMessageOwnerPhoneNumber == null){
        return '<span class="badge badge-pill badge-success p-2 ">Esperando al cliente ('+whatsappLastGeneralMessageElapsedTime+')</span>';
      } else {
        return '<span class="badge badge-pill badge-danger p-2 " style="background-color="red"">Esperando al agente ('+whatsappLastGeneralMessageElapsedTime+')</span>';
      }
    },


    getLocation(whatsappGeneralMessage){
      return {lat: whatsappGeneralMessage.whatsappLocationMessageLatitude, lng: whatsappGeneralMessage.whatsappLocationMessageLongitude}
    },

    getMessageOwnerStyle(messageOwner){
      if(messageOwner != null){
        return 'user';
      } 
    },

    getMessageOwnerColor(messageOwner){
      if(messageOwner == null){
        return "background-color:#ceefff";
      } 
      return "background-color:#dedede";
    },

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    whatsappConversationOpenAction(whatsappConversationID){
      this.openConversationLoader = true;
      this.currentConversation = {};
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        whatsappConversationID: whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.currentConversation = response.data.result[whatsappConversationID];
          this.openConversationLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    getWhatsappConversationElapsedTime(seconds){
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      return timeFormat;
    }
  }
};
</script>

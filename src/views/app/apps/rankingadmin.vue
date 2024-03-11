<template>
  <div class="main-content">
    <b-modal scrollable size="lg" centered id="bigImageModal" hide-footer hide-header>
      <img style="width: 1000px;" :src="bigImageSource">
    </b-modal>

    <b-modal scrollable size="m" centered hide-footer id="historyMessageModal" hide-header>
      <div v-if="historyMessageLoader == false && historyMessage != null">
        <p v-if="historyMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{historyMessage.whatsappTextMessageBody}}</p>
        
        <div v-if="historyMessage.whatsappGeneralMessageType == 'contact'"> 
          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{historyMessage.whatsappContactMessageName}}</p>
          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{historyMessage.whatsappContactMessagePhoneNumber}}</p>
        </div>
        
        <div v-if="historyMessage.whatsappGeneralMessageType == 'image'"> 
          <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${historyMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${historyMessage.whatsappImageMessageFile}`">
          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappImageMessageCaption != null">{{historyMessage.whatsappImageMessageCaption}}</p>
        </div>
        
        <div v-if="historyMessage.whatsappGeneralMessageType=='video'"> 
          <video controls width="400" :src="`data:video/mp4;base64,${historyMessage.whatsappVideoMessageFile}`"></video>
          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappImageMessageCaption != null">{{historyMessage.whatsappVideoMessageCaption}}</p>
        </div>
        
        <div v-if="historyMessage.whatsappGeneralMessageType=='location'" class="m-0">
          <GmapMap :center="getLocation(historyMessage)" :zoom="zoom" style="width: 1000px; height: 450px"><GmapMarker :position="getLocation(historyMessage)" :draggable="false"/></GmapMap><br>
          <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{historyMessage.whatsappLocationMessageLatitude}}</p>
          <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{historyMessage.whatsappLocationMessageLongitude}}</p><br>
          <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
            <b-dropdown-item @click="saveLocation('CASA', historyMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
            <b-dropdown-item @click="saveLocation('TRABAJO', historyMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
            <b-dropdown-item @click="saveLocation('OTRO', historyMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
          </b-dropdown>
        </div>
        
        <div v-if="historyMessage.whatsappGeneralMessageType=='document'" class="m-0">
          <a style="color: black;" :href="`data:${historyMessage.whatsappDocumentMessageMimeType};base64,${historyMessage.whatsappDocumentMessageFile}`" :download="historyMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{historyMessage.whatsappDocumentMessageFileName}}</strong></p></a>
        </div>
        
        <audio controls v-if="historyMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${historyMessage.whatsappAudioMessageFile}`"></audio>
        
        <div v-if="historyMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
          <img v-b-modal.bigImageModal @click="openBigImage(historyMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="historyMessage.whatsappFavoriteImageMessageDriveURL">
          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappFavoriteImageMessageCaption != null">{{historyMessage.whatsappFavoriteImageMessageCaption}}</p>
        </div>
      </div>
      <div v-else style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
    </b-modal>
    
    <div style="display: flex">
      <div style="width: 45%">
        <h4><strong>Filtro por fecha inicial:</strong></h4>
        <b-form-datepicker v-model="rankingInitialDate"></b-form-datepicker>
      </div>
      <div style="width: 45%; margin-left: 100px;">
        <h4><strong>Filtro por fecha final:</strong></h4>
        <b-form-datepicker v-model="rankingEndDate"></b-form-datepicker>
      </div>
    </div>
    <br><br>
    <div> 
      <div style="display: flex; justify-content: center; align-items: center;">
        <b-card style="width: 30%; margin-right: 30px;">
          <div style="display: flex;">
            <b-card-text style="font-size: x-large;">
              Conversaciones totales:
            </b-card-text>
            <div class="flex-grow-1"></div>
            <b-card-text style="font-size: x-large; color: rgb(52, 52, 142);">
              {{conversacionesTotales}}
            </b-card-text>
          </div>
        </b-card>

        <b-card style="width: 30%;">
          <div style="display: flex;">
            <b-card-text style="font-size: x-large;">
              Conversaciones vendidas:
            </b-card-text>
            <div class="flex-grow-1"></div>
            <b-card-text style="font-size: x-large; color: rgb(70, 142, 52);">
              {{conversacionesVendidas}}
            </b-card-text>
          </div>
        </b-card>

        <b-card style="width: 30%; margin-left: 30px;">
          <div style="display: flex;">
            <b-card-text style="font-size: x-large;">
              Conversaciones no vendidas:
            </b-card-text>
            <div class="flex-grow-1"></div>
            <b-card-text style="font-size: x-large; color: rgb(184, 39, 29);">
              {{conversacionesNoVendidas}}
            </b-card-text>
          </div>
        </b-card>
      </div>

      <br><br><br><br>
      <div style="display: flex; justify-content: center; align-items: center;">
        
        <div id="chart1" style="margin-left: 50px; margin-right: 10px; ">
          <b-card>
            <apexchart type="pie" width="100" :options="opcionesGraficoCircular" :series="facturadoPorAgente"></apexchart>
          </b-card>
        </div>
        <div class="flex-grow-1"></div>

        <div id="chart2" style="margin-left: 10px; margin-right: 50px; align-items: center;">
          <b-card style="text-align: center; align-items: center;">
            <apexchart type="bar" width="500" :options="opcionesGraficoBarra" :series="conversacionesPorAgente"></apexchart>
          </b-card>
          <br><br><br>

          <div v-if="isAdmin">
            <b-card>
              <vue-good-table :columns="tableOptions" :line-numbers="false" styleClass="tableOne vgt-table" :rows="vendedoraDelDia">
            
              <template slot="table-row" slot-scope="props">
                <span v-if="props.column.field == 'whatsappConversationAmount'">
                  ₡{{props.row.whatsappConversationAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}
                </span>
                <span v-else-if="props.column.field == 'whatsappConversationRecipientPhoneNumber'">
                  {{formatNumber(props.row.whatsappConversationRecipientPhoneNumber)}}
                </span>
              </template>
            </vue-good-table>
            </b-card>
          </div>
        </div>
      </div>
      <br><br>
    </div>


    <b-modal id="conversationsModal" size="lg" hide-footer hide-header centered>
      <div v-if="loader1 == false">
        <div style="display: flex;">
          <b-list-group style="width: 50%;">
            <b-list-group-item v-if="currentSelledConversations.length == 0">
              No hay conversaciones vendidas
            </b-list-group-item>
            <b-list-group-item v-b-modal.openConversationModal style="cursor: pointer; background-color: rgb(106, 178, 106);" v-for="selledConversation in currentSelledConversations" @click="openConversation(selledConversation)" button>
              <div style="font-size: 15px;">
                <strong>Nombre:</strong> {{selledConversation.whatsappConversationRecipientProfileName}}<br>
                <strong>Número:</strong> {{formatNumber(selledConversation.whatsappConversationRecipientPhoneNumber)}}<br>
                <strong>Cantidad:</strong> ₡{{selledConversation.whatsappConversationAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}<br>
                <strong>Fecha:</strong> {{parseHour(selledConversation.whatsappConversationStartDateTime)}}<br>
              </div>
            </b-list-group-item>
          </b-list-group>

          <b-list-group style="width: 50%">
            <b-list-group-item v-if="currentNotSelledConversations.length == 0">
              No hay conversaciones no vendidas
            </b-list-group-item>
            
            <div v-for="notSelledConversation in currentNotSelledConversations">
              <b-list-group-item v-if="notSelledConversation.whatsappConversationCloseComment == 'Venta perdida' || notSelledConversation.whatsappConversationCloseComment == 'Venta para otro día' || notSelledConversation.whatsappConversationCloseComment == 'Consulta sobre productos' || notSelledConversation.whatsappConversationCloseComment == 'No contestó'" v-b-modal.openConversationModal style="cursor: pointer; background-color: rgb(211, 128, 126);" @click="openConversation(notSelledConversation)" button>
                <div style="font-size: 15px;"> 
                  <strong>Nombre:</strong> {{notSelledConversation.whatsappConversationRecipientProfileName}}<br>
                  <strong>Número:</strong> {{formatNumber(notSelledConversation.whatsappConversationRecipientPhoneNumber)}}<br>
                  <strong>Motivo:</strong> {{notSelledConversation.whatsappConversationCloseComment}}<br>
                  <strong>Fecha:</strong> {{parseHour(notSelledConversation.whatsappConversationStartDateTime)}}<br>
                </div>
              </b-list-group-item>
              <b-list-group-item v-else-if="notSelledConversation.whatsappConversationCloseComment == 'Vuelve a escribir'" v-b-modal.openConversationModal style="cursor: pointer; background-color: rgb(149, 207, 255);" @click="openConversation(notSelledConversation)" button>
                <div style="font-size: 15px;"> 
                  <strong>Nombre:</strong> {{notSelledConversation.whatsappConversationRecipientProfileName}}<br>
                  <strong>Número:</strong> {{formatNumber(notSelledConversation.whatsappConversationRecipientPhoneNumber)}}<br>
                  <strong>Motivo:</strong> {{notSelledConversation.whatsappConversationCloseComment}}<br>
                  <strong>Fecha:</strong> {{parseHour(notSelledConversation.whatsappConversationStartDateTime)}}<br>
                </div>
              </b-list-group-item>

              <b-list-group-item v-else-if="notSelledConversation.whatsappConversationCloseComment == 'Error'" v-b-modal.openConversationModal style="cursor: pointer; background-color: gray;" @click="openConversation(notSelledConversation)" button>
                <div style="font-size: 15px;"> 
                  <strong>Nombre:</strong> {{notSelledConversation.whatsappConversationRecipientProfileName}}<br>
                  <strong>Número:</strong> {{formatNumber(notSelledConversation.whatsappConversationRecipientPhoneNumber)}}<br>
                  <strong>Motivo:</strong> {{notSelledConversation.whatsappConversationCloseComment}}<br>
                  <strong>Fecha:</strong> {{parseHour(notSelledConversation.whatsappConversationStartDateTime)}}<br>
                </div>
              </b-list-group-item>

              <b-list-group-item v-else style="cursor: pointer; background-color: rgb(255, 184, 108);" @click="openConversation(notSelledConversation)" button>
                <div style="font-size: 15px;"> 
                  <strong>Nombre:</strong> {{notSelledConversation.whatsappConversationRecipientProfileName}}<br>
                  <strong>Número:</strong> {{formatNumber(notSelledConversation.whatsappConversationRecipientPhoneNumber)}}<br>
                  <strong>Motivo:</strong> {{notSelledConversation.whatsappConversationCloseComment}}<br>
                  <strong>Fecha:</strong> {{parseHour(notSelledConversation.whatsappConversationStartDateTime)}}<br>
                </div>
              </b-list-group-item>
            </div>

          </b-list-group>


        </div>
      </div>
      <div v-else style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
    </b-modal>

    <b-modal scrollable size="lg" centered hide-footer id="openConversationModal" hide-header v-if="currentRankingConversation != null">
        <div v-if="loader2 == true" style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
        <div v-else>
          <div v-for="currentActiveConversationMessage in currentRankingConversation.whatsappConversationMessages">
            
            <div class="d-flex mb-30" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
              <div :style="getMessageOwnerColor(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)" class="message flex-grow-1">
                <div class="d-flex">
                  <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                      <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                        
                        <div v-if="currentRankingConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                          <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                        </div>
                        
                        <div v-for="answeredMessage in currentRankingConversation.whatsappConversationMessages">
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
                  <span v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null" style="display:flex; margin-left: 0; margin-right:auto;" class="text-small text-muted">
                    <img :id="'r'+currentActiveConversationMessage.whatsappGeneralMessageID" v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null" style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/read.png">
                    <img :id="'d'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null" style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/delivered.png">
                    <img :id="'s'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/send.png">
                    <b-tooltip :target="'r'+currentActiveConversationMessage.whatsappGeneralMessageID">
                      <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                    </b-tooltip>
                    <b-tooltip :target="'d'+currentActiveConversationMessage.whatsappGeneralMessageID">
                      <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                    </b-tooltip>
                    <b-tooltip :target="'s'+currentActiveConversationMessage.whatsappGeneralMessageID">
                      <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                    </b-tooltip>
                    {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}
                  </span>
                  <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                  <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null">
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                      <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                        
                        <div v-if="currentRankingConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                          <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                        </div>
                        
                        <div v-for="answeredMessage in currentRankingConversation.whatsappConversationMessages">

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
                      <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 600px; height: 450px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
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
import axios from 'axios';
import ApexCharts from 'apexcharts'
import router from "../../../router"; 

const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:telasmasbackend.onrender.com');


export default {
  data() {
    
    return {
      tableOptions:
      [
        {
          label: "Agente",
          field: "agentName",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Monto",
          field: "whatsappConversationAmount",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Número de teléfono",
          field: "whatsappConversationRecipientPhoneNumber",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Nombre del cliente",
          field: "whatsappConversationRecipientProfileName",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        }
      ],

      historyMessageLoader: false,
      historyMessage: null,

      loader1: false,
      loader2: false,
      currentRankingConversation: {},
      
      conversacionesTotales: 0,
      conversacionesVendidas: 0,
      conversacionesNoVendidas: 0,

      facturadoPorAgente: [],
      opcionesGraficoCircular: {},

      conversacionesPorAgente: [],
      opcionesGraficoBarra: {},

      vendedoraDelDia: '',

      rankingInitialDate: '',
      rankingEndDate: '',

      currentAgentInformation: [],
      currentSelledConversations: [],
      currentNotSelledConversations: [],

      zoom: 15,
      bigImageSource: null,
      isAdmin: false
    };
  },

  mounted(){
    if (localStorage.getItem('agentID') == null){
      router.push("/app/sessions/signIn");
    }

    if (localStorage.getItem('agentType') == 'admin'){
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }

    this.getTodayInformation();
  },

  watch: {
    rankingInitialDate(rankingInitialDate){
      this.getInformationByDate();
    },

    rankingEndDate(rankingEndDate){
      this.getInformationByDate();
    }
  },


  methods: {
    getAgentColors(agentNames){
      var agentColors = [];
      const colorByAgent = 
      {
        'Sharon Espinoza': '#fae187',
        'Sofia Hernandez': '#a0d995',
        'Daniela Vega': '#dcd9f8',
        'Nicole Badilla': '#a2edce',
        'Diana Jimenez': '#ffa8b8',
        'Stef Ponce': '#b5dcf9'
      };
      for (var agentIndex in agentNames){
        const agentName = agentNames[agentIndex];
        if (agentName in colorByAgent){
          agentColors.push(colorByAgent[agentName]);
        } else {
          agentColors.push('#d3bead');
        }
      }
      return agentColors;
    },


    getHistoryMessage(whatsappGeneralMessageID){
      this.historyMessageLoader = true;
      axios.post(constants.routes.backendAPI+'/selectWhatsappGeneralMessage', 
      {
        whatsappGeneralMessageID: whatsappGeneralMessageID
      })
      .then((response) => {
        if (response.data.success){
          this.historyMessage = response.data.result;
          this.historyMessageLoader = false;
        } else {
          this.historyMessageLoader = false;
          this.showNotification('danger', 'Error al abrir el mensaje del historial', 'Ha ocurrido un error inesperado al abrir el mensaje del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir el mensaje del historial', 'Ha ocurrido un error inesperado al abrir el mensaje del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    openBigImage(bigImageSource){
      this.bigImageSource = bigImageSource;
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

    openConversation(conversation){
      this.loader2 = true;
      this.currentRankingConversation = {};
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        whatsappConversationID: conversation.whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.currentRankingConversation = response.data.result[conversation.whatsappConversationID];
          this.loader2 = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    formatNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
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
      if (formattedDate.includes('00') && formattedDate.includes('PM')){
        formattedDate = formattedDate.replace('00', '12');
      }
      return formattedDate;
    },

    openAgentDetail(agentID){
      this.loader1 = true;
      axios.post(constants.routes.backendAPI+'/selectRankingFilteredConversations',
      {
        agentID: agentID,
        initialDate: this.rankingInitialDate,
        endDate: this.rankingEndDate
      }).then((response) =>{

        this.currentSelledConversations = [];
        this.currentNotSelledConversations = [];
        const rankingFilteredConversations = response.data.result;
        for (var index in rankingFilteredConversations){
          if (rankingFilteredConversations[index].whatsappConversationAmount == 0){
            if (rankingFilteredConversations[index]['whatsappConversationCloseComment'] == 'Venta perdida' || rankingFilteredConversations[index]['whatsappConversationCloseComment'] == 'Venta para otro día' || rankingFilteredConversations[index]['whatsappConversationCloseComment'] == 'Consulta sobre productos' || rankingFilteredConversations[index]['whatsappConversationCloseComment'] == 'No contestó'){
              rankingFilteredConversations[index]['order'] = 0
            } else if (rankingFilteredConversations[index]['whatsappConversationCloseComment'] == 'Vuelve a escribir'){
              rankingFilteredConversations[index]['order'] = 3;
            } else if (rankingFilteredConversations[index]['whatsappConversationCloseComment'] == 'Error'){
              rankingFilteredConversations[index]['order'] = 2;
            } else {
              rankingFilteredConversations[index]['order'] = 1;
            }
            this.currentNotSelledConversations.push(rankingFilteredConversations[index]);
          } else {
            this.currentSelledConversations.push(rankingFilteredConversations[index]);
          }
        }

        this.currentNotSelledConversations.sort((a, b) => a.order - b.order);

        
        this.$root.$emit('bv::show::modal', 'conversationsModal');
        this.loader1 = false;
      });
    },

    getInformationByDate(){
      axios.post(constants.routes.backendAPI+'/selectFilteredPieChartInformation',
      {
        initialDate: this.rankingInitialDate,
        endDate: this.rankingEndDate
      }).then((response) =>{
        this.facturadoPorAgente = Object.values(response.data);
        this.opcionesGraficoCircular = 
        {
          chart: {width: 700, type: 'pie', fontSize: 20}, 
          tooltip: {enabled: false}, 
          labels: Object.keys(response.data),
          legend: {fontSize: '20px'},
          colors: this.getAgentColors(Object.keys(response.data))
        };
      });

      axios.post(constants.routes.backendAPI+'/selectFilteredBarChartInformation',
      {
        initialDate: this.rankingInitialDate,
        endDate: this.rankingEndDate
      }).then((response) =>{
        this.currentAgentInformation = response.data.result;
        this.opcionesGraficoBarra = 
        {
          chart: {
            events: {
              dataPointSelection: (event, chartContext, config) => {
                const agentIndex = config.dataPointIndex;
                const agentID = this.currentAgentInformation[agentIndex].agentID;
                this.openAgentDetail(agentID);
              }
            },
          type: 'bar', height: 350, stacked: true},
          plotOptions: {bar: { horizontal: false, borderRadius: 10}},
          xaxis: {type: 'string', categories: response.data.result.map(agent => agent.agentName),
          labels: {style: {fontSize: '20px'}}},
          fill: {colors: ['#008a07', '#d10015'], opacity: 1},
          legend: {show: false}
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

      axios.post(constants.routes.backendAPI+'/selectFilteredTodayInformation',
      {
        initialDate: this.rankingInitialDate,
        endDate: this.rankingEndDate
      }).then((response) =>{
        this.conversacionesTotales = response.data.result[0].whatsappTotalConversations;
        this.conversacionesVendidas = response.data.result[0].whatsappSelledConversations;
        this.conversacionesNoVendidas = response.data.result[0].whatsappNotSelledConversations;
      });

      axios.post(constants.routes.backendAPI+'/selectFilteredTodayTopSell',
      {
        initialDate: this.rankingInitialDate,
        endDate: this.rankingEndDate
      }).then((response) =>{
        this.vendedoraDelDia = response.data.result;
      });
    },


    getTodayInformation(){
      axios.get(constants.routes.backendAPI+'/selectPieChartInformation').then((response) =>{
        this.facturadoPorAgente = Object.values(response.data);
        this.opcionesGraficoCircular = 
        {
          chart: {width: 700, type: 'pie', fontSize: 20}, 
          tooltip: {enabled: true}, 
          labels: Object.keys(response.data),
          legend: {fontSize: '20px'},
          colors: this.getAgentColors(Object.keys(response.data))
        };
      });

      axios.get(constants.routes.backendAPI+'/selectBarChartInformation').then((response) =>{
        this.currentAgentInformation = response.data.result;

        this.opcionesGraficoBarra = 
        {
          chart: {
            events: {
              dataPointSelection: (event, chartContext, config) => {
                const agentIndex = config.dataPointIndex;
                const agentID = this.currentAgentInformation[agentIndex].agentID;
                this.openAgentDetail(agentID);
              }
            }, 
          type: 'bar', height: 350, stacked: true},
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
        console.log(response.data.result.map(agent => agent.agentName));
      });

      axios.get(constants.routes.backendAPI+'/selectTodayInformation').then((response) =>{
        this.conversacionesTotales = response.data.result.total.whatsappTotalConversations;
        this.conversacionesVendidas = response.data.result.total.whatsappSelledConversations;
        this.conversacionesNoVendidas = response.data.result.total.whatsappNotSelledConversations;
      });

      axios.get(constants.routes.backendAPI+'/selectTodayTopSell').then((response) =>{
        this.vendedoraDelDia = response.data.result;
      });

    },
  },
};
</script>

<style></style>
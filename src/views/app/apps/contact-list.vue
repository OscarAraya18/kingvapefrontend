<template>
  
  <div class="main-content">
    <br>
    <b-modal scrollable size="lg" centered id="bigImageModal" hide-footer hide-header>
      <img style="width: 1000px;" :src="bigImageSource">
    </b-modal>


    <b-modal scrollable size="lg" centered id="IDModal" hide-footer hide-header>
      <div v-if="loaderID == true" style="text-align: center;">
        <br>
        <span class="spinner-glow spinner-glow-primary"></span>
      </div>
      
      <div v-else>
        <div v-if="IDModalSource">
          <img v-if="IDModalType == 'image'" style="width: 1000px;" :src="IDModalSource">
          <iframe v-else :src="IDModalSource" width="100%" height="600px"></iframe>
        </div>
        <div v-else>
          Sin cédula
        </div>
        
      </div>
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
          <MapComponent mapHeight="450px" mapWidth="600px" :clientLongitude="getLocation(historyMessage).lng" :clientLatitude="getLocation(historyMessage).lat"></MapComponent>

          <br>
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

    <div v-if="agentType == 'admin'">
      <h3><strong>Cantidad de contactos:</strong> {{contactAmount}}</h3>
      <br><br>
    </div>

    <b-form-input v-model="contactPhoneNumber" @keyup.enter="openContactFromPhoneNumber()" placeholder='Número de teléfono' style='margin-bottom: 10px;'></b-form-input>
    <br>

    <b-form-select v-model="contactLetter" class="mb-3" :options="contactLettersOptions" @change="getContacts">
    </b-form-select>
    <br><br>

    <div v-if="loaderContact==true" style="text-align: center;">
      <br>
      <span class="spinner-glow spinner-glow-primary"></span>
    </div>

    <b-card v-else>
      <vue-good-table
        :columns="contactColumns"
        :line-numbers="false"
        :search-options="{
          enabled: true,
          placeholder: 'Coloca el nombre o número del contacto',
        }"
        styleClass="tableOne vgt-table"
        :rows="contactRows"
      >
      
        <div slot="table-actions" class="m-3">
          <b-button
            @click="openCreateContactModal()"
            variant="primary"
            class="btn-icon btn d-none d-sm-block"
            v-b-modal.modalCrear
            ><i class="i-Add-User mr-2"> </i>Crear contacto
          </b-button>
        </div>
        


        <template slot="table-row" slot-scope="props">
          

          
          <div v-if="props.column.field == 'contactID'">
            <div v-if="props.row.contactID != '0' && props.row.contactID != '1'" style="background-color: #337a46; text-align: center; border-radius: 10px; width: 100px; margin-top: 15px;">
              <p style="color: white;">{{ props.row.contactID }}</p>
            </div>
            <div v-else style="background-color: #942121; text-align: center; border-radius: 10px; width: 100px; margin-top: 15px;">
              <p style="color: white;">Sin cédula</p>
            </div>
          </div>

          <div v-else-if="props.column.field == 'contactName'" style="width: 300px;">
            {{ props.row.contactName }}
          </div>

          <div v-else-if="props.column.field == 'contactPhoneNumber'">
            {{ parseNumber(props.row.contactPhoneNumber) }}
          </div>

          <div v-if="props.column.field == 'contactEmail'" style="width: 300px;">
            <div v-if="props.row.contactEmail.includes('@')" style="background-color: #e39e59; text-align: center; border-radius: 10px; width: 300px; margin-top: 15px;">
              <p style="color: white;">{{ props.row.contactEmail }}</p>
            </div>
            <div v-else style="background-color: #942121; text-align: center; border-radius: 10px; width: 100px; margin-top: 15px;">
              <p style="color: white;">Sin correo</p>
            </div>
          </div>

          <span v-else-if="props.column.field == 'contactLocations'">
            <button @click="openContactLocationsModal(props.row.contactLocations)" v-b-modal.contactLocationsModal class="btn btn-success" type="button">Ver ubicaciones</button>

          </span>

          <span v-else-if="props.column.field == 'contactActions'">
              <i v-if="props.row.contactHasIDImage" @click="selectClientIDSImage(props.row.contactPhoneNumber)" class="i-ID-Card text-25 text-black"  style="cursor: pointer; margin-right: 10px;"></i>
              <i class="i-Clock text-25 text-info" @click="getHistoryConversations(props.row.contactPhoneNumber)" v-b-modal.modalHistorial style="cursor: pointer; margin-right: 10px;"></i>
              <i class="i-Notepad text-25 text-warning" @click="openSendContactMessageModal(props.row)" v-b-modal.sendContactMessageModal style="cursor: pointer; margin-right: 7px;"></i>
          </span>


        </template>
      </vue-good-table>

      <b-modal scrollable size="m" centered hide-footer id="modalHistorial" title="Historial de conversaciones">
        <div v-if="historyLoader == false">
          <div style="display: flex;">
            
            <b-list-group style="width: 80%">
              <b-list-group-item v-if="historyConversations.length == 0">
                No hay conversaciones en el historial
              </b-list-group-item>
              <b-list-group-item v-b-modal.historyOpenModal style="cursor: pointer" v-for="historyConversation in historyConversations" @click="openHistoryConversation(historyConversation)" button>
                <div style="height: 100px; display: flex; align-items: center;">
                  <div>
                    <strong>Atendido por:</strong> {{historyConversation.agentName}}<br>
                    <strong>Resultado:</strong> {{historyConversation.whatsappConversationCloseComment}}<br>
                    <strong>Inicio:</strong> {{parseHour(historyConversation.whatsappConversationStartDateTime)}}<br>
                    <strong>Fin:</strong> {{parseHour(historyConversation.whatsappConversationEndDateTime)}}<br>
                  </div>
                </div>
              </b-list-group-item>
            </b-list-group>

            <b-list-group style="width: 20%">
              <b-list-group-item v-if="historySells.length == 0">
                NA
              </b-list-group-item>
              <b-list-group-item style="cursor: pointer;" v-for="historySell in historySells" button>
                <div v-b-modal.openSell @click="openSell(historySell)" v-if="historySell.length != 0" style="height: 100px; display: flex; justify-content: center; align-items: center;">
                  <p style="font-size: 30px;">🛒</p>
                </div>
                <div v-else style="height: 100px; display: flex; justify-content: center; align-items: center;">
                  <p style="font-size: 30px;">❌</p>
                </div>              
              </b-list-group-item>
            </b-list-group>

          </div>
        </div>
        <div v-else style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
      </b-modal>

      <b-modal scrollable size="m" centered hide-footer id="openSell" hide-header>
        <b-list-group>
          <b-list-group-item v-for="product in currentSell">
            <div>
              <strong>Código:</strong> {{product.CodigoP}}<br>
              <strong>Nombre:</strong> {{product.descripcion}}<br>
              <strong>Cantidad:</strong> {{product.cantidad}}<br>
              <strong>Precio:</strong> {{product.precio}}<br>
              <strong>Descuento:</strong> {{product.descuento}}<br>
            </div>
          </b-list-group-item>
        </b-list-group>
      </b-modal>

      <b-modal scrollable size="lg" centered hide-footer id="historyOpenModal" hide-header v-if="currentHistoryConversation != null">
        <div v-if="openHistoryLoader == true" style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
        <div v-else>
          <div v-for="currentActiveConversationMessage in currentHistoryConversation.whatsappConversationMessages">
            
            <div class="d-flex mb-30" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
              <div :style="getMessageOwnerColor(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)" class="message flex-grow-1">
                <div class="d-flex">
                  <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                      <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                        
                        <div v-if="currentHistoryConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                          <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                        </div>
                        
                        <div v-for="answeredMessage in currentHistoryConversation.whatsappConversationMessages">
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
                              <MapComponent mapHeight="250px" mapWidth="600px" :clientLongitude="getLocation(answeredMessage).lng" :clientLatitude="getLocation(answeredMessage).lat"></MapComponent>

                              <br>
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
                      <MapComponent mapHeight="250px" mapWidth="600px" :clientLongitude="getLocation(currentActiveConversationMessage).lng" :clientLatitude="getLocation(currentActiveConversationMessage).lat"></MapComponent>

                      <br>
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
                        
                        <div v-if="currentHistoryConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                          <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                        </div>
                        
                        <div v-for="answeredMessage in currentHistoryConversation.whatsappConversationMessages">

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
                              <MapComponent mapHeight="250px" mapWidth="600px" :clientLongitude="getLocation(answeredMessage).lng" :clientLatitude="getLocation(answeredMessage).lat"></MapComponent>

                              <br>
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
                      <MapComponent mapHeight="450px" mapWidth="600px" :clientLongitude="getLocation(currentActiveConversationMessage).lng" :clientLatitude="getLocation(currentActiveConversationMessage).lat"></MapComponent>

                      <br>
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

      <b-modal id="contactLocationsModal" size="lg" hide-footer hide-header centered>
        <div v-if="contactLocations" style="text-align: center; padding: 20px;">
          <b-card style="background-color: #e8e8e8">
            <h4><strong>CASA:</strong></h4>
            <div v-if="contactLocations['CASA'].latitude != '0'" style="text-align: center;">
              <br>
              <MapComponent mapHeight="300px" mapWidth="100%" :clientLongitude="contactLocations['CASA'].longitude" :clientLatitude="contactLocations['CASA'].latitude"></MapComponent>
            </div>
            <p v-else>Sin ubicación registrada</p>
          </b-card>
          <br><br>
          <b-card style="background-color: #e8e8e8">
            <h4><strong>TRABAJO:</strong></h4>
            <div v-if="contactLocations['TRABAJO'].latitude != '0'" style="text-align: center;">
              <br>
              <MapComponent mapHeight="300px" mapWidth="100%" :clientLongitude="contactLocations['TRABAJO'].longitude" :clientLatitude="contactLocations['TRABAJO'].latitude"></MapComponent>
            </div>
            <p v-else>Sin ubicación registrada</p>
          </b-card>
          <br><br>
          <b-card style="background-color: #e8e8e8">
            <h4><strong>OTRO:</strong></h4>
            <div v-if="contactLocations['OTRO'].latitude != '0'" style="text-align: center;">
              <br>
              <MapComponent mapHeight="300px" mapWidth="100%" :clientLongitude="contactLocations['OTRO'].longitude" :clientLatitude="contactLocations['OTRO'].latitude"></MapComponent>
            </div>
            <p v-else>Sin ubicación registrada</p>
          </b-card>
        </div>
      </b-modal>

      <b-modal id="sendContactMessageModal" title="Enviar mensaje al contacto" @ok="sendWhatsappTextMessage()" centered>
        <div class="p-2">
            <b-form-select v-model="selectedMessageType" :options="messageTypes"></b-form-select>
            <br><br>
            <b-form-textarea class="form-control" label="note" v-model="sendingMessage" rows="3">
            </b-form-textarea>
            
        </div>
      </b-modal>

      <b-modal @ok="createContact()" id="modalCrear" title="Crear contacto" ref="modalCrear" centered>
        <div class="p-3">
          <b-form-input v-model="creatingPhoneNumber" placeholder="Número de teléfono del contacto"></b-form-input>
          <br>
          <b-form-input v-model="creatingName" placeholder="Nombre del contacto"></b-form-input>
        </div>
      </b-modal>

    </b-card>
  </div>
</template>

<script>
import axios from 'axios';
import router from "../../../router"; 

const constants = require('@../../../src/constants.js'); 
import * as VueGoogleMaps from 'vue2-google-maps'
import MapComponent from '../../../components/mapComponent.vue';


export default {
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "Task Manager",
  },
  components: {
    MapComponent
  },

  data() {
    return {
      messageTypes: 
      [
        { value: null, text: 'Seleccione un tipo de mensaje' },
        { value: 'Seguimiento de producto', text: 'Seguimiento de producto'},
        { value: 'Envío de guía', text: 'Envío de guía'},
        { value: 'Otro', text: 'Otro'},
      ],
      selectedMessageType: null,

      contactPhoneNumber: '',

      cartagoMap: [],
      cartagoMapOptions: {},
      herediaMap: [],
      herediaMapOptions: {},
      escazuMap: [],
      escazuMapOptions: {},
      zapoteMap: [],
      zapoteMapOptions: {},
      redMap: [],
      redMapOptions: {},

      contactAmount: 0,

      historyMessageLoader: false,
      historyMessage: null,

      historyLoader: false,
      historyConversations: [],
      historySells: [],

      contactLetter: null,
      contactLettersOptions: [{value:null,text:'Seleccione una letra para buscar los contactos'},{value:'A',text:'A'},{value:'B',text:'B'},{value:'C',text:'C'},{value:'D',text:'D'},{value:'E',text:'E'},{value:'F',text:'F'},{value:'G',text:'G'},{value:'H',text:'H'},{value:'I',text:'I'},{value:'J',text:'J'},{value:'K',text:'K'},{value:'L',text:'L'},{value:'M',text:'M'},{value:'N',text:'N'},{value:'O',text:'O'},{value:'P',text:'P'},{value:'Q',text:'Q'},{value:'R',text:'R'},{value:'S',text:'S'},{value:'T',text:'T'},{value:'U',text:'U'},{value:'V',text:'V'},{value:'W',text:'W'},{value:'X',text:'X'},{value:'Y',text:'Y'},{value:'Z',text:'Z'}],

      selectedContactLocation: '',
      loaderContact: false,

      allContactsInformation: [],

      sendingMessage: '',

      contactColumns: [
        {
          label: "Cédula",
          field: "contactID",
        },
        {
          label: "Nombre",
          field: "contactName",
        },
        {
          label: "Número",
          field: "contactPhoneNumber"
        },
        {
          label: "Correo electrónico",
          field: "contactEmail",
        },
        {
          label: "Ubicación",
          field: "contactLocations"
        },
        {
          label: "",
          field: "contactActions",
          html: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
      ],
      contactRows: [],

      originalEditingPhoneNumber: '',
      editingPhoneNumber: '',
      editingID: '',
      editingName: '',
      editingEmail: '',
      editingLocationDetails: '',
      editingNote: '',

      creatingPhoneNumber: '',
      creatingID: '',
      creatingName: '',
      creatingEmail: '',
      creatingLocationDetails: '',
      creatingNote: '',

      sendingID: '',
      agentType: '',

      currentHistoryConversation: null,
      zoom: 15,
      currentSell: [],
      
      bigImageSource: null,

      loaderID: false,
      IDModalSource: null,
      IDModalType: null,

      contactLocations: null,
      sendingContact: null
    };

    
  },

  mounted(){
    this.cartagoMap = constants.routes.cartagoMap;
    this.cartagoMapOptions = constants.routes.cartagoMapOptions;
    this.herediaMap = constants.routes.herediaMap;
    this.herediaMapOptions = constants.routes.herediaMapOptions;
    this.zapoteMap = constants.routes.zapoteMap;
    this.zapoteMapOptions = constants.routes.zapoteMapOptions;
    this.escazuMap = constants.routes.escazuMap;
    this.escazuMapOptions = constants.routes.escazuMapOptions;
    this.redMap = constants.routes.redMap;
    this.redMapOptions = constants.routes.redMapOptions;
    
    if (localStorage.getItem('agentID') == null){
      router.push("/app/sessions/signIn");
    }
    this.getContactAmount();
    this.sendingMessage = localStorage.getItem('agentStartMessage');
    this.agentType = localStorage.getItem('agentType');
  },

  methods: {
    openContactLocationsModal(contactLocations){
      this.contactLocations = contactLocations;
    },

    selectClientIDSImage(clientIDSPhoneNumber){
      this.loaderID = true;
      this.IDModalSource = null;
      this.IDModalType = null;
      this.$root.$emit('bv::show::modal', 'IDModal');
      
      axios.post(constants.routes.backendAPI+'/selectClientIDSImage',
      {
        'clientIDSPhoneNumber': clientIDSPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          if (response.data.result.source){
            if (response.data.result.type == 'image'){
              this.IDModalSource = `data:image/png;base64,${response.data.result.source}`;
              this.IDModalType = response.data.result.type;
              this.loaderID = false;
            } else {
              const binaryString = window.atob(response.data.result.source);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: 'application/pdf' });
              this.IDModalSource = URL.createObjectURL(blob);
              this.IDModalType = response.data.result.type;
              this.loaderID = false;
            }
          } else {
            this.loaderID = false;

          }
        } else {
          this.showNotification('danger', 'Error al abrir la cédula del cliente', 'Ha ocurrido un error inesperado abrir la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.$root.$emit('bv::hide::modal', 'IDModal');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al abrir la cédula del cliente', 'Ha ocurrido un error inesperado abrir la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.$root.$emit('bv::hide::modal', 'IDModal');
      })
      
    },

    getContactAmount(){
      axios.get(constants.routes.backendAPI+'/selectContactAmount')
      .then((response) => {
        if (response.data.success){
          this.contactAmount = response.data.result[0].contactAmount;
        } else {
          this.showNotification('danger', 'Error al consultar la cantidad de contactos', 'Ha ocurrido un error inesperado al consultar la cantidad de contactos. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar la cantidad de contactos', 'Ha ocurrido un error inesperado al consultar la cantidad de contactos. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
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

    parseNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    openSell(historySell){
      this.currentSell = historySell;
      this.$root.$emit('bv::hide::modal','historyConversationsModal');
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

    openHistoryConversation(historyConversation){
      this.openHistoryLoader = true;
      this.currentHistoryConversation = {};
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        whatsappConversationID: historyConversation.whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.$root.$emit('bv::hide::modal','historyConversationsModal');
          this.currentHistoryConversation = response.data.result[historyConversation.whatsappConversationID];
          this.openHistoryLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    openContactFromPhoneNumber(){
      axios.post(constants.routes.backendAPI+'/selectContact', 
      {
        contactPhoneNumber: this.contactPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Contacto encontrado', 'El nombre del cliente es "' + response.data.result[0].contactName + '".');
        } else {
          this.showNotification('danger', 'Error al buscar el contacto', 'Ha ocurrido un error inesperado al buscar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        console.log(error);
        this.showNotification('danger', 'Error al buscar el contacto', 'Ha ocurrido un error inesperado al buscar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    openHistoryConversationFromConversationID(){
      this.openHistoryLoader = true;
      this.currentHistoryConversation = {};
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        whatsappConversationID: this.conversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.$root.$emit('bv::show::modal','historyOpenModal');
          this.currentHistoryConversation = response.data.result[this.conversationID];
          this.openHistoryLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    getHistoryConversations(phone){
      this.historyLoader = true;
      this.historyConversations = [];
      this.historySells = [];
      axios.post(constants.routes.backendAPI+'/selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber', 
      {
        whatsappConversationRecipientPhoneNumber: phone
      })
      .then((response) =>{
        if (response.data.success){
          this.historyConversations = response.data.result;
          this.historyLoader = false;
          for (var historyConversation in this.historyConversations){
            const historySell = JSON.parse(this.historyConversations[historyConversation].whatsappConversationProducts);
            this.historySells.push(historySell);
          }
        } else {
          this.showNotification('danger', 'Error al consultar las conversaciones del historial', 'Ha ocurrido un error inesperado al consultar las conversaciones del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar las conversaciones del historial', 'Ha ocurrido un error inesperado al consultar las conversaciones del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    openContactLocation(location){
      this.selectedContactLocation = location;
    },

    openCreateContactModal(){
      this.creatingPhoneNumber = '506';
      this.creatingID = '';
      this.creatingName = '';
      this.creatingEmail = '';
      this.creatingLocationDetails = '';
      this.creatingNote = '';
    },

    sendWhatsappTextMessage(){
      const whatsappConversationRecipientPhoneNumber = this.sendingContact.contactPhoneNumber;
      const whatsappConversationRecipientProfileName = this.sendingContact.contactName;

      axios.post(constants.routes.backendAPI+'/sendWhatsappTextMessageFromContactList',
      {
        whatsappConversationRecipientPhoneNumber: whatsappConversationRecipientPhoneNumber,
        whatsappConversationRecipientProfileName: whatsappConversationRecipientProfileName,
        whatsappTextMessageBody: this.sendingMessage,
        whatsappConversationAssignedAgentID: parseInt(localStorage.getItem('agentID')),
        messageType: this.selectedMessageType
      })
      .then((response) =>{ 
        if (response.data.success){
          this.$bvToast.toast("Se ha enviado exitosamente el mensaje al contacto con el número '" + whatsappConversationRecipientPhoneNumber + "'.", {
            title: "Mensaje enviado",
            variant: "success",
            solid: true
          });
        } else {
          this.$bvToast.toast("Ha ocurrido un error inesperado al enviar el mensaje. Esto puede deberse a que el contact ya tiene una conversación activa con un agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al enviar el mensaje",
            variant: "danger",
            solid: true
          });
        }
      })
      .catch(() =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al enviar el mensaje",
          variant: "danger",
          solid: true
        });
      })
    },

    createContact(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.creatingPhoneNumber) && regularExpressionChecker.test(this.creatingName)) {
        axios.post(constants.routes.backendAPI+'/insertContact', 
        {
          'contactPhoneNumber': this.creatingPhoneNumber, 
          'contactID': this.creatingID, 
          'contactName': this.creatingName, 
          'contactEmail': this.creatingEmail, 
          'contactLocationDetails': this.creatingLocationDetails, 
          'contactNote': this.creatingNote
        })
        .then((response) =>{ 
          if (response.data.success){
            this.$bvToast.toast("Se ha creado exitosamente el contacto con el número '" + this.creatingPhoneNumber + "'.", {
              title: "Contacto creado",
              variant: "success",
              solid: true
            });
            this.creatingPhoneNumber = '';
            this.creatingName = '';
            this.creatingEmail = '';
            this.creatingLocationDetails = '';
            this.creatingNote = '';
            this.contactRows = [];
            this.$refs['modalCrear'].hide();
            this.getContacts();
          } else {
            this.$bvToast.toast("Ya existe un contacto asociado al número '" + this.creatingPhoneNumber + "', por favor modifique la información e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Número de contacto duplicado",
              variant: "danger",
              solid: true
            });
          }
        })
        .catch(error =>{
          this.$bvToast.toast("Ha ocurrido un error inesperado al crear el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al crear el contacto",
          variant: "danger",
          solid: true
          });
        })
      } else {
        this.$bvToast.toast('El contenido de la información del contacto no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al crear el contacto',
          variant: 'danger',
          solid: true
        });
      }
    },


    openSendContactMessageModal(contact){
      this.sendingMessage = localStorage.getItem('agentStartMessage');
      this.sendingContact = contact;
    },


    getContacts(){
      this.loaderContact = true;
      this.contactRows.length = 0;
      this.allContactsInformation.length = 0;

      axios.post(constants.routes.backendAPI+'/selectContactsFromStartingLetter', 
      {
        'startingLetter': this.contactLetter
      })
      .then((response) =>{ 
        this.allContactsInformation = response.data.result;

        console.log(response.data.result);

        this.contactRows = response.data.result.map(contact => ({
          'contactID': contact.i,
          'contactName': contact.n,
          'contactPhoneNumber': contact.p,
          'contactEmail': contact.e,
          'contactLocations': JSON.parse(contact.l),
          'contactHasIDImage': contact.ip
        }));
        this.loaderContact = false;
      })
      .catch(() =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al consultar la lista de clientes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar la lista de clientes",
          variant: "danger",
          solid: true
        });
      })
    }
  },
};
</script>
<style></style>

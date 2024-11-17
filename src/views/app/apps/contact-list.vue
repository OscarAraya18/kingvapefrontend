<template>
  
  <div class="main-content">



    <b-row v-if="agentType == 'admin'">

      <b-col lg="6" md="6" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          :style="getTagStyle(1)"
          @click="view='Lista de contactos'"
        >
          <i class="i-Search-People"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Lista de contactos</p>
          </div>
        </b-card>
      </b-col>

      <b-col lg="6" md="6" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          :style="getTagStyle(2)"
          @click="view='Seguimiento de clientes'"
        >
          <i class="i-Money-2"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Seguimiento de clientes</p>
          </div>
        </b-card>
      </b-col>


    </b-row>
    
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

    <div v-if="view == 'Lista de contactos'">

    <div v-if="agentType == 'admin'">
      <h3><strong>Cantidad de contactos:</strong> {{contactAmount}}</h3>
      <br><br>
    </div>

    <b-form-input v-model="contactPhoneNumber" @keyup.enter="openContactFromPhoneNumber()" placeholder='Número de teléfono' style='margin-bottom: 10px;'></b-form-input>
    <br>

    <b-form-select v-model="contactLetter" class="mb-3" :options="contactLettersOptions" :disabled="loaderContact" @change="getContacts()">
    </b-form-select>
    <br><br>

    <div v-if="loaderContact==true" style="text-align: center;">
      <br>
      <span class="spinner-glow spinner-glow-primary"></span>
    </div>

    <b-card ref="contactContainer" v-else style="background-color: #e8e8e8; max-height: 750px; overflow-y: auto;">

      <vue-good-table
        :columns="contactColumns"
        :line-numbers="false"
        :search-options="{
          enabled: true,
          placeholder: 'Nombre o número del contacto',

        }"
        styleClass="tableOne vgt-table"
        :rows="displayedContactRows"
      >
      
        <div slot="table-actions" class="m-3">

          <div style="display: flex;">
            <b-form-select v-model="contactType" :options="['Todos', 'Reloj', 'Equis']" style="width: 200px; margin-right: 10px;"></b-form-select>

            <b-button
              @click="openCreateContactModal()"
              variant="primary"
              class="btn-icon btn d-none d-sm-block"
              v-b-modal.modalCrear
              ><i class="i-Add-User mr-2"> </i>Crear contacto
            </b-button>
          </div>
        </div>
        


        <template slot="table-row" slot-scope="props">
          
          <div v-if="props.column.field == 'contactFollowup'">
            <i v-if="isMoreThan30Days(props.row.lastDate)" class="i-Loading-2 text-25 text-danger"></i>
            <div v-else>
              <i v-if="props.row.lastDate" class="i-Check text-25 text-success"></i>
              <i v-else class="i-Close text-25 text-gray"></i>
            </div>

          </div>
          
          <div v-if="props.column.field == 'contactID'">
            <div v-if="props.row.contactID != '0' && props.row.contactID != '1'" style="background-color: #337a46; text-align: center; border-radius: 10px; width: 100px; margin-top: 15px;">
              <p style="color: white;">{{ props.row.contactID }}</p>
            </div>
            <div v-else style="background-color: #942121; text-align: center; border-radius: 10px; width: 100px; margin-top: 15px;">
              <p style="color: white;">No registrada</p>
            </div>
          </div>

          <div v-else-if="props.column.field == 'contactName'" style="width: 300px;">
            {{ props.row.contactName }}
          </div>

          <div v-else-if="props.column.field == 'contactPhoneNumber'">
            {{ parseNumber(props.row.contactPhoneNumber) }}
          </div>

          <div v-else-if="props.column.field == 'totalInvoiceAmount'">
            ₡{{props.row.totalInvoiceAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}
          </div>
          
          
          

          <div v-else-if="props.column.field == 'contactEmail'" style="width: 300px;">
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
              <i  @click="selectClientIDSImage(props.row.contactPhoneNumber)" class="i-ID-Card text-25 text-black"  style="cursor: pointer; margin-right: 10px;"></i>
              <i class="i-Clock text-25 text-info" @click="getHistoryConversations(props.row.contactPhoneNumber)" v-b-modal.historyConversationsModal style="cursor: pointer; margin-right: 10px;"></i>
              <i class="i-Notepad text-25 text-warning" @click="openSendContactMessageModal(props.row)" style="cursor: pointer; margin-right: 7px;"></i>
              <i class="i-Eraser-2 text-25 text-success mr-2" @click="openEdit(props.row.contactPhoneNumber)" v-b-modal.modalEditar style="cursor: pointer"></i>
          </span>


        </template>
      </vue-good-table>



      <b-modal scrollable size="lg" centered hide-footer hide-header id="historyConversationsModal">
            <div v-if="historyLoader == true" style="text-align: center;">
              <br><span class="spinner-glow spinner-glow-primary"></span>
            </div>
            <div v-else>

              <b-card style="background-color: #e8e8e8">

                <div ref='historyScroll' style="max-height: 500px; overflow-y: auto;">
                  <vue-good-table
                    :columns="historyConversationsColumns"
                    :line-numbers="false"
                    styleClass="order-table vgt-table"
                    :rows="historyConversations"
                    >
                    <template slot="table-row" slot-scope="props">

                      <div v-if="props.column.field == 'agentName'">
                        <div :style="{backgroundColor: props.row.agentColor}" style="text-align: center; border-radius: 10px;">
                          <p :style="{color: props.row.agentFontColor}">{{props.row.agentName}}</p>

                        </div>
                      </div>

                      <div v-else-if="props.column.field == 'whatsappConversationStartDateTime'">
                        <p>{{parseHour(props.row.whatsappConversationStartDateTime)}}</p>
                      </div>
                      <div v-else-if="props.column.field == 'whatsappConversationEndDateTime'">
                        <p>{{parseHour(props.row.whatsappConversationEndDateTime)}}</p>
                      </div>
                      <div v-else-if="props.column.field == 'whatsappConversationActions'">
                        <i v-if='props.row.whatsappConversationAmount != 0' :id="'productos'+props.row.whatsappConversationID" class="i-Shopping-Cart text-25 text-info" style="cursor: pointer; margin-right: 10px;"></i>
                        
                        <b-tooltip v-if='JSON.parse(props.row.whatsappConversationProducts).length != 0' :target="'productos'+props.row.whatsappConversationID" triggers="hover" variant="info" placement="left">
                          <div v-for="whatsappConversationProduct in JSON.parse(props.row.whatsappConversationProducts)">
                            <p><strong>{{ whatsappConversationProduct.descripcion }}: </strong>{{whatsappConversationProduct.cantidad}}</p>
                          </div>
                        </b-tooltip>

                        <i class="i-Notepad text-25 text-warning" @click="openHistoryConversation(props.row)" v-b-modal.historyOpenModal style="cursor: pointer; margin-right: 7px;"></i>
                      </div>
                    </template>
                  </vue-good-table>
                </div>
                
              </b-card>

              <br>
              <b-card style="background-color: #e8e8e8">
                <p v-if="historyConversations.filter(historyConversation => historyConversation.whatsappConversationAmount != 0 ).length != 0" style="font-size: medium; margin: 0;"><strong>Primera compra: </strong> {{parseHour(historyConversations.filter(historyConversation => historyConversation.whatsappConversationAmount != 0 )[0].whatsappConversationEndDateTime)}}</p>
                <p v-if="historyConversations.filter(historyConversation => historyConversation.whatsappConversationAmount != 0 ).length != 0" style="font-size: medium; margin: 0;"><strong>Última compra: </strong> {{parseHour(historyConversations.filter(historyConversation => historyConversation.whatsappConversationAmount != 0 )[historyConversations.filter(historyConversation => historyConversation.whatsappConversationAmount != 0 ).length - 1].whatsappConversationEndDateTime)}}</p>
                <p style="font-size: medium; margin: 0;"><strong>Cantidad de compras: </strong> {{historyConversations.filter(historyConversation => historyConversation.whatsappConversationAmount != 0 ).length}}</p>
              </b-card>
              
            </div>  
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
            <p v-else style="margin-bottom: 0px;">Sin ubicación registrada</p>
          </b-card>
          <br><br>
          <b-card style="background-color: #e8e8e8">
            <h4><strong>TRABAJO:</strong></h4>
            <div v-if="contactLocations['TRABAJO'].latitude != '0'" style="text-align: center;">
              <br>
              <MapComponent mapHeight="300px" mapWidth="100%" :clientLongitude="contactLocations['TRABAJO'].longitude" :clientLatitude="contactLocations['TRABAJO'].latitude"></MapComponent>
            </div>
            <p v-else style="margin-bottom: 0px;">Sin ubicación registrada</p>
          </b-card>
          <br><br>
          <b-card style="background-color: #e8e8e8">
            <h4><strong>OTRO:</strong></h4>
            <div v-if="contactLocations['OTRO'].latitude != '0'" style="text-align: center;">
              <br>
              <MapComponent mapHeight="300px" mapWidth="100%" :clientLongitude="contactLocations['OTRO'].longitude" :clientLatitude="contactLocations['OTRO'].latitude"></MapComponent>
            </div>
            <p v-else style="margin-bottom: 0px;">Sin ubicación registrada</p>
          </b-card>
        </div>
      </b-modal>

      <b-modal id="sendContactMessageModal" title="Enviar mensaje al contacto" @ok="sendWhatsappTextMessage()" @hidden="closeContactModal()" centered>
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

      <b-modal id="modalEditar" title="Editar contacto" hide-footer ref="modalEditar" centered> 
        <div class="p-3">
          <b-form @submit.prevent="submit">
            <b-form-group label="Número del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="ID"
                v-model="editingPhoneNumber"
              >
              </b-form-input>
            </b-form-group>
            
            <b-form-group label="Nombre del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="Name"
                v-model="editingName"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Cédula del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="ID"
                v-model="editingID"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Correo electrónico del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="email"
                v-model="editingEmail"
              >
              </b-form-input>
            </b-form-group>

            <br>

            <b-button
              type="submit"
              block
              variant="primary"
              class="btn-icon btn"
              >Guardar cambios</b-button
            >

          </b-form>
        </div>
      </b-modal>

    </b-card>
  </div>

  
  <div v-else>
    
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
      
    <div style="display: flex; justify-content: center; align-items: center;">
      <div style="display: flex; width: 33%; justify-content: center; align-items: center;">
        <i class="i-Check text-50 text-success"></i>
        <p style="font-size: x-large; margin-left: 15px; margin-top: 15px;">{{ clientFollowupReport.filter(client => client.lastDate != null).filter(client => isMoreThan30Days(client.lastDate) == false).length }}</p>
      </div>
      <div style="display: flex; width: 33%; justify-content: center; align-items: center;">
        <i class="i-Loading-2 text-50 text-danger"></i>
        <p style="font-size: x-large; margin-left: 15px; margin-top: 15px;">{{ clientFollowupReport.filter(client => client.lastDate != null).filter(client => isMoreThan30Days(client.lastDate) == true).length }}</p>
      </div>
      <div style="display: flex; width: 33%; justify-content: center; align-items: center;">
        <i class="i-Close text-50 text-gray"></i>
        <p style="font-size: x-large; margin-left: 15px; margin-top: 15px;">{{ clientFollowupReport.filter(client => client.lastDate == null).length }}</p>
      </div>
    </div>
    <br><br><br>

    <div style="display: flex;">
      <div style="width: 30%; margin-right: 5%;">
        <h4><strong>Filtro por fecha inicial:</strong></h4>
        <b-form-datepicker v-model="initialDateFiltered"></b-form-datepicker>
        <br>
        <h4><strong>Filtro por fecha final:</strong></h4>
        <b-form-datepicker v-model="endDateFiltered"></b-form-datepicker>
        <br>
        <h4><strong>Filtro por agente:</strong></h4>
        <b-form-select v-model="agentFiltered" class="mb-3" :options="agentOptions"></b-form-select>
      </div>

      <div style="width: 45%; display: flex;">
        <apexchart v-if="opcionesGraficoTotal != null && datosGraficoTotal.length != 0" type="pie" width="300" :options="opcionesGraficoTotal" :series="datosGraficoTotal"></apexchart>
        <apexchart v-if="opcionesGraficoVenta != null && datosGraficoVenta.length != 0" type="pie" width="400" :options="opcionesGraficoVenta" :series="datosGraficoVenta"></apexchart>
        <apexchart v-if="opcionesGraficoContacto != null && datosGraficoContacto.length != 0" type="pie" width="400" :options="opcionesGraficoContacto" :series="datosGraficoContacto"></apexchart>

      </div>
    </div>
    
    <br><br>

    <div v-if="loaderReport" style="text-align: center;">
      <br>
      <span class="spinner-glow spinner-glow-primary"></span>
    </div>
    <div v-else>

      <b-card style="background-color: #e8e8e8; max-height: 750px; overflow-y: auto;">

        <br>
        
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3><strong>Total de seguimientos:</strong> {{ clientReport.length }}</h3>
            <h3><strong>Vendidos:</strong> {{ clientReport.filter(report => report.whatsappConversationCloseComment == 'Venta').length }}</h3>
            <h3><strong>No vendidos:</strong> {{ clientReport.filter(report => report.whatsappConversationCloseComment != 'Venta').length }}</h3>
            <h3><strong>Recuperado:</strong> ₡ {{ this.clientReport.reduce((total, item) => {return total + item.whatsappConversationAmount}, 0).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h3>
          </div>
          <div style="display: flex">
            <div style="margin-right: 10px; padding: 10px; background-color: #fed330; border-radius: 30px; font-size: x-large; font-weight: bold;"> {{ this.clientReport.filter(client => client.whatsappConversationLocalityName == '1' && client.whatsappConversationAmount != 0).length}}</div>
            <div style="margin-right: 10px; padding: 10px; background-color: #db67a3; border-radius: 30px; font-size: x-large; font-weight: bold;"> {{ this.clientReport.filter(client => client.whatsappConversationLocalityName == '4' && client.whatsappConversationAmount != 0).length}}</div>
            <div style="margin-right: 10px; padding: 10px; background-color: #a78dcc; border-radius: 30px; font-size: x-large; font-weight: bold;"> {{ this.clientReport.filter(client => client.whatsappConversationLocalityName == '5' && client.whatsappConversationAmount != 0).length}}</div>
            <div style="margin-right: 10px; padding: 10px; background-color: #55b5ab; border-radius: 30px; font-size: x-large; font-weight: bold;"> {{ this.clientReport.filter(client => client.whatsappConversationLocalityName == '3' && client.whatsappConversationAmount != 0).length}}</div>
          </div>
        </div>


        <br>
        <vue-good-table
          :line-numbers="false"
          styleClass="tableOne vgt-table"
          :rows="clientReport"
          :columns="clientReportColumns"
        >
        
        <template slot="table-row" slot-scope="props">
            
          <div v-if="props.column.field == 'agentName'" :style="{backgroundColor: props.row.agentColor}" style="border-radius: 10px; padding: 5px; width: fit-content; text-align: center;">
            <p style="margin: 0px;" :style="{color: props.row.agentFontColor }">{{ props.row.agentName }}</p>
          </div>

          <div v-else-if="props.column.field == 'whatsappConversationRecipientPhoneNumber'">
            <p style="margin: 0px;">{{ parseNumber(props.row.whatsappConversationRecipientPhoneNumber) }}</p>
          </div>

          <div v-else-if="props.column.field == 'whatsappConversationEndDatetime'">
            <p style="margin: 0px;">{{ parseHour(props.row.whatsappConversationEndDatetime) }}</p>
          </div>

          <div v-else-if="props.column.field == 'whatsappConversationAmount'">
            <p style="margin: 0px;">₡ {{ props.row.whatsappConversationAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</p>
          </div>

          <div v-else-if="props.column.field == 'whatsappConversationAction'">
            <i class="i-Notepad text-25 text-warning" @click="openHistoryConversation(props.row)" v-b-modal.historyOpenModal style="cursor: pointer; margin-right: 7px;"></i>
          </div>
          

          </template>
        </vue-good-table>
      </b-card>
    </div>


  </div>

    <br><br>
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
      agentFiltered: null,
      contactHint: null,

      loaderReport: true,
      initialDateFiltered: null,
      endDateFiltered: null,
      clientReport: [],
      originalClientReport: [],
      clientReportColumns: 
      [
        {label: "ID", field: "whatsappConversationID"},
        {label: "Agente", field: "agentName"}, 
        {label: "Nombre", field: "whatsappConversationRecipientProfileName"}, 
        {label: "Número", field: "whatsappConversationRecipientPhoneNumber"}, 
        {label: "Fecha", field: "whatsappConversationEndDatetime"},
        {label: "Resultado", field: "whatsappConversationCloseComment"},
        {label: "Cantidad", field: "whatsappConversationAmount"},
        {label: "Abrir", field: "whatsappConversationAction"}
      ],

      agentOptions: [],

      opcionesGraficoVenta: null,
      datosGraficoVenta: [],
      opcionesGraficoTotal: null,
      datosGraficoTotal: [],
      opcionesGraficoContacto: null,
      datosGraficoContacto: [],

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
      historyConversationsColumns: [{label: "Agente", field: "agentName", thClass: "text-left", tdClass: "text-left"}, {label: "Resultado", field: "whatsappConversationCloseComment", thClass: "text-left", tdClass: "text-left"}, {label: "Inicio", field: "whatsappConversationStartDateTime", thClass: "text-left", tdClass: "text-left"}, {label: "Fin", field: "whatsappConversationEndDateTime", thClass: "text-left", tdClass: "text-left"}, {label: "", field: "whatsappConversationActions", thClass: "text-right", tdClass: "text-right"}],
      historySells: [],

      contactLetter: null,
      contactLettersOptions: [{value:null,text:'Seleccione una letra para buscar los contactos'},{value:'A',text:'A'},{value:'B',text:'B'},{value:'C',text:'C'},{value:'D',text:'D'},{value:'E',text:'E'},{value:'F',text:'F'},{value:'G',text:'G'},{value:'H',text:'H'},{value:'I',text:'I'},{value:'J',text:'J'},{value:'K',text:'K'},{value:'L',text:'L'},{value:'M',text:'M'},{value:'N',text:'N'},{value:'O',text:'O'},{value:'P',text:'P'},{value:'Q',text:'Q'},{value:'R',text:'R'},{value:'S',text:'S'},{value:'T',text:'T'},{value:'U',text:'U'},{value:'V',text:'V'},{value:'W',text:'W'},{value:'X',text:'X'},{value:'Y',text:'Y'},{value:'Z',text:'Z'}],

      selectedContactLocation: '',
      loaderContact: false,

      sendingMessage: '',

      contactColumns: [],
      displayedContactRows: [],
      originalContactRows: [],

      creatingPhoneNumber: '',
      creatingID: '',
      creatingName: '',
      creatingEmail: '',
      creatingLocationDetails: '',
      creatingNote: '',

      agentType: '',

      currentHistoryConversation: null,
      zoom: 15,
      
      bigImageSource: null,

      loaderID: false,
      IDModalSource: null,
      IDModalType: null,

      contactLocations: null,
      sendingContact: null,

      view: 'Lista de contactos',


      originalEditingPhoneNumber: '',
      editingPhoneNumber: '',
      editingID: '',
      editingName: '',
      editingEmail: '',

      clientFollowupReport: null,
      queryInterval: null,

      currentHeight: 0,
      contactType: 'Todos'
    };

    
  },

  watch: {
    initialDateFiltered(){
      if (this.initialDateFiltered != null){
        this.selectClientReport();

      }
    },


    endDateFiltered(){
      if (this.endDateFiltered != null){
        this.selectClientReport();

      }
    },
    
    selectedMessageType(){
      if (this.selectedMessageType == 'Seguimiento de producto'){
        if (this.sendingContact.lastDate == null){
          this.sendingMessage = `Hola ${this.sendingContact.contactName.split(' ')[0]}, como estás? Te escribe ${localStorage.getItem('agentName').split(' ')[0]} de King Vape. Nada más quería comentarte que tenemos un nuevo Call Center habilitado y hemos mejorado nuestros envíos muchisimo! Nuestros envíos se realizan lo más rápido posible y sin costo alguno! Quedo a la órden por si gustas realizar algún pedido 🫡`
        }
      }
    },

    agentFiltered(){
      if (this.agentFiltered != null){
        this.clientReport = this.originalClientReport.filter(report => report.agentName == this.agentFiltered);         
      } else {
        this.clientReport = this.originalClientReport;
      }
    },

    contactType(){
      if (this.contactType == 'Todos'){
        this.displayedContactRows = this.originalContactRows;
      } else if (this.contactType == 'Reloj'){
        this.displayedContactRows = this.originalContactRows.filter(contact => this.isMoreThan30Days(contact.lastDate) == true);
      } else {
        this.displayedContactRows = this.originalContactRows.filter(contact => contact.lastDate == null);
      }
    }

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
    this.agentType = localStorage.getItem('agentType');

    
    if (localStorage.getItem('agentID') == null){
      router.push("/app/sessions/signIn");
    }

    this.initialDateFiltered = null;
    this.endDateFiltered = null;

    if (this.agentType == 'admin'){
      this.getContactAmount();
      this.selectClientFollowupReport();
      this.selectClientReport(true);
      this.queryInterval = setInterval(() => {
        this.selectClientFollowupReport();
        this.selectClientReport(false);
      }, 6000);
    }

    this.selectAgentNames();
    this.sendingMessage = localStorage.getItem('agentStartMessage');

    this.getContacts();
  
    this.contactColumns = 
    [
      {
        label: null,
        field: "contactFollowup",
      },
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
      ... (this.agentType == 'admin' ? [{label: 'Total', field: 'totalInvoiceAmount', type: 'number'}] : []), 
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
    ];

  },

  beforeDestroy(){
    clearInterval(this.queryInterval);
  },

  methods: {
    closeContactModal(){
      this.displayedContactRows = this.originalContactRows;
      if (this.contactType == 'Todos'){
        this.displayedContactRows = this.originalContactRows;
      } else if (this.contactType == 'Reloj'){
        this.displayedContactRows = this.originalContactRows.filter(contact => this.isMoreThan30Days(contact.lastDate) == true);
      } else {
        this.displayedContactRows = this.originalContactRows.filter(contact => contact.lastDate == null);
      }
      
      let scrollInterval = setInterval(() => {
        if (this.$refs.contactContainer) {
          const scrollableDiv = this.$refs.contactContainer;
          scrollableDiv.scrollTop = this.currentHeight;
          clearInterval(scrollInterval);
        }
      }, 1);
    },
    openEdit(contactPhoneNumber){
      const contact = this.displayedContactRows.find(contactRow => contactRow.contactPhoneNumber == contactPhoneNumber);
      this.originalEditingPhoneNumber = contact.contactPhoneNumber;
      this.editingPhoneNumber = contact.contactPhoneNumber;
      this.editingID = contact.contactID;
      this.editingName = contact.contactName;
      this.editingEmail = contact.contactEmail;
    },

    selectAgentNames(){
      this.agentOptions = [{value: null, text: 'Todos'}];
      axios.get(constants.routes.backendAPI+'/selectAgentNames').then((response) =>{
        if (response.data.success){
          for (var agentIndex in response.data.result){
            this.agentOptions.push(response.data.result[agentIndex].agentName);
          }
        } else {
          this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    submit(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.editingPhoneNumber) && regularExpressionChecker.test(this.editingID) && regularExpressionChecker.test(this.editingName) && regularExpressionChecker.test(this.editingEmail) && regularExpressionChecker.test(this.editingLocationDetails) && regularExpressionChecker.test(this.editingNote)) {
        axios.post(constants.routes.backendAPI+'/updateContact', 
        {
          'originalContactPhoneNumber': this.originalEditingPhoneNumber,
          'editedContactPhoneNumber': this.editingPhoneNumber,
          'contactID': this.editingID,
          'contactName': this.editingName, 
          'contactEmail': this.editingEmail, 
          'contactLocationDetails': this.editingLocationDetails, 
          'contactNote': this.editingNote
        }).then((response) =>{ 
          if (response.data.success){
            this.$bvToast.toast("Se ha editado exitosamente el contacto con el número '" + this.editingPhoneNumber + "'.", {
              title: "Contacto editado",
              variant: "success",
              solid: true
            });
            this.rows = [];
            this.$refs['modalEditar'].hide();
            this.getContacts();
          } else {
            this.$bvToast.toast("Ya existe un cliente asociado al número '" + this.editingPhoneNumber + "', por favor modifique la información e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Número de contacto duplicado",
              variant: "danger",
              solid: true
            });
          }
        })
        .catch(error =>{
          this.$bvToast.toast("Ha ocurrido un error inesperado al editar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al editar el contacto",
            variant: "danger",
            solid: true
          });
        })
      } else {
        this.$bvToast.toast('El contenido de la información del cliente no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar el cliente',
          variant: 'danger',
          solid: true
        });
      }
    },

    isMoreThan30Days(lastDate) {
      if (!lastDate) return false; // Si no hay una fecha, no se muestra el icono
      
      const currentDate = new Date(); // Fecha actual
      const parsedLastDate = new Date(lastDate); // Convertir lastDate a objeto Date

      // Calcular la diferencia en milisegundos
      const diffInMs = currentDate - parsedLastDate;

      // Convertir la diferencia a días
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      // Comprobar si han pasado 30 días o más
      return diffInDays >= 30;
    },

    getTagStyle(tagID){
      var style = 'cursor: pointer;';
      if (tagID == 1){
        if (this.view == 'Lista de contactos'){
          style = style + 'background-color: #e0e0e0;'
        }
      } else if (tagID == 2){
        if (this.view == 'Seguimiento de clientes'){
          style = style + 'background-color: #e0e0e0;'
        }
      }
      return style;
    },
    
    displayContacts(){
      this.displayedContactRows = this.originalContactRows.filter(contact => {
        const contactName = contact.contactName.trim(); 
        return contactName.toLowerCase().startsWith(this.contactLetter.toLowerCase());
      });
    },

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

    selectClientFollowupReport(){
      axios.post(constants.routes.backendAPI+'/selectClientFollowupReport')
      .then((response) => {
        if (response.data.success){
          this.clientFollowupReport = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar la cantidad de contactos del reporte', 'Ha ocurrido un error inesperado al consultar la cantidad de contactos del reporte. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar la cantidad de contactos del reporte', 'Ha ocurrido un error inesperado al consultar la cantidad de contactos del reporte. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    getLabels(){
      var agentLabels = [];

      for (var agentIndex in this.clientReport){
        const agentName = this.clientReport[agentIndex].agentName;
        if (agentLabels.includes(agentName) == false){
          agentLabels.push(agentName);
        }
      }
      return agentLabels;
    },

    getDatos(labels){
      var datos = [];
      for (var labelIndex in labels){
        const amount = this.clientReport.filter(invoice => (invoice['agentName'] == labels[labelIndex] && invoice['whatsappConversationCloseComment'] == 'Venta')).length;
        datos.push(amount);
      }
      return datos;
    },

    getDatos2(labels){
      var datos = [];
      for (var labelIndex in labels){
        const amount = this.clientReport.filter(invoice => (invoice['agentName'] == labels[labelIndex])).length;
        datos.push(amount);
      }
      return datos;
    },

    getColors(labels){
      var colors = [];
      for (var labelIndex in labels){
        const color = this.clientReport.find(invoice => invoice['agentName'] == labels[labelIndex]).agentColor;
        colors.push(color);
      }
      return colors;
    },

    selectClientReport(loader){
      
      if (loader){
        this.loaderReport = true;

      }

      
      axios.post(constants.routes.backendAPI+'/selectClientReport', {startDate: this.initialDateFiltered, endDate: this.endDateFiltered})
      .then((response) => {
        if (response.data.success){
          this.loaderReport = false;
          this.clientReport = response.data.result;
          this.originalClientReport = response.data.result;
          const labels = this.getLabels();
          this.opcionesGraficoVenta = 
          {
            chart: {width: 300, type: 'pie', fontSize: 20}, 
            tooltip: {enabled: true}, 
            labels: labels,
            legend: {fontSize: '15px', show: false},
            colors: this.getColors(labels)
          };
          this.datosGraficoVenta = this.getDatos(labels);

          this.opcionesGraficoContacto = 
          {
            chart: {width: 400, type: 'pie', fontSize: 20}, 
            tooltip: {enabled: true}, 
            labels: labels,
            legend: {fontSize: '15px'},
            colors: this.getColors(labels)
          };
          this.datosGraficoContacto = this.getDatos2(labels);


          this.opcionesGraficoTotal = 
          {
            chart: {width: 400, type: 'pie', fontSize: 20}, 
            tooltip: {enabled: true}, 
            labels: ['Vendido', 'No vendido'],
            legend: {fontSize: '15px'},
            colors: ['#2c6b1f', '#bd0404']
          };
          this.datosGraficoTotal = [this.clientReport.filter(clientReport => clientReport.whatsappConversationCloseComment == 'Venta').length, this.clientReport.filter(clientReport => clientReport.whatsappConversationCloseComment != 'Venta').length];

        } else {
          this.showNotification('danger', 'Error al consultar el reporte de contactos', 'Ha ocurrido un error inesperado al consultar el reporte de contactos. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar el reporte de contactos', 'Ha ocurrido un error inesperado al consultar el reporte de contactos. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
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
      this.loaderContact = true;
      this.displayedContactRows.length = 0;

      axios.post(constants.routes.backendAPI+'/selectContact', 
      {
        contactPhoneNumber: this.contactPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          if (response.data.result.length != 0){
            this.displayedContactRows = response.data.result.map(contact => ({
              'contactID': contact.i,
              'contactName': contact.n,
              'contactPhoneNumber': contact.p,
              'contactEmail': contact.e,
              'contactLocations': JSON.parse(contact.l),
              'contactHasIDImage': contact.ip,
              'lastDate': contact.ld,
              'totalInvoiceAmount': contact.totalInvoiceAmount
            }));
            this.loaderContact = false;
            this.contactPhoneNumber = '';
            this.contactType = 'Todos';
          } else {
            this.loaderContact = false;
            this.contactPhoneNumber = '';
            this.showNotification('warning', 'Contacto no encontrado', 'No se ha encontrado ningún contacto con el número ' + this.contactPhoneNumber + '. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        } else {
          this.loaderContact = false;
          this.contactPhoneNumber = '';
          this.showNotification('danger', 'Error al buscar el contacto', 'Ha ocurrido un error inesperado al buscar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.loaderContact = false;
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
          var contactMoneyValue = 0;
          this.contactMoneyValue = 0;
          for (var index in response.data.result){
            contactMoneyValue = contactMoneyValue + parseInt(response.data.result[index].whatsappConversationAmount);
          }
          this.contactMoneyValue = contactMoneyValue;
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
      if (this.selectedMessageType){
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
      } else {
        this.$bvToast.toast("Debe colocar un motivo al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Información faltante",
          variant: "warning",
          solid: true
        });
      }
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
            this.displayedContactRows.length = 0;
            this.originalContactRows.length = 0;
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
      


       let scrollInterval = setInterval(() => {
        if (this.$refs.contactContainer) {
          const scrollableDiv = this.$refs.contactContainer;
          this.currentHeight = scrollableDiv.scrollTop;
          
          this.sendingMessage = localStorage.getItem('agentStartMessage');
          this.sendingContact = contact;
          this.selectedMessageType = null;
          this.displayedContactRows = [contact];
          this.$root.$emit('bv::show::modal', 'sendContactMessageModal');

          clearInterval(scrollInterval);
        }
      }, 1);

      
      
    },


    getContacts(){
      this.loaderContact = true;
      this.originalContactRows.length = 0;

      axios.post(constants.routes.backendAPI+'/selectContactsFromStartingLetter', 
      {
        'startingLetter': this.contactLetter
      })
      .then((response) =>{ 


        this.originalContactRows = response.data.result.map(contact => ({
          'contactID': contact.i,
          'contactName': contact.n,
          'contactPhoneNumber': contact.p,
          'contactEmail': contact.e,
          'contactLocations': JSON.parse(contact.l),
          'contactHasIDImage': contact.ip,
          'totalInvoiceAmount': parseInt(contact.totalInvoiceAmount),
          'lastDate': contact.ld
        }));
        this.loaderContact = false;
        this.displayedContactRows = this.originalContactRows;

        let scrollInterval = setInterval(() => {
          if (this.$refs.contactContainer) {
            const scrollableDiv = this.$refs.contactContainer;
            scrollableDiv.scrollTop = 0;
            clearInterval(scrollInterval);
          }
        }, 1);


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
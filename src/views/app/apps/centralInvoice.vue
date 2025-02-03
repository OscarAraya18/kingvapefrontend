<template>
  <div>

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

    
    <b-modal id="mapModal" size="lg" centered hide-header hide-footer>
      <MapComponent :localityAgentOptions="localityAgentOptions" :localityAgentBillerOptions="localityAgentBillerOptions" :multipleClients="locations" :localityMap="true" mapHeight="400px" mapWidth="100%"></MapComponent>
    </b-modal>

    <b-modal scrollable size="sm" centered id="insertIDModal" hide-footer hide-header>
      <div v-if="insertIDModalLoader == true" style="text-align: center;">
        <br>
        <span class="spinner-glow spinner-glow-primary"></span>
      </div>
      
      <div v-else>
        <div v-if="currentClientSource" style="text-align: center;">
          <p style="margin: 0; font-size: 15px;">
            <strong>Cédula del cliente:</strong>
          </p>
          <br>
          <img v-if="currentClientType == 'image'" style="width: 200px;" :src="currentClientSource">
          <iframe v-else :src="currentClientSource" width="50%" height="300px"></iframe>
          <br><br>
        </div>
        <button @click="uploadImage(true)" class="btn btn-success mr-2" type="button" id="sendFiles">Cambiar cédula del cliente</button>
        <input type="file" accept="image/png, image/jpeg, application/pdf" @change="changeImage()" ref="imageFile1" style="display: none;" id="imageUploader1">
        
        <div v-if="currentAuthorizedSource" style="text-align: center;">
          <br><br><br><br>
          <p style="margin: 0; font-size: 15px;">
            <strong>Cédula del autorizado del cliente:</strong>
          </p>
          <br>
          <img v-if="currentAuthorizedType == 'image'" style="width: 200px;" :src="currentAuthorizedSource">
          <iframe v-else :src="currentAuthorizedSource" width="50%" height="300px"></iframe>
          <br><br>
        </div>
        <button @click="uploadImage(false)" class="btn btn-warning mr-2" type="button" id="sendFiles">Cargar cédula del autorizado del cliente</button>
        <input type="file" accept="image/png, image/jpeg, application/pdf" @change="changeImage()" ref="imageFile2" style="display: none;" id="imageUploader2">
        
      </div>
    </b-modal>
    

    <b-modal id="deliveredInvoicesModal" size="lg" centered hide-header hide-footer>
      <div v-if="loaderDelivered" style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
      <div v-else>

        <h3><strong>Total de paquetes: </strong>{{deliveredInvoices.length}}</h3>
        <br><br>

        <vue-good-table
          :columns="deliveredInvoicesTable"
          :rows="deliveredInvoices"
          styleClass="order-table vgt-table"
          :line-numbers="false">
          <template slot="table-row" slot-scope="props">
            <div v-if="props.column.field == 'whatsappInvoiceAgentID'">
              <i v-b-modal.informacionModal @click="openWhatsappInvoiceInformation(props.row)" class="i-Information" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
              <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(props.row)" class="i-Shopping-Cart" style="font-size: xx-large; cursor: pointer;"></i>
              <button @click="clickOnCentralInvoice(props.row, true)" class="btn btn-primary text-black btn-rounded" style="margin-top: 10px; margin-bottom: 10px;">Retornar a sucursal</button>

            </div>
            <div v-else-if="props.column.field == 'whatsappInvoiceClientPhoneNumber'">
              {{ parsePhoneNumber(props.row.whatsappInvoiceClientPhoneNumber) }}
            </div>
            <div v-else-if="props.column.field == 'whatsappInvoiceAmount'">
              ₡{{ parseInt(props.row.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}
            </div>

            <div v-else-if="props.column.field == 'localityAgentName'" :style="getLocalityAgentTableStyle(props.row.whatsappInvoiceLocalityAgentID)">
              {{ props.row.localityAgentName }}
            </div>
            
            
          </template>
        </vue-good-table>
      </div>
    </b-modal>

    <b-modal id="motosModal" size="lg" centered hide-header hide-footer>
      <div style="width: 700px;">
        
        <h4><strong>Filtro por fecha inicial:</strong></h4>
        <b-form-datepicker v-model="mensajerosInitial"></b-form-datepicker>
        <br>
        <h4><strong>Filtro por fecha final:</strong></h4>
        <b-form-datepicker v-model="mensajerosEnd"></b-form-datepicker>
        <br>

        <div v-if="loaderMotos" style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>

        <div v-else>
          <br>
          <apexchart type="pie" width="600" :options="opcionesGraficoCircular" :series="datosGraficoCircular"></apexchart>
          <br><br><br>
          <div>
            <h4><strong>Disponibilidad de mensajeros de hoy:</strong></h4>

            <br>
            <div v-for="mensajero in mensajerosToday">
              <div style="display: flex">
                <b-form-checkbox value="1" unchecked-value="0" @input="updateLocalityAgentIsWorkingToday(mensajero)" v-model="mensajero.today" style="margin-left: 15px; position: relative; top: -27px" size="lg"></b-form-checkbox>

                <p>{{ mensajero.text}}</p>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </b-modal>

    <b-modal id="notShippedModal" size="sm" centered hide-header @ok="notShippedInvoice()">
      <b-form-textarea no-resize rows="5" class="form-control" placeholder="Coloque un motivo para no entregar" v-model="notShippedReason"/>
    </b-modal>

    <b-modal id="shippingModal" size="sm" centered hide-header hide-footer>
      <div style="text-align: center" v-if="shippingInvoice">
        <h5><strong>ID: </strong>{{ shippingInvoice.whatsappInvoiceID }}</h5>
        <h5><strong>Nombre: </strong>{{ shippingInvoice.whatsappInvoiceClientName }}</h5>
        <h5><strong>Número: </strong>{{ parsePhoneNumber(shippingInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
        <br><br>
        <b-button @click="clickOnShippingInvoice(shippingInvoice)" variant="success">Entregado</b-button>
        <br><br>
        <b-button v-b-modal.notShippedModal variant="danger">No entregado</b-button>
      </div>

    </b-modal>

    <b-modal id="assignLocalityAgentModal" size="sm" centered hide-header @ok="assignLocalityAgent()">

      <h5><strong>Seleccione un mensajero: </strong></h5>
      <b-form-select v-model="assignedLocalityAgent">
        <b-form-select-option
         v-for="(localityAgentOption, localityAgentOptionIndex) in localityAgentOptions"
         :key="localityAgentOptionIndex"
         :value="localityAgentOption.value"
         :title="localityAgentOption.title"> 
          <p>{{localityAgentOption.text}}</p>
        </b-form-select-option>
      </b-form-select>

      <br><br>

      <h5><strong>Seleccione un facturador: </strong></h5>
      <b-form-select v-model="assignedLocalityAgentBiller">
        <b-form-select-option
         v-for="(localityAgentOption, localityAgentOptionIndex) in localityAgentBillerOptions"
         :key="localityAgentOptionIndex"
         :value="localityAgentOption.value"
         :title="localityAgentOption.title"> 
          <p>{{localityAgentOption.text}}</p>
        </b-form-select-option>
      </b-form-select>

    </b-modal>


    <b-modal id="deliverModal" size="sm" centered hide-header @ok="deliverInvoice()">
      <h5><strong>Seleccione un facturador: </strong></h5>
      <b-form-select v-model="assignedLocalityAgentBiller">
        <b-form-select-option
         v-for="(localityAgentOption, localityAgentOptionIndex) in localityAgentBillerOptions"
         :key="localityAgentOptionIndex"
         :value="localityAgentOption.value"
         :title="localityAgentOption.title"> 
          <p>{{localityAgentOption.text}}</p>
        </b-form-select-option>
      </b-form-select>
    </b-modal>

    
    <b-modal id="updateWhatsappInvoiceClientNameModal" size="sm" centered hide-header @ok="updateWhatsappInvoiceClientName()">
      <b-form-input v-model="updatedWhatsappInvoiceClientName" placeholder="Coloque un nombre"></b-form-input>
    </b-modal>

    <b-modal id="updateWhatsappInvoiceClientPhoneNumberModal" size="sm" centered hide-header @ok="updateWhatsappInvoiceClientPhoneNumber()">
      <b-form-input v-model="updatedWhatsappInvoiceClientPhoneNumber" placeholder="Coloque un número de teléfono"></b-form-input>
    </b-modal>

    <b-modal id="updateWhatsappInvoiceAmountModal" size="sm" centered hide-header @ok="updateWhatsappInvoiceAmount()">
      <b-form-input v-model="updatedWhatsappInvoiceAmount" placeholder="Coloque un monto"></b-form-input>
    </b-modal>

    <b-modal id="updateWhatsappInvoiceAgentIDModal" size="sm" centered hide-header @ok="updateWhatsappInvoiceAgentID()">
      <b-form-select v-model="updatedWhatsappInvoiceAgentID" :options="updateWhatsappInvoiceAgentIDOptions"></b-form-select>
    </b-modal>

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
          <div v-if="props.column.field == 'CodigoP'">
            <VueBarcode :value="props.row.CodigoP" width="1" height="50">
            </VueBarcode>
          </div>
          <div v-else-if="props.column.field == 'precio'">
            ₡{{ parseInt(props.row.precio).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}
          </div>
          <div v-else-if="props.column.field == 'descuento'">
            {{ props.row.descuento }} %
          </div>
        </template>
      </vue-good-table>
    </b-modal>

    <b-modal id="localityWhatsappInvoiceInformationModal" size="lg" centered hide-header hide-footer>
      <div style="display: flex">
        <div v-if="updatedWhatsappInvoice">
          <h4><strong>ID:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceID }}</h4>
          <h4><strong>Nombre:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceClientName }}</h4>
          <h4><strong>Número:</strong> {{ parsePhoneNumber(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h4>
        </div>
        <div class="flex-grow-1" ></div>

        <div>
          <button @click="openInsertClientIDSImage(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber)" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>
        </div>
      </div>
      <br><br>

      <div style="display: flex;">
        <div style="width: 50%; margin-right: 50px;">

          <div style="display: flex;">
            <h5><strong>Estado: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceState }}</h5>
            <button v-if="updatedWhatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnCentralInvoice(updatedWhatsappInvoice, true)" class="btn btn-info ml-2" style="position: relative; top: -10px;" type="button">Retornar a sucursal</button>

          </div>
          <div style="display: flex;">
            <h5><strong>Método de envío: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceShippingMethod }}</h5>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceShippingMethod'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
          </div>
          <div style="display: flex;">
            <h5><strong>Método de pago: </strong> {{updatedWhatsappInvoice.whatsappInvoicePaymentMethod}}</h5>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoicePaymentMethod'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
          </div>
          <div style="display: flex;">
            <h5><strong>Estado de pago: </strong> {{ updatedWhatsappInvoice.whatsappInvoicePaymentState }}</h5>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoicePaymentState'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
          </div>

          <br>

          <h5><strong>Nota de la dirección: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea no-resize rows="5" class="form-control" placeholder="Coloque una nota de la dirección" v-model="updatedWhatsappInvoice.whatsappInvoiceLocationNote"/>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceLocationNote()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceLocationNote'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>

          </div>
          <br>

          <h5><strong>Nota del envío: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea no-resize rows="5" class="form-control" placeholder="Coloque una nota del envío" v-model="updatedWhatsappInvoice.whatsappInvoiceShippingNote"/>    
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceShippingNote()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceShippingNote'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
          </div>
          <br>

          <br>
          <div style="display: flex;">
            <h5><strong>Pedido para hoy: </strong></h5>
            <b-form-checkbox value="1" unchecked-value="0" @input="updateWhatsappInvoiceIsForToday(updatedWhatsappInvoice)" v-model="updatedWhatsappInvoice.whatsappInvoiceIsForToday" style="margin-left: 15px; position: relative; top: -27px" size="lg"></b-form-checkbox>
          </div>

          <div style="display: flex;" v-if="updatedWhatsappInvoice.whatsappInvoicePaymentMethod == 'SINPE (contra entrega)'">
            <h5><strong>SINPE (contra entrega) confirmado: </strong></h5>
            <b-form-checkbox value="1" unchecked-value="0" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceSINPEApproved" style="margin-left: 15px; position: relative; top: -27px" size="lg"></b-form-checkbox>
          </div>

          <div v-if="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason">
            <br>
            <h5><strong>Motivo del fallo en la entrega: </strong></h5>
            <div style="display: flex;">
              <b-form-textarea no-resize rows="5" class="form-control" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason"/>    
            </div>
            <br>
          </div>
          
          <br>
        </div>

        <div style="width: 50%;">
          <div v-if="updatedWhatsappInvoice.localityAgentName">
            <h5><strong>Mensajero: </strong></h5>
            <div style="display: flex;">
              <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceLocalityAgentID" :options="localityAgentOptions"></b-form-select>
              <div class="flex-grow-1"></div>
              <i @click="updateWhatsappInvoiceLocalityAgentID()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>    
            </div>
          </div>
          <h5 v-else><strong>Mensajero: </strong>No asignado</h5> 
          <br>

          <h5><strong>Enlace de la ubicación: </strong></h5>
          <div style="display: flex;">
            <b-form-input v-model="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL" class="mb-3" placeholder="Enlace de la ubicación"></b-form-input>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceClientLocationURL()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceClientLocationURL'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
          </div>
          <br>

          <div v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL == ''">
            <h5><strong>Ubicación: </strong></h5>
            <MapComponent v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocation && updatedWhatsappInvoice.whatsappInvoiceClientLocationURL == ''" mapHeight="400px" mapWidth="100%" :clientLongitude="getWhatsappInvoiceClientLocation().lng" :clientLatitude="getWhatsappInvoiceClientLocation().lat"></MapComponent>
            <br>
            <div style="display: flex;">
              <b-form-select @change="changeWhatsappInvoiceLocation()" v-model="updatedWhatsappInvoiceLocation" :options="updateWhatsappInvoiceLocationOptions"></b-form-select>
              <i @click="selectWhatsappInvoiceLocations()" class="i-Data-Search text-25 text-info ml-3" style="cursor: pointer"></i>    
              <i @click="updateWhatsappInvoiceClientLocation()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
              <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceClientLocation'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
            </div>
          </div>
          
        </div>
      </div>

    </b-modal>

    <br>

    <b-modal id="informacionModal" size="lg" centered hide-footer hide-header>
      <h5><strong>ID: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceID }}</h5>
      <h5><strong>Nombre del cliente: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceClientName }}</h5>
      <h5><strong>Número del cliente: </strong> {{ parsePhoneNumber(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
      <h5><strong>Monto: </strong> ₡{{ parseInt(updatedWhatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>

      <br>

      <h5><strong>Nombre del agente: </strong> {{ updatedWhatsappInvoice.agentName }}</h5>
      <h5><strong>Nombre del mensajero: </strong> {{ updatedWhatsappInvoice.localityAgentName }}</h5>

      <br>

      <h5><strong>Método de envío: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceShippingMethod }}</h5>
      <h5><strong>Método de pago: </strong> {{updatedWhatsappInvoice.whatsappInvoicePaymentMethod}}</h5>
      <h5><strong>Estado de pago: </strong> {{ updatedWhatsappInvoice.whatsappInvoicePaymentState }}</h5>
      <h5><strong>Hora de entrega: </strong> {{ parseHour(updatedWhatsappInvoice.whatsappInvoiceDeliveredDateTime) }}</h5>

      <br>

      <h5><strong>Nota de la dirección: </strong></h5>
      <div style="display: flex;">
        <b-form-textarea disabled no-resize rows="3" class="form-control" placeholder="Coloque una nota de la dirección" v-model="updatedWhatsappInvoice.whatsappInvoiceLocationNote"/>
        <div class="flex-grow-1"></div>
      </div>
      <br>

      <h5><strong>Nota del envío: </strong></h5>
      <div style="display: flex;">
        <b-form-textarea disabled no-resize rows="3" class="form-control" placeholder="Coloque una nota del envío" v-model="updatedWhatsappInvoice.whatsappInvoiceShippingNote"/>    
        <div class="flex-grow-1"></div>
      </div>
      <br>

      <div v-if="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason">
        <br>
        <h5><strong>Motivo del fallo en la entrega: </strong></h5>
        <div style="display: flex;">
          <b-form-textarea no-resize rows="3" class="form-control" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason"/>    
        </div>
        <br>
      </div>

      <div v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL != ''">
        <h5><strong>Enlace de la ubicación: </strong></h5>
        <div style="display: flex;">
          <b-form-input v-model="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL" disabled class="mb-3" placeholder="Enlace de la ubicación"></b-form-input>
        </div>
        <br>
      </div>
      
      
      <div v-else>
        <h5><strong>Ubicación: </strong></h5>
        <MapComponent v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocation" mapHeight="300px" mapWidth="100%" :clientLongitude="getWhatsappInvoiceClientLocation().lng" :clientLatitude="getWhatsappInvoiceClientLocation().lat"></MapComponent>
      </div>
      
      
      <br>

    </b-modal>



    <b-modal id="mensajeroModal" size="lg" centered hide-footer hide-header>
      <div style="display: flex">
        <div v-if="updatedWhatsappInvoice">
          <h4><strong>ID:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceID }}</h4>
          <h4><strong>Nombre:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceClientName }}</h4>
          <h4><strong>Número:</strong> {{ parsePhoneNumber(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h4>
        </div>
        <div class="flex-grow-1" ></div>

        <div>
          <i class="i-Close" @click="cerrarMensajeroModal()" style="font-size: 35px; margin-left: 30px;"></i>
          <br><br>
          <button @click="openInsertClientIDSImage(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber)" class="btn btn-icon btn-rounded btn-info ml-2" style="height: 40px;" type="button"><i class="i-ID-Card"></i></button>
        </div>
      </div>
      
      <br>

          <h5><strong>Estado: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceState }}</h5>

          <div style="display: flex;">
            <h5><strong>Método de envío: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceShippingMethod }}</h5>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceShippingMethod'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
          </div>
          <div style="display: flex;">
            <h5><strong>Método de pago: </strong> {{updatedWhatsappInvoice.whatsappInvoicePaymentMethod}}</h5>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoicePaymentMethod'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
          </div>
          <div style="display: flex;">
            <h5><strong>Estado de pago: </strong> {{ updatedWhatsappInvoice.whatsappInvoicePaymentState }}</h5>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoicePaymentState'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
          </div>

          <br>
          
          <div style="display: flex;">
            <h5><strong>Nota de la dirección: </strong></h5>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceLocationNote'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
          </div>
          <div style="display: flex;">
            <b-form-textarea disabled no-resize rows="5" class="form-control" placeholder="Coloque una nota de la dirección" v-model="updatedWhatsappInvoice.whatsappInvoiceLocationNote"/>
            <div class="flex-grow-1"></div>
          </div>
          
          <br>

          <div style="display: flex;">
            <h5><strong>Nota del envío: </strong></h5>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceShippingNote'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
          </div>
          <div style="display: flex;">
            <b-form-textarea disabled no-resize rows="5" class="form-control" placeholder="Coloque una nota del envío" v-model="updatedWhatsappInvoice.whatsappInvoiceShippingNote"/>    
            <div class="flex-grow-1"></div>
          </div>
          <br>

          <div style="display: flex;" v-if="updatedWhatsappInvoice.whatsappInvoicePaymentMethod == 'SINPE (contra entrega)'">
            <h5><strong>SINPE (contra entrega) confirmado: </strong></h5>
            <b-form-checkbox value="1" unchecked-value="0" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceSINPEApproved" style="margin-left: 15px; position: relative; top: -27px" size="lg"></b-form-checkbox>
          </div>

          <div v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL != ''">
            <h5><strong>Enlace de la ubicación: </strong></h5>
            <div style="display: flex;">
              <b-form-input v-model="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL" disabled class="mb-3" placeholder="Enlace de la ubicación"></b-form-input>
              <img @click="goToURL(updatedWhatsappInvoice.whatsappInvoiceClientLocationURL)" src="@/assets/pageAssets/map.png" alt style="cursor:pointer; width: 35px; margin-left: 20px; height: 35px;"/>
              <img @click="goToURL(updatedWhatsappInvoice.whatsappInvoiceClientLocationURL)" src="@/assets/pageAssets/z.png" alt style="cursor:pointer; margin-left: 10px; width: 35px; height: 35px;"/>
            </div>
            <br>
          </div>
          
          <div v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL == ''">
            <div style="display: flex;">
              <h5><strong>Ubicación: </strong></h5>
              <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceClientLocation'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: auto; left: 10px; top:-5px; position: relative;"/>
            </div>
            <br>
            <MapComponent v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocation" mapHeight="300px" mapWidth="100%" :clientLongitude="getWhatsappInvoiceClientLocation().lng" :clientLatitude="getWhatsappInvoiceClientLocation().lat"></MapComponent>
            <br>
          </div>

          <div style="text-align: center;">
              <div style="display: flex;">
                <img @click="contactClient()" src="@/assets/pageAssets/w.png" alt style="width: 50px; margin-right: 20px; height: auto;"/>
                <img @click="goWithMaps()" src="@/assets/pageAssets/map.png" alt style="width: 50px; margin-right: 20px; height: auto;"/>
                <img @click="goWithWaze()" src="@/assets/pageAssets/z.png" alt style="width: 50px; height: auto;"/>
              </div>
            </div> 

          
          <br>



    </b-modal>

    <b-modal id="updateWhatsappInvoiceInformation" size="lg" centered hide-header hide-footer>
      <div v-if="updatedWhatsappInvoice">
        <h4><strong>ID:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceID }}</h4>
        <h4><strong>Nombre:</strong> {{ updatedWhatsappInvoice.whatsappInvoiceClientName }}</h4>
        <h4><strong>Número:</strong> {{ parsePhoneNumber(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h4>
      </div>
      <br><br>
      
      <div style="display: flex;">
        <div style="width: 50%; margin-right: 50px;">
          <h5><strong>Localidad: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceLocalityID" :options="updateWhatsappInvoiceLocalityOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceLocalityID()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Estado: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceState" :options="updateWhatsappInvoiceStateOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceState()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Método de envío: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceShippingMethod" :options="updateWhatsappInvoiceShippingMethodOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceShippingMethod()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceShippingMethod'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
          </div>
          <br>

          <h5><strong>Método de pago: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoicePaymentMethod" :options="updateWhatsappInvoicePaymentMethodOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoicePaymentMethod()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoicePaymentMethod'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
          </div>
          <br>

          <h5><strong>Estado de pago: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoicePaymentState" :options="updateWhatsappInvoicePaymentStateOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoicePaymentState()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoicePaymentState'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
          </div>
          <br>

          <h5><strong>Nota de la dirección: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea no-resize rows="5" class="form-control" placeholder="Coloque una nota de la dirección" v-model="updatedWhatsappInvoice.whatsappInvoiceLocationNote"/>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceLocationNote()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceLocationNote'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
          </div>
          <br>
          
          <h5><strong>Nota del envío: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea no-resize rows="3" class="form-control" placeholder="Coloque una nota del envío" v-model="updatedWhatsappInvoice.whatsappInvoiceShippingNote"/>    
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceShippingNote()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceShippingNote'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
          </div>
          <br>

          <br>
          <div style="display: flex;">
            <h5><strong>Pedido para hoy: </strong></h5>
            <b-form-checkbox value="1" unchecked-value="0" @input="updateWhatsappInvoiceIsForToday(updatedWhatsappInvoice)" v-model="updatedWhatsappInvoice.whatsappInvoiceIsForToday" style="margin-left: 15px; position: relative; top: -27px" size="lg"></b-form-checkbox>
          </div>

          <div style="display: flex;" v-if="updatedWhatsappInvoice.whatsappInvoicePaymentMethod == 'SINPE (contra entrega)'">
            <h5><strong>SINPE (contra entrega) confirmado: </strong></h5>
            <b-form-checkbox value="1" unchecked-value="0" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceSINPEApproved" style="margin-left: 15px; position: relative; top: -27px" size="lg"></b-form-checkbox>
          </div>


          <div v-if="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason">
            <br>
            <h5><strong>Motivo del fallo en la entrega: </strong></h5>
            <div style="display: flex;">
              <b-form-textarea no-resize rows="3" class="form-control" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason"/>
            </div>
            <br>
          </div>

          <br>
        </div>

        <div style="width: 50%;">
          <h5 v-if="updatedWhatsappInvoice.localityAgentName"><strong>Mensajero: </strong>{{ updatedWhatsappInvoice.localityAgentName }}</h5>
          <h5 v-else><strong>Mensajero: </strong>No asignado</h5> 
          <br>

          <h5><strong>Enlace de la ubicación: </strong></h5>
          <div style="display: flex;">
            <b-form-input v-model="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL" class="mb-3" placeholder="Enlace de la ubicación"></b-form-input>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceClientLocationURL()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
            <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceClientLocationURL'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
          </div>
          <br>
          
          <div v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL == ''">
            <h5><strong>Ubicación: </strong></h5>
            <MapComponent v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocation" mapHeight="415px" mapWidth="100%" :clientLongitude="getWhatsappInvoiceClientLocation().lng" :clientLatitude="getWhatsappInvoiceClientLocation().lat"></MapComponent>
            <br>
            <div style="display: flex;">
              <b-form-select @change="changeWhatsappInvoiceLocation()" v-model="updatedWhatsappInvoiceLocation" :options="updateWhatsappInvoiceLocationOptions"></b-form-select>
              <i @click="selectWhatsappInvoiceLocations()" class="i-Data-Search text-25 text-info ml-3" style="cursor: pointer"></i>    
              <i @click="updateWhatsappInvoiceClientLocation()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
              <img v-if="updatedWhatsappInvoice.whatsappInvoiceUpdatedField == 'whatsappInvoiceClientLocation'" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 30px; height: 30px; margin-left: 10px;"/>
            </div>
          </div >
        </div>
      </div>

      <br><br>

      <div style="text-align: center;">
        <div v-if="loaderReturned" style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
        <b-button v-else @click="returnWhatsappConversation()" variant="info">Regresar al call center</b-button>
      </div>

    </b-modal>

    <div v-if="agentType == 'central'">
      <div style="position: absolute; top: -65px; z-index: 500; left: 50%; transform: translateX(-50%);">
        <div style="display: flex; justify-content: center;">
          <img v-if="live" class="liveLogo" src="../../../assets/pageAssets/live.png">
          <img v-else class="noliveLogo" src="../../../assets/pageAssets/nolive.png">
        </div>
      </div>

      <div style="display: flex">
        
        <div style="width: 25%; margin-right: 1%;">
          <b-card style="height: 90vh; background-color: #fed330;">
            
            <div style="justify-content: center; width: 100%;">
              <div v-if="(zapoteCentralWhatsappInvoiceAmount + zapoteLocalityWhatsappInvoiceAmount + zapoteShippingWhatsappInvoiceAmount) >= 30" style="position: absolute; justify-content: center; top: -75px; z-index: 500; left: 50%; transform: translateX(-50%);">
                <img class="alertAnimation" src="@/assets/pageAssets/p.webp" alt style="width: 120px; height: auto;"/>
              </div>

              <div style="display: flex; justify-content: center;">
                <b-badge style="font-size: x-large; margin-right: 5px; max-height: 40px;" pill variant="secondary">{{motosZapote}}</b-badge>
                <h1 style="margin-top: auto; margin-bottom: auto;"><strong>ZAPOTE</strong></h1>
                <div style="margin-left: 5px;">
                  <b-badge style="font-size: x-large; margin-right: 5px;" pill variant="danger">{{zapoteCentralWhatsappInvoiceAmount}}</b-badge>
                  <b-badge style="font-size: x-large; margin-right: 5px;" pill variant="warning">{{zapoteLocalityWhatsappInvoiceAmount}}</b-badge>
                  <b-badge style="font-size: x-large;" pill variant="success">{{zapoteShippingWhatsappInvoiceAmount}}</b-badge>

                </div>
              </div>
            </div>
            <br>
            <div :style="getHeight()">
              <div v-for="whatsappInvoice in zapoteWhatsappInvoices">
                
                <div v-if="isAdmin==false" style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px;" :class="getAlertAnimation(whatsappInvoice)">
                  <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  

                    <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                  </div>
                  <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="info">{{ whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                  </div>
                  <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                    <div style="text-align: end;"> 
                      <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; margin-right: 10px; margin-top: 10px;"/>
                    </div>
                    <div style="text-align: end;">
                      <br>
                      <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      <br><br>
                    </div>
                  </div>

                  
                </div>


                <div v-else style="border: 1px solid gray; border-radius: 10px; margin-bottom: 10px;" :class="getAlertAnimation(whatsappInvoice)">
                  <div style="margin-right: 10px; margin-left: 10px;">
                    

                    <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                  </div>
                  
                  <br>
                  <div style="display: flex;">
                    <div style="margin-right: 10px; margin-left: 10px;">
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="info">{{ whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                    </div>
                    <div style="margin-right: 10px; margin-left: 10px;">
                      <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <br>
                      <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; position: relative; top:-5px;"/>

                    </div>
                  </div>
                  <br>
                </div>


              </div>
            </div>
          </b-card>
        </div>

        <div style="width: 25%; margin-right: 1%;">
          <b-card style="height: 90vh; background-color: #db67a3;">
            <div style="justify-content: center; width: 100%;">
              <div v-if="(escazuCentralWhatsappInvoiceAmount + escazuLocalityWhatsappInvoiceAmount + escazuShippingWhatsappInvoiceAmount) >= 20" style="position: absolute; justify-content: center; top: -75px; z-index: 500; left: 50%; transform: translateX(-50%);">
                <img class="alertAnimation" src="@/assets/pageAssets/p.webp" alt style="width: 120px; height: auto;"/>
              </div>

              <div style="display: flex; justify-content: center;">
                <b-badge style="font-size: x-large; margin-right: 5px; max-height: 40px;" pill variant="secondary">{{motosEscazu}}</b-badge>

                <h1 style="margin-top: auto; margin-bottom: auto;"><strong>ESCAZÚ</strong></h1>
                <div style="margin-left: 5px;">
                  <b-badge style="font-size: x-large; margin-right: 5px;" pill variant="danger">{{escazuCentralWhatsappInvoiceAmount}}</b-badge>
                  <b-badge style="font-size: x-large; margin-right: 5px;" pill variant="warning">{{escazuLocalityWhatsappInvoiceAmount}}</b-badge>
                  <b-badge style="font-size: x-large;" pill variant="success">{{escazuShippingWhatsappInvoiceAmount}}</b-badge>
                </div>
              </div>
            </div>
            <br>
            <div :style="getHeight()">
              <div v-for="whatsappInvoice in escazuWhatsappInvoices">
                
                <div v-if="isAdmin==false" style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px;" :class="getAlertAnimation(whatsappInvoice)">
                  <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
          
                    <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                  </div>
                  <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="info">{{ whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                  </div>
                  <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                    <div style="text-align: end;"> 
                      <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; margin-right: 10px; margin-top: 10px;"/>

                    </div>
                    <div style="text-align: end;">
                      <br>
                      <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      <br><br>
                    </div>
                  </div>

                  
                </div>


                <div v-else style="border: 1px solid gray; border-radius: 10px; margin-bottom: 10px;" :class="getAlertAnimation(whatsappInvoice)">
                  <div style="margin-right: 10px; margin-left: 10px;">
                    
                    <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                  </div>
                  
                  <br>
                  <div style="display: flex;">
                    <div style="margin-right: 10px; margin-left: 10px;">
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="info">{{ whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                    </div>
                    <div style="margin-right: 10px; margin-left: 10px;">
                      <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <br>
                      <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; position: relative; top:-5px;"/>
                    </div>
                  </div>
                  <br>
                </div>
              </div>
            </div>
          </b-card>
        </div>

        <div style="width: 25%; margin-right: 1%;">
          <b-card style="height: 90vh; background-color: #a78dcc;">
            <div style="justify-content: center; width: 100%;">
              <div v-if="(herediaCentralWhatsappInvoiceAmount + herediaLocalityWhatsappInvoiceAmount + herediaShippingWhatsappInvoiceAmount) >= 20" style="position: absolute; justify-content: center; top: -75px; z-index: 500; left: 50%; transform: translateX(-50%);">
                <img class="alertAnimation" src="@/assets/pageAssets/p.webp" alt style="width: 120px; height: auto;"/>
              </div>

              <div style="display: flex; justify-content: center;">
                <b-badge style="font-size: x-large; margin-right: 5px; max-height: 40px;" pill variant="secondary">{{motosHeredia}}</b-badge>

                <h1 style="margin-top: auto; margin-bottom: auto;"><strong>HEREDIA</strong></h1>
                <div style="margin-left: 5px;">
                  <b-badge style="font-size: x-large; margin-right: 5px;" pill variant="danger">{{herediaCentralWhatsappInvoiceAmount}}</b-badge>
                  <b-badge style="font-size: x-large; margin-right: 5px;" pill variant="warning">{{herediaLocalityWhatsappInvoiceAmount}}</b-badge>
                  <b-badge style="font-size: x-large;" pill variant="success">{{herediaShippingWhatsappInvoiceAmount}}</b-badge>
                </div>
              </div>
            </div>
            <br>
            <div :style="getHeight()">
              <div v-for="whatsappInvoice in herediaWhatsappInvoices">
                <div v-if="isAdmin==false" style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px;" :class="getAlertAnimation(whatsappInvoice)">
                  <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                    

                    <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                  </div>
                  <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="info">{{ whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                  </div>
                  <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                    <div style="text-align: end;"> 
                      <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; margin-right: 10px; margin-top: 10px;"/>

                    </div>
                    <div style="text-align: end;">
                      <br>
                      <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      <br><br>
                    </div>
                  </div>

                  
                </div>


                <div v-else style="border: 1px solid gray; border-radius: 10px; margin-bottom: 10px;" :class="getAlertAnimation(whatsappInvoice)">
                  <div style="margin-right: 10px; margin-left: 10px;">
                    
                    <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                  </div>
                  
                  <br>
                  <div style="display: flex;">
                    <div style="margin-right: 10px; margin-left: 10px;">
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="info">{{ whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                    </div>
                    <div style="margin-right: 10px; margin-left: 10px;">
                      <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <br>
                      <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; position: relative; top:-5px;"/>
                    </div>
                  </div>
                  <br>
                </div>
              </div>
            </div>
          </b-card>
        </div>

        <div style="width: 25%; margin-right: 1%;">
          <b-card style="height: 90vh; background-color: #55b5ab;">
            <div style="justify-content: center; width: 100%;">
              <div v-if="(cartagoCentralWhatsappInvoiceAmount + cartagoLocalityWhatsappInvoiceAmount + cartagoShippingWhatsappInvoiceAmount) >= 20" style="position: absolute; justify-content: center; top: -75px; z-index: 500; left: 50%; transform: translateX(-50%);">
                <img class="alertAnimation" src="@/assets/pageAssets/p.webp" alt style="width: 120px; height: auto;"/>
              </div>

              <div style="display: flex; justify-content: center;">
                <b-badge style="font-size: x-large; margin-right: 5px; max-height: 40px;" pill variant="secondary">{{motosCartago}}</b-badge>

                <h1 style="margin-top: auto; margin-bottom: auto;"><strong>CARTAGO</strong></h1>
                <div style="margin-left: 5px;">
                  <b-badge style="font-size: x-large; margin-right: 5px;" pill variant="danger">{{cartagoCentralWhatsappInvoiceAmount}}</b-badge>
                  <b-badge style="font-size: x-large; margin-right: 5px;" pill variant="warning">{{cartagoLocalityWhatsappInvoiceAmount}}</b-badge>
                  <b-badge style="font-size: x-large;" pill variant="success">{{cartagoShippingWhatsappInvoiceAmount}}</b-badge>
                </div>
              </div>
            </div>
            <br>
            <div :style="getHeight()">
              <div v-for="whatsappInvoice in cartagoWhatsappInvoices">
                <div v-if="isAdmin==false" style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px;" :class="getAlertAnimation(whatsappInvoice)">
                  <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                    
                    <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                  </div>
                  <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="info">{{ whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                    <br>
                    <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                  </div>
                  <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                    <div style="text-align: end;"> 
                      <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; margin-right: 10px; margin-top: 10px;"/>
                    </div>
                    <div style="text-align: end;">
                      <br>
                      <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      <br><br>
                    </div>
                  </div>

                  
                </div>


                <div v-else style="border: 1px solid gray; border-radius: 10px; margin-bottom: 10px;" :class="getAlertAnimation(whatsappInvoice)">
                  <div style="margin-right: 10px; margin-left: 10px;">
                    

                    <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                    <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                  </div>
                  
                  <br>
                  <div style="display: flex;">
                    <div style="margin-right: 10px; margin-left: 10px;">
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="info">{{ whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                      <br>
                      <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                    </div>
                    <div style="margin-right: 10px; margin-left: 10px;">
                      <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      <br>
                      <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                      <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; position: relative; top:-5px;"/>
                    </div>
                  </div>
                  <br>
                </div>
              </div>
            </div>
          </b-card>
        </div>
      </div>

      <br><br>

      <div style="padding: 10px; background-color: #dedede;">
        
        <vue-good-table
          :columns="whatsappInvoiceColumns"
          :line-numbers="false"
          styleClass="order-table vgt-table"
          :rows="expressInvoices"
        >

          <template slot="table-row" slot-scope="props">
            <div v-if="props.column.field == 'localityName'">
              <p style="margin: 0px;"><strong>Localidad: </strong>{{ props.row.localityName }}</p>
              <p style="margin: 0px;"><strong>Agente: </strong>{{ props.row.agentName }}</p>
              <p style="margin: 0px;"><strong>Fecha: </strong>{{ parseHour(props.row.whatsappInvoiceCentralDateTime) }}</p>
            </div>

            <div v-else-if="props.column.field == 'whatsappInvoiceClientName'">
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

      <br><br>


    </div>

    <div v-if="agentType == 'locality'">

      <b-card>
        <div style="position: absolute; top: -90px; z-index: 500; left: 50%; transform: translateX(-50%);">
          <div style="display: flex; justify-content: center;">
            
            <img v-if="(localityWhatsappInvoiceAmount + shippingWhatsappInvoiceAmount) >= 20" class="alertAnimation" src="@/assets/pageAssets/p.webp" alt style="width: 70px; height: 40px; margin-right: 30px;"/>
            <h1 style="margin-top: auto; margin-bottom: auto; position: relative; top: -5px;"><strong>{{ localityName }}</strong></h1>
            <div style="margin-left: 30px;">
              <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="warning">{{localityWhatsappInvoiceAmount}}</b-badge>
              <b-badge style="font-size: x-large;" pill variant="success">{{shippingWhatsappInvoiceAmount}}</b-badge>
            </div>
            <div style="display: flex; margin-left: 30px;">
              <h1 v-b-modal.deliveredInvoicesModal @click="selectTodayDeliveredInvoices()" style="margin-right: 7px; cursor: pointer;">📦</h1>
              <h1 v-b-modal.motosModal @click="openMotosModal(true)" style="margin-right: 7px; cursor: pointer;">🏍️</h1>
              <h1 v-b-modal.deliveredInvoicesModal @click="selectTodayCanceledInvoices()" style="margin-right: 7px; cursor: pointer;">❌</h1>
              <h1 @click="openMapModal()" style="cursor: pointer;">🌎</h1>
            </div>
            <div style="position: absolute; right: -270px; top: -8px">
              <img v-if="live" class="liveLogo" src="../../../assets/pageAssets/live.png">
              <img v-else class="noliveLogo" src="../../../assets/pageAssets/nolive.png">
            </div>
          </div>
        </div>
        
        <div style="display: flex; width: 100%;">
          <div style="background-color: #faa250; border-radius: 15px; width: 50%; margin-right: 0.5%; max-height: 75vh; overflow-y: auto;">
            <div style="padding: 20px;">
              <div v-for="whatsappInvoice in localityWhatsappInvoices">
                <div v-if="whatsappInvoice.whatsappInvoiceState != 'R'">
                  <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; width: 100%;" :class="getAlertAnimation(whatsappInvoice)">
                    <div style="width: 70%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">

                      <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                      <h5 style="cursor: pointer;"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                      <h5 style="cursor: pointer;"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                      <h5 style="cursor: pointer;"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                      <h5 style="cursor: pointer;"><strong>Método de pago: </strong>{{ whatsappInvoice.whatsappInvoicePaymentMethod }}</h5>

                      <h5 style="cursor: pointer;"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                    </div>
                    <div style="width: 30%; margin-top: auto; margin-bottom: auto;">
                      <div style="display: flex; margin-top: 10px;">
                        
                        <b-form-checkbox value="1" unchecked-value="0" @input="updateWhatsappInvoiceHasBeenBilled(whatsappInvoice)" v-model="whatsappInvoice.whatsappInvoiceHasBeenBilled" style="position: relative; top: -20px;" size="lg"></b-form-checkbox>

                        <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                        <i v-b-modal.localityWhatsappInvoiceInformationModal @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      </div>
                      <div style="margin-top: 10px; margin-bottom: 10px; margin-right: 10px;">
                        <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                        <br>
                        <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                      </div>
                      <div style="text-align: end; margin-bottom: 10px;">
                        <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; margin-right: 15px;"/>
                        <br><br>
                        <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                        <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                        <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style="background-color: #578f60; border-radius: 15px; width: 50%; margin-left: 0.5%; max-height: 75vh; overflow-y: auto;">
            <div style="padding: 20px;">
              <div v-for="whatsappInvoice in localityWhatsappInvoices">
                <div v-if="whatsappInvoice.whatsappInvoiceState == 'R'">
                  <div :style="getLocalityAgentColor(whatsappInvoice)">
                    <div style="width: 70%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">

                      <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                      <h5 style="cursor: pointer;"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                      <h5 style="cursor: pointer;"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                      <h5 style="cursor: pointer;"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                      <h5 style="cursor: pointer;"><strong>Método de pago: </strong>{{ whatsappInvoice.whatsappInvoicePaymentMethod }}</h5>

                      <h5 style="cursor: pointer;"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                    </div>
                    <div style="width: 30%; margin-top: auto; margin-bottom: auto;">
                      <div style="display: flex; margin-top: 10px;">
                        
                        <b-form-checkbox value="1" unchecked-value="0" @input="updateWhatsappInvoiceHasBeenBilled(whatsappInvoice)" v-model="whatsappInvoice.whatsappInvoiceHasBeenBilled" style="position: relative; top: -20px;" size="lg"></b-form-checkbox>

                        <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                        <i v-b-modal.localityWhatsappInvoiceInformationModal @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                      </div>
                      <div style="margin-top: 10px; margin-bottom: 10px; margin-right: 10px;">
                        <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                        <br>
                        <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                      </div>
                      <div style="text-align: end; margin-bottom: 10px;">
                        <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; margin-right: 15px;"/>
                        <br><br>
                        <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                        <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                        <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-card>
    </div>

    
    <div v-if="agentType == 'localityAgent'">
      <b-card :style="localityColor">
        <div style="justify-content: center; display: flex;">
          <b-badge style="font-size: x-large;" pill variant="success">{{localityAgentInvoicesAmount}}</b-badge>
        </div>
        <br>
        
        <div style="max-height: 75vh; overflow-y: auto; display: flex; gap: 10px; flex-wrap: wrap;  width: 100%;">
          <div v-for="whatsappInvoice in localityAgentInvoices">
            <div :style="getLocalityAgentPhoneColor()">
              <div style="width: 70%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                <h5 style="cursor: pointer;"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                <h5 style="cursor: pointer;"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                <h5 style="cursor: pointer;"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                <h5 style="cursor: pointer;"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
              </div>
              <div style="width: 30%; margin-top: auto; margin-bottom: auto;">
                <div style="display: flex; margin-top: 10px;"> 
                  <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                  <i v-b-modal.mensajeroModal @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                </div>
                <div style="margin-top: 10px; margin-bottom: 10px; margin-right: 10px;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                </div>
                <div style="text-align: end; margin-bottom: 10px;">
                  <img v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated" class="alertAnimation" src="@/assets/pageAssets/alert.png" alt style="width: 33px; height: auto; margin-right: 15px;"/>
                  <br><br>
                  <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'R'" v-b-modal.shippingModal @click="tryToShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-card>
    </div>


  </div>
</template>

<style>
.noliveLogo {
    width: 90px; 
    height: 55px; 
  }

  .liveLogo {
    width: 90px; 
    height: 55px; 
    animation: liveLogoAnimation 3s infinite;
  }

@keyframes aja {
    0% {
    }
    50% {
      background-color: #db67a3;
    }
    100% {
    }
  }

  .hotAnimation {
    animation: aja 1.4s infinite;
  }


  @keyframes alertAnimationAnimate {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.25);
    }
    100% {
      transform: scale(1);

    }
  }


  @keyframes invoiceAlertAnimate {
    0% {
      background-color: white;
    }
    50% {
      background-color: rgb(255, 85, 85);
    }
    100% {
      background-color: white;
    }
  }

  .alertAnimation{
    animation: alertAnimationAnimate 1s infinite;
  }

  .invoiceAlertAnimation{
    animation: invoiceAlertAnimate 2.5s infinite;
  }
  

  .notForToday{
    background-color: #a8a8a8;
  }

  .forToday{
    background-color: white;  
  }

  @keyframes liveLogoAnimation {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.15);
    }
    100% {
      transform: scale(1);
    }
  }


</style>


<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js');
import VueBarcode from 'vue-barcode';
import MapComponent from "../../../components/mapComponent.vue";


export default {
  components: {VueBarcode, MapComponent},

  data() {
    return {
      mensajerosInitial: null,
      mensajerosEnd: null,
      loaderMotos: false,

      localityAgentColor: '',
      
      errorCount: 0,

      isAdmin: false,

      localityAgentTable: [
        {
          label: "",
          field: "text",
          thClass: "text-left",
          tdClass: "text-left",
          sortable: false
        },
        {
          label: "",
          field: "value",
          thClass: "text-left",
          tdClass: "text-left",
          sortable: false
        }
      ],

      deliveredInvoicesTable: [
        {
          label: "",
          field: "whatsappInvoiceAgentID",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre",
          field: "whatsappInvoiceClientName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Número",
          field: "whatsappInvoiceClientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Monto",
          field: "whatsappInvoiceAmount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Mensajero",
          field: "localityAgentName",
          thClass: "text-left",
          tdClass: "text-left"
        }
      ],

      localityAgentInvoices: [],
      localityAgentInvoicesAmount: 0,

      cartagoMap: [],
      cartagoMapOptions: {
        strokeColor: "#55b5ab",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#55b5ab",
        fillOpacity: 0.4,
      },

      zapoteMap: [],
      zapoteMapOptions: {
        strokeColor: "#fed330",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#fed330",
        fillOpacity: 0.4,
      },

      herediaMap: [],
      herediaMapOptions: {
        strokeColor: "#a78dcc",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#a78dcc",
        fillOpacity: 0.4,
      },

      escazuMap: [],
      escazuMapOptions: {
        strokeColor: "#db67a3",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#db67a3",
        fillOpacity: 0.4,
      },

      redMap: [],
      redMapOptions: {},

      zapoteWhatsappInvoices: [],
      zapoteCentralWhatsappInvoiceAmount: 0,
      zapoteLocalityWhatsappInvoiceAmount: 0,
      zapoteShippingWhatsappInvoiceAmount: 0,

      escazuWhatsappInvoices: [],
      escazuCentralWhatsappInvoiceAmount: 0,
      escazuLocalityWhatsappInvoiceAmount: 0,
      escazuShippingWhatsappInvoiceAmount: 0,

      herediaWhatsappInvoices: [],
      herediaCentralWhatsappInvoiceAmount: 0,
      herediaLocalityWhatsappInvoiceAmount: 0,
      herediaShippingWhatsappInvoiceAmount: 0,

      cartagoWhatsappInvoices: [],
      cartagoCentralWhatsappInvoiceAmount: 0,
      cartagoLocalityWhatsappInvoiceAmount: 0,
      cartagoShippingWhatsappInvoiceAmount: 0,

      expressInvoices: [],

      localityName: '',
      localityColor: '',
      localityWhatsappInvoiceAmount: 0,
      shippingWhatsappInvoiceAmount: 0,
      localityWhatsappInvoices: [],

      updatedWhatsappInvoiceID: 0,
      updatedWhatsappInvoiceClientName: '',
      updatedWhatsappInvoiceClientPhoneNumber: '',
      updatedWhatsappInvoiceAmount: '',

      updateWhatsappInvoiceAgentIDOptions: [],
      updatedWhatsappInvoiceAgentID: '',

      whatsappInvoiceProductsColumns: [
        {
          label: "Código",
          field: "CodigoP",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Nombre",
          field: "descripcion",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cantidad",
          field: "cantidad",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Precio",
          field: "precio",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Descuento",
          field: "descuento",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],
      whatsappInvoiceProducts: [],

      updatedWhatsappInvoice: {},

      updateWhatsappInvoiceLocalityOptions: [{value: 1, text: 'King Vape Zapote'}, , {value: 4, text: 'King Vape Escazú'}, {value: 5, text: 'King Vape Heredia'}, {value: 3, text: 'King Vape Cartago'}],

      updateWhatsappInvoiceStateOptions: [{value: 'C', text: 'Central'}, , {value: 'S', text: 'Sucursal'}, {value: 'E', text: 'Entregado'}, {value: 'X', text: 'Cancelado'}],
      updateWhatsappInvoiceShippingMethodOptions: [{value: 'Envío por motorizado', text: 'Envío por motorizado'}, {value: 'Retiro en sucursal', text: 'Retiro en sucursal'}, {value: 'Correos de CR', text: 'Correos de CR'}, {value: 'Encomienda', text: 'Encomienda'}, {value: 'Uber Flash', text: 'Uber Flash'}],
      updateWhatsappInvoicePaymentMethodOptions: [{value: 'Efectivo', text: 'Efectivo'}, {value: 'Tarjeta', text: 'Tarjeta'}, {value: 'SINPE (confirmado)', text: 'SINPE (confirmado)'}, {value: 'SINPE (contra entrega)', text: 'SINPE (contra entrega)'}, {value: 'Transferencia', text: 'Transferencia'}, {value: 'Pago mixto', text: 'Pago mixto'}],
      updateWhatsappInvoicePaymentStateOptions: [{value: 'Pagado', text: 'Pagado'}, {value: 'Pendiente', text: 'Pendiente'}, {value: 'Pago parcial', text: 'Pago parcial'}],


      updatedWhatsappInvoiceLocation: 'Ubicación original',
      updateWhatsappInvoiceLocationOptions: [{value: 'Ubicación original', text: 'Ubicación original'}],

      localityAgentOptions: [],
      assignedLocalityAgent: 0,
      assignedWhatsappInvoice: {},

      localityAgentBillerOptions: [],
      assignedLocalityAgentBiller: 0,

      queryInterval: null,
      soundInterval: null,
      locationInterval: null,
      agentType: 'central',

      shippingInvoice: null,
      notShippedReason: '',

      deliveredInvoices: [],
      loaderDelivered: false,
      loaderReturned: false,


      backendURL: 'https://payitcr.com',

      opcionesGraficoCircular: {},
      datosGraficoCircular: [],
      
      mapCenter: null,
      locations: [],

      live: null,


      mensajerosToday: [],
      motosZapote: 0,
      motosEscazu: 0,
      motosHeredia: 0,
      motosCartago: 0,


      insertIDModalLoader: false,
      
      currentClientSource: null,
      currentClientType: null,

      currentAuthorizedSource: null,
      currentAuthorizedType: null,

      file: null,

      newSource: null,
      idphone: null,
      isClient: false,


      whatsappInvoiceColumns:
      [
        {
          label: "ID",
          field: "whatsappInvoiceID",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Órden",
          field: "localityName",
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

      whatsappInvoiceState: '',
      whatsappInvoiceNotShippedReason: ''
    };
  },

  watch: {
    mensajerosInitial(){
      this.openMotosModal(false);

    },

    mensajerosEnd(){
      this.openMotosModal(false);
    }
  },
  
  methods: {

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

    openConfirmationModal(whatsappInvoice, whatsappInvoiceState){
      this.updatedWhatsappInvoice = whatsappInvoice;
      this.whatsappInvoiceState = whatsappInvoiceState;
      this.whatsappInvoiceNotShippedReason = '';
    },

    cerrarMensajeroModal(){
      this.$root.$emit('bv::hide::modal', 'mensajeroModal');
    },

    insertClientIDS(){
      this.insertIDModalLoader = true;
      axios.post(constants.routes.backendAPI+'/insertClientIDS',
      {
        'idIsClient': this.isClient,
        'clientIDSPhoneNumber': this.idphone,
        'clientIDSType': 'image',
        'clientIDSImage': this.newSource
      })
      .then((response) =>{
        if (response.data.success){
          this.insertIDModalLoader = false;
          this.$root.$emit('bv::hide::modal', 'insertIDModal');
          this.showNotification('success', 'Cédula del cliente registrada', 'Se ha registrado la cédula del cliente exitosamente.');
        } else {
          this.showNotification('danger', 'Error al registrar la cédula del cliente', 'Ha ocurrido un error inesperado registrar la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.$root.$emit('bv::hide::modal', 'insertIDModal');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al registrar la cédula del cliente', 'Ha ocurrido un error inesperado registrar la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.$root.$emit('bv::hide::modal', 'insertIDModal');
      })
    },

    changeImage(){
      this.file = this.isClient ? this.$refs.imageFile1.files[0] : this.$refs.imageFile2.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onload = () => {
        this.newSource = reader.result;
        this.insertClientIDS();
      };
      reader.onerror = function (error) {
        this.showNotification('danger', 'Error al cargar la imagen', 'Ha ocurrido un error inesperado al cargar la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      };
    },

    uploadImage(isClient){
      this.isClient = isClient;
      if (this.isClient){
        document.getElementById('imageUploader1').click();
      } else {
        document.getElementById('imageUploader2').click();
      }
    },

    openInsertClientIDSImage(phoneNumber){
      this.idphone = phoneNumber;
      this.insertIDModalLoader = true;
      
      this.currentClientSource = null;
      this.currentClientType = null;
      this.currentAuthorizedSource = null;
      this.currentAuthorizedType = null;

      this.newSource = null;

      this.$root.$emit('bv::show::modal', 'insertIDModal');
      
      axios.post(constants.routes.backendAPI+'/selectClientIDSImage',
      {
        'clientIDSPhoneNumber': phoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          if (response.data.result.source){
            if (response.data.result.type == 'image'){
              this.currentClientSource = `data:image/png;base64,${response.data.result.source}`;
              this.currentClientType = response.data.result.type;
            } else {
              const binaryString = window.atob(response.data.result.source);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: 'application/pdf' });
              this.currentClientSource = URL.createObjectURL(blob);
              this.currentClientType = response.data.result.type;
            }
          }
          if (response.data.result.secondarySource){
            if (response.data.result.secondaryType == 'image'){
              this.currentAuthorizedSource = `data:image/png;base64,${response.data.result.secondarySource}`;
              this.currentAuthorizedType = response.data.result.secondaryType;
            } else {
              const binaryString = window.atob(response.data.result.secondarySource);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const blob = new Blob([bytes], { type: 'application/pdf' });
              this.currentAuthorizedSource = URL.createObjectURL(blob);
              this.currentAuthorizedType = response.data.result.secondaryType;
            }
          }
          this.insertIDModalLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la cédula del cliente', 'Ha ocurrido un error inesperado abrir la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.$root.$emit('bv::hide::modal', 'insertIDModal');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al abrir la cédula del cliente', 'Ha ocurrido un error inesperado abrir la cédula del cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.$root.$emit('bv::hide::modal', 'insertIDModal');
      })
      
    },


    openMapModal(){
      this.locations = [];
      for (var invoiceIndex in this.localityWhatsappInvoices){
        const invoice = this.localityWhatsappInvoices[invoiceIndex];
        if (invoice.whatsappInvoiceClientLocation != ''){
          this.locations.push
          ({
            'latitude': JSON.parse(invoice.whatsappInvoiceClientLocation).latitude,
            'longitude': JSON.parse(invoice.whatsappInvoiceClientLocation).longitude,
            'clientName': invoice.whatsappInvoiceClientName,
            'clientPhoneNumber': invoice.whatsappInvoiceClientPhoneNumber,
            'amount': invoice.whatsappInvoiceAmount,
            'localityAgentName': invoice.localityAgentName,
            'localityAgentColor': invoice.localityAgentColor,
            'opened': false,
            'whatsappInvoiceID': invoice.whatsappInvoiceID,
            'whatsappInvoiceLocalityID': invoice.whatsappInvoiceLocalityID
          });
        }
      }
      console.log(this.locations);
      this.$root.$emit('bv::show::modal', 'mapModal');
    },


    openMarker(location){
      location.opened = !location.opened;
    },

    getMapLocalityAgentColor(color){
      return 'background-color:' + color;
    },

    getMapIcon(location){
      if (location.whatsappInvoiceState == 'S'){
        return {url: require('../../../assets/pageAssets/smarker.png')};
      } else if (location.whatsappInvoiceState == 'R'){
        try {
          return {url: require(`../../../assets/pageAssets/${location.localityAgentColor}.png`)};
        } catch {
          return {url: require('../../../assets/pageAssets/lmarker.png')};
        }
      } else {
        return {url: require('../../../assets/pageAssets/lmarker.png')};
      }
    },
    
    
    appendLocation(whatsappInvoice){
      if (whatsappInvoice.whatsappInvoiceClientLocation){
        const whatsappInvoiceClientLocation = JSON.parse(whatsappInvoice.whatsappInvoiceClientLocation)  
        if (whatsappInvoiceClientLocation.latitude != 0 && whatsappInvoiceClientLocation.latitude != 0){
          if (whatsappInvoiceClientLocation.latitude != '' && whatsappInvoiceClientLocation.latitude != ''){
            this.locations.push
            ({
              'whatsappInvoiceClientLocation': whatsappInvoiceClientLocation,
              'whatsappInvoiceID': whatsappInvoice.whatsappInvoiceID,
              'whatsappInvoiceClientName': whatsappInvoice.whatsappInvoiceClientName,
              'whatsappInvoiceClientPhoneNumber': whatsappInvoice.whatsappInvoiceClientPhoneNumber,
              'whatsappInvoiceAmount': whatsappInvoice.whatsappInvoiceAmount,
              'whatsappInvoicePaymentMethod': whatsappInvoice.whatsappInvoicePaymentMethod,
              'whatsappInvoicePaymentState': whatsappInvoice.whatsappInvoicePaymentState,
              'whatsappInvoiceLocationNote': whatsappInvoice.whatsappInvoiceLocationNote,
              'whatsappInvoiceShippingMethod': whatsappInvoice.whatsappInvoiceShippingMethod,
              'whatsappInvoiceClientLocationURL': whatsappInvoice.whatsappInvoiceClientLocationURL,
              'whatsappInvoiceShippingNote': whatsappInvoice.whatsappInvoiceShippingNote,
              'whatsappInvoiceProducts': whatsappInvoice.whatsappInvoiceProducts,
              'whatsappInvoiceState': whatsappInvoice.whatsappInvoiceState,
              'localityAgentColor': whatsappInvoice.localityAgentColor,
              'localityAgentName': whatsappInvoice.localityAgentName,
              'opened': false
            });
          }
        }
      }
    },

    updateLocalityAgentIsWorkingToday(mensajero){      
      axios.post(this.backendURL+'/updateLocalityAgentIsWorkingToday', 
      {
        localityAgentID: mensajero.value,
        localityAgentIsWorkingToday: mensajero.today
      })
      .then(async (response) =>{
        if (response.data.success){
          this.showNotification('success', 'Disponibilidad del mensajero actualizada', 'Se ha actualizado la disponibilidad del mensajero exitosamente');
        } else {
          this.showNotification('danger', 'Error al actualizar la disponibilidad del mensajero', 'Ha ocurrido un error inesperado al actualizar la disponibilidad del mensajero. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al actualizar la disponibilidad del mensajero', 'Ha ocurrido un error inesperado al actualizar la disponibilidad del mensajero. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })

      
    },

    getLocalityAgentLabels(names, amounts){
      var agentLabels = [];
      var max = {'amount': 0, 'name': ''};
      var min = {'amount': 100000000, 'name': ''};

      for (var agentIndex in names){
        agentLabels.push(names[agentIndex].text);
        if (amounts[agentIndex] >= max['amount']){
          max = {'amount': amounts[agentIndex], 'name': names[agentIndex].text};
        }
        if (amounts[agentIndex] <= min['amount']){
          min = {'amount': amounts[agentIndex], 'name': names[agentIndex].text};
        }
      }
      for (var agentIndex in agentLabels){
        if (agentLabels[agentIndex] == max['name']){
          agentLabels[agentIndex] = agentLabels[agentIndex] + ' 🔥';
        }
        if (agentLabels[agentIndex] == min['name']){
          agentLabels[agentIndex] = agentLabels[agentIndex] + ' ❄️';
        }
      }
      return agentLabels;
    },



    async openMotosModal(refresh){
      if (refresh){
        this.mensajerosInitial = null;
        this.mensajerosEnd = null;
      }
      this.loaderMotos = true;
      axios.post(this.backendURL+'/selectTodayDeliveredInvoicesByLocality', 
      {
        whatsappInvoiceLocalityID: localStorage.getItem('localityID'),
        initialDate: this.mensajerosInitial,
        endDate: this.mensajerosEnd
      })
      .then(async (response) =>{
        if (response.data.success){
          
          this.deliveredInvoices = response.data.result;

          var aux1 = [];
          for (var agentIndex in this.localityAgentOptions){
            
            var amount = this.deliveredInvoices.filter(invoice => invoice['whatsappInvoiceLocalityAgentID'] == this.localityAgentOptions[agentIndex].value).length;
            aux1.push(amount);
          }
          this.datosGraficoCircular = aux1;

          
          this.opcionesGraficoCircular = 
          {
            chart: {width: 750, type: 'pie', fontSize: 40}, 
            tooltip: {enabled: true}, 
            labels: this.getLocalityAgentLabels(this.localityAgentOptions, aux1),
            legend: {fontSize: '20px'},
            colors: this.localityAgentOptions.map(obj => obj.color)
          };

          await this.selectLocalityAgentNames();
          this.loaderMotos = false;
          
        } else {
          this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
      
    },


    getAlertAnimation(whatsappInvoice){
      if (whatsappInvoice.whatsappInvoiceState == 'C'){
        const elapsedSeconds = Math.floor((new Date() - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000);
        if (elapsedSeconds >= 30){
          return 'invoiceAlertAnimation';
        }
      } else if (whatsappInvoice.whatsappInvoiceIsForToday == 0){
        return 'notForToday';
      } 
      return 'forToday';
    },

    getLocalityAgentPhoneColor(){
      return 'display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; width: 100%; background-color: ' + this.localityAgentColor;
    },

    getLocalityAgentColor(whatsappInvoice){
      const whatsappInvoiceLocalityAgentID = whatsappInvoice.whatsappInvoiceLocalityAgentID;
      for (var localityAgentIndex in this.localityAgentOptions){
        const localityAgent = this.localityAgentOptions[localityAgentIndex];
        if (localityAgent.value == whatsappInvoiceLocalityAgentID){
          return 'display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; width: 100%; background-color: ' + localityAgent.color; 
        }
      }
      return 'display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; width: 100%; background-color: white;';
    },

    getLocalityAgentOptionColor(localityAgentOption){
      return 'background-color: ' + localityAgentOption.color;
    },

    getLocalityAgentReportStyle(localityAgentColor){
      return 'width: 100%; background-color: ' + localityAgentColor;
    },

    getLocalityAgentTableStyle(localityAgentID){
      for (var localityAgentIndex in this.localityAgentOptions){
        const localityAgent = this.localityAgentOptions[localityAgentIndex];
        if (localityAgent.value == localityAgentID){
          return 'background-color: ' + localityAgent.color; 
        }
      }
      return 'background-color: white'; 
    },

    getHeight(){
      if(this.isAdmin){
        return 'height: 70vh; overflow-y: auto;';
      } else {
        return 'height: 80vh; overflow-y: auto;';
      }
    },
    playSound(soundType){
      if (soundType == 'invoice'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/invoice.wav'));
      } else if (soundType == 'update'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/update.wav'));
      } else if (soundType == 'screen'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/screen.mp3'));
      }
      soundToPlay.play();
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

    returnWhatsappConversation(){
      this.loaderReturned = true;
      axios.post(this.backendURL+'/returnWhatsappConversation', 
      {
        whatsappConversationRecipientPhoneNumber: this.updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber,
        whatsappConversationID: this.updatedWhatsappInvoice.whatsappInvoiceWhatsappConversationID,
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID
      })
      .then((response) =>{
        if (response.data.success){
          this.$root.$emit('bv::hide::modal', 'localityWhatsappInvoiceInformationModal');
          this.$root.$emit('bv::hide::modal', 'updateWhatsappInvoiceInformation');
          this.loaderReturned = false;
          this.showNotification('success', 'Comanda regresada al call center', 'Se ha regresado la órden al call center. Para que la conversación se refleje en el sistema del usuario, recuerde actualizar la aplicación');
        } else {
          if (response.data.result == 1){
            this.showNotification('danger', 'Error al regresar la órden al call center', 'Ha ocurrido un error inesperado al regresar la órden al call center. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          } else if (response.data.result == 2){
            this.showNotification('danger', 'Error al regresar la órden al call center', 'El cliente tiene una conversación activa en este momento. Si necesita regresar la órden, por favor cierre la conversación activa con el cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          } else if (response.data.result == 3){
            this.showNotification('danger', 'Error al eliminar la órden', 'Ha ocurrido un error inesperado al regresar la eliminar la órden. Si necesita regresar la órden, por favor cierre la conversación activa con el cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          } else if (response.data.result == 4){
            this.showNotification('danger', 'Error al reactivar la conversación', 'Ha ocurrido un error inesperado al reactivar la conversación. Si necesita regresar la órden, por favor cierre la conversación activa con el cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
          this.loaderReturned = false;
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al regresar la órden al call center', 'Ha ocurrido un error inesperado al regresar la órden al call center. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.loaderReturned = false;
      })

    },

    selectTodayInvoicesByLocalityAgent(){
      this.loaderDelivered = true;
      axios.post(this.backendURL+'/selectTodayInvoicesByLocalityAgent', 
      {
        whatsappInvoiceLocalityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          this.loaderDelivered = false;
          this.deliveredInvoices = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.loaderDelivered = false;
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al no entregar la órden', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.loaderDelivered = false;
      })
    },

    selectTodayDeliveredInvoices(){

      this.loaderDelivered = true;
      axios.post(this.backendURL+'/selectTodayDeliveredInvoicesByLocality', 
      {
        whatsappInvoiceLocalityID: localStorage.getItem('localityID'),
        initialDate: this.mensajerosInitial,
        endDate: this.mensajerosEnd
      })
      .then((response) =>{
        if (response.data.success){
          this.loaderDelivered = false;
          this.deliveredInvoices = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.loaderDelivered = false;
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al no entregar la órden', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.loaderDelivered = false;
      })
    },

    selectTodayCanceledInvoices(){
      this.loaderDelivered = true;
      axios.post(this.backendURL+'/selectTodayCanceledInvoicesByLocality', 
      {
        whatsappInvoiceLocalityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          this.loaderDelivered = false;
          this.deliveredInvoices = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.loaderDelivered = false;
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al no entregar la órden', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.loaderDelivered = false;
      })
    },

    notShippedInvoice(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.notShippedReason)){
        axios.post(this.backendURL+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: this.shippingInvoice.whatsappInvoiceID,
          whatsappInvoiceState: 'NE',
          whatsappInvoiceLocalityID: this.shippingInvoice.whatsappInvoiceLocalityID,
          returnedFromShippingToLocality: true,
          whatsappInvoiceNotShippedReason: this.notShippedReason
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Comanda marcada como no entregada', 'Se ha marcado la órden como no entregada exitosamente.');
            this.$root.$emit('bv::hide::modal', 'shippingModal');
          } else {
            this.showNotification('danger', 'Error al no entregar la órden', 'Ha ocurrido un error inesperado al no entregar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al no entregar la órden', 'Ha ocurrido un error inesperado al no entregar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      } else {
        this.showNotification('danger', 'Error al no entregar la órden', 'Por favor, coloque un motivo para no entregar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      }
    },

    tryToShippingInvoice(whatsappInvoice){
      this.shippingInvoice = whatsappInvoice;
      this.notShippedReason = '';
    },

    contactClient(){
      const whatsappNumber = this.updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber;
      const agentName = localStorage.getItem('localityAgentName');
      const whatsappInvoiceID = this.updatedWhatsappInvoice.whatsappInvoiceID;

      const texto = '*NÚMERO DE ÓRDEN*: ' + whatsappInvoiceID + ' ¡Hola! Mi nombre es ' + agentName + ', soy el mensajero de King Vape. El día de hoy estoy a cargo de la tu pedido. Estaré lo más pronto posible en tu ubicación. ¡Muchas gracias por tu espera! 🏍️🔥';
      var url = 'https://api.whatsapp.com/send?phone=' + whatsappNumber + '&text=' + texto
      window.open(url, '_blank');

    },

    goToURL(url){
      window.open(url, '_blank');
    },

    goWithMaps(){
      const location = JSON.parse(this.updatedWhatsappInvoice.whatsappInvoiceClientLocation);
      var url = 'https://maps.google.com?q=' + location.latitude  + ',' + location.longitude;
      window.open(url, '_blank');
    },

    goWithWaze(){
      const location = JSON.parse(this.updatedWhatsappInvoice.whatsappInvoiceClientLocation);
      var url = 'https://www.waze.com/ul?ll=' + location.latitude + ',' + location.longitude + '&navigate=yes';
      window.open(url, '_blank');
    },

    clickOnCentralInvoice(whatsappInvoice, aux=false){
      if (this.agentType == 'central' || aux){
        axios.post(this.backendURL+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: whatsappInvoice.whatsappInvoiceID,
          whatsappInvoiceState: 'S',
          whatsappInvoiceLocalityID: whatsappInvoice.whatsappInvoiceLocalityID,
          returnedFromShippingToLocality: false
        })
        .then((response) =>{
          if (response.data.success){
            aux ? this.showNotification('success', 'Comanda retornada a la sucursal', 'Se ha retornado la órden a la sucursal existosamente.') : this.showNotification('success', 'Comanda enviada', 'Se ha enviado la órden existosamente.');
          } else {
            this.showNotification('danger', 'Error al enviar la órden', 'Ha ocurrido un error inesperado al enviar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al enviar la órden', 'Ha ocurrido un error inesperado al enviar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      }
    },

    clickOnLocalityInvoice(whatsappInvoice){
      if (this.agentType == 'locality'){
        if (whatsappInvoice.whatsappInvoiceShippingMethod == 'Retiro en sucursal' || whatsappInvoice.whatsappInvoiceShippingMethod == 'Uber Flash'){
          this.$root.$emit('bv::show::modal', 'deliverModal');
          this.assignedWhatsappInvoice = whatsappInvoice;
          this.assignedLocalityAgent = null;
          this.assignedLocalityAgentBiller = null;
        } else {
          this.$root.$emit('bv::show::modal', 'assignLocalityAgentModal');
          this.assignedWhatsappInvoice = whatsappInvoice;
          this.assignedLocalityAgent = null;
          this.assignedLocalityAgentBiller = null;
        }
      }
    },
    
    clickOnShippingInvoice(whatsappInvoice){
      if (whatsappInvoice.whatsappInvoiceSINPEApproved == false && whatsappInvoice.whatsappInvoicePaymentMethod == 'SINPE (contra entrega)'){
        this.showNotification('info', 'SINPE no confirmado', 'El SINPE contra entrega no ha sido confirmado desde el call center. La orden no puede ser entregada.');
      } else {

        if (this.agentType == 'localityAgent'){
          axios.post(this.backendURL+'/updateWhatsappInvoiceState', 
          {
            whatsappInvoiceID: whatsappInvoice.whatsappInvoiceID,
            whatsappInvoiceState: 'E'
          })
          .then((response) =>{
            if (response.data.success){
              this.showNotification('success', 'Comanda entregada', 'Se ha entregado la órden existosamente.');
              this.$root.$emit('bv::hide::modal', 'shippingModal');
            } else {
              this.showNotification('danger', 'Error al entregar la órden', 'Ha ocurrido un error inesperado al entregar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
            }
          })
          .catch(() => {
            this.showNotification('danger', 'Error al entregar la órden', 'Ha ocurrido un error inesperado al entregar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          })
        }
      }

    },


    assignLocalityAgent(){
      if ((this.assignedLocalityAgent != null) && (this.assignedLocalityAgentBiller != null)){        
        axios.post(this.backendURL+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: this.assignedWhatsappInvoice.whatsappInvoiceID,
          whatsappInvoiceState: 'R',
          whatsappInvoiceLocalityID: this.assignedWhatsappInvoice.whatsappInvoiceLocalityID,
          whatsappInvoiceLocalityAgentID: this.assignedLocalityAgent,
          whatsappInvoiceLocalityAgentBillerID: this.assignedLocalityAgentBiller
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Comanda asignada', 'Se ha asignado la órden existosamente.');
          } else {
            this.showNotification('danger', 'Error al asignar la órden', 'Ha ocurrido un error inesperado al asignar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al asignar la órden', 'Ha ocurrido un error inesperado al asignar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      } else {
        this.showNotification('danger', 'Error al asignar la órden', 'Complete el mensajero asignado y el facturador e intente nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      }
    },


    deliverInvoice(){
      if (this.assignedLocalityAgentBiller != null){        
        axios.post(this.backendURL+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: this.assignedWhatsappInvoice.whatsappInvoiceID,
          whatsappInvoiceState: 'E',
          whatsappInvoiceLocalityID: this.assignedWhatsappInvoice.whatsappInvoiceLocalityID,
          whatsappInvoiceLocalityAgentID: null,
          whatsappInvoiceLocalityAgentBillerID: this.assignedLocalityAgentBiller
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Comanda entregada', 'Se ha entregado la órden existosamente.');
          } else {
            this.showNotification('danger', 'Error al entregar la órden', 'Ha ocurrido un error inesperado al entregar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al entregar la órden', 'Ha ocurrido un error inesperado al entregar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      } else {
        this.showNotification('danger', 'Error al entregar la órden', 'Complete el facturador e intente nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      }
    },


    updateWhatsappInvoiceClientName(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceClientName', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoiceID,
        whatsappInvoiceClientName: this.updatedWhatsappInvoiceClientName
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Nombre modificado', 'Se ha modificado el nombre de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceClientPhoneNumber(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceClientPhoneNumber', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoiceID,
        whatsappInvoiceClientPhoneNumber: this.updatedWhatsappInvoiceClientPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Número modificado', 'Se ha modificado el número de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceAmount(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceAmount', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoiceID,
        whatsappInvoiceAmount: this.updatedWhatsappInvoiceAmount
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Monto modificado', 'Se ha modificado el monto de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceAgentID(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceAgentID', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoiceID,
        whatsappInvoiceAgentID: this.updatedWhatsappInvoiceAgentID
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Agente modificado', 'Se ha modificado el agente de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceState(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceState', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceState: this.updatedWhatsappInvoice.whatsappInvoiceState,
        whatsappInvoiceLocalityID: this.updatedWhatsappInvoice.whatsappInvoiceLocalityID,
        returnedFromShippingToLocality: true
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Estado modificado', 'Se ha modificado el estado de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al cambiar el estado de la órden', 'Ha ocurrido un error inesperado al cambiar el estado de la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al cambiar el estado de la órden', 'Ha ocurrido un error inesperado al cambiar el estado de la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceHasBeenBilled(whatsappInvoice){
      axios.post(this.backendURL+'/updateWhatsappInvoiceHasBeenBilled', 
      {
        whatsappInvoiceID: whatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceHasBeenBilled: whatsappInvoice.whatsappInvoiceHasBeenBilled
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Estado de la órden modificada', 'Se ha modificado el estado de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceIsForToday(whatsappInvoice){
      axios.post(this.backendURL+'/updateWhatsappInvoiceIsForToday', 
      {
        whatsappInvoiceID: whatsappInvoice.whatsappInvoiceID,
        updateWhatsappInvoiceIsForToday: whatsappInvoice.whatsappInvoiceIsForToday
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Estado de la órden modificada', 'Se ha modificado el estado de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceLocalityID(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceLocalityID', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceLocalityID: this.updatedWhatsappInvoice.whatsappInvoiceLocalityID
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Localidad modificada', 'Se ha modificado la localidad de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceShippingMethod(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceShippingMethod', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceShippingMethod: this.updatedWhatsappInvoice.whatsappInvoiceShippingMethod
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Método de envío modificado', 'Se ha modificado el método de envío de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoicePaymentMethod(){
      axios.post(this.backendURL+'/updateWhatsappInvoicePaymentMethod', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoicePaymentMethod: this.updatedWhatsappInvoice.whatsappInvoicePaymentMethod
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Método de pago modificado', 'Se ha modificado el método de pago de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoicePaymentState(){
      axios.post(this.backendURL+'/updateWhatsappInvoicePaymentState', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoicePaymentState: this.updatedWhatsappInvoice.whatsappInvoicePaymentState
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Estado de pago modificado', 'Se ha modificado el estado de pago de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceLocationNote(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceLocationNote', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceLocationNote: this.updatedWhatsappInvoice.whatsappInvoiceLocationNote
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Nota de la dirección modificada', 'Se ha modificado la nota de la dirección de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceShippingNote(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceShippingNote', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceShippingNote: this.updatedWhatsappInvoice.whatsappInvoiceShippingNote
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Nota de la ubicación modificada', 'Se ha modificado la nota de la ubicación de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceLocalityAgentID(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceLocalityAgentID', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceLocalityAgentID: this.updatedWhatsappInvoice.whatsappInvoiceLocalityAgentID
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Mensajero reasignado', 'Se ha reasignado el mensajero de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceClientLocation(){
      var whatsappInvoiceLocationID = '';
      for (var whatsappInvoiceLocationIndex in this.updateWhatsappInvoiceLocationOptions){
        const whatsappInvoiceLocation = this.updateWhatsappInvoiceLocationOptions[whatsappInvoiceLocationIndex];
        const whatsappInvoiceLocationLocation = whatsappInvoiceLocation.value;
        if (whatsappInvoiceLocationLocation != 'Ubicación original'){
          var a = JSON.stringify(JSON.parse(whatsappInvoiceLocationLocation));
          var b = JSON.stringify(JSON.parse(this.updatedWhatsappInvoice.whatsappInvoiceClientLocation));
          if (a === b){
            whatsappInvoiceLocationID = whatsappInvoiceLocation.id;
          }
        }
      }
      axios.post(this.backendURL+'/updateWhatsappInvoiceClientLocation', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceClientLocation: this.updatedWhatsappInvoice.whatsappInvoiceClientLocation,
        'whatsappInvoiceLocationID': whatsappInvoiceLocationID
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Ubicación modificada', 'Se ha modificado la ubicación de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceClientLocationURL(){
      axios.post(this.backendURL+'/updateWhatsappInvoiceClientLocationURL', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceClientLocationURL: this.updatedWhatsappInvoice.whatsappInvoiceClientLocationURL
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Enlace de ubicación modificada', 'Se ha modificado el enlace de la ubicación de la órden existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la órden', 'Ha ocurrido un error inesperado al modificar la órden. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },
    

    openUpdateWhatsappInvoiceClientName(whatsappInvoice){
      this.updatedWhatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.updatedWhatsappInvoiceClientName = whatsappInvoice.whatsappInvoiceClientName;
    },

    openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice){
      this.updatedWhatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.updatedWhatsappInvoiceClientPhoneNumber = whatsappInvoice.whatsappInvoiceClientPhoneNumber;
    },

    openUpdateWhatsappInvoiceAmount(whatsappInvoice){
      this.updatedWhatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.updatedWhatsappInvoiceAmount = whatsappInvoice.whatsappInvoiceAmount;
    },

    openUpdateWhatsappInvoiceAgentID(whatsappInvoice){
      this.updatedWhatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.updatedWhatsappInvoiceAgentID = whatsappInvoice.whatsappInvoiceAgentID;
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

    openWhatsappInvoiceInformation(whatsappInvoice){
      this.updatedWhatsappInvoice = whatsappInvoice;
    },


    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    parsePhoneNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    selectAllActiveWhatsappInvoice(onBoot){
      axios.post(this.backendURL+'/selectAllActiveWhatsappInvoice')
      .then((response) =>{
        if (response.data.success){
          this.errorCount = 0;

          const currentInvoicesAmount = this.zapoteWhatsappInvoices.length + this.escazuWhatsappInvoices.length + this.herediaWhatsappInvoices.length + this.cartagoWhatsappInvoices.length;
          const currentUpdatedInvoicesAmount = [this.zapoteWhatsappInvoices, this.escazuWhatsappInvoices, this.herediaWhatsappInvoices, this.cartagoWhatsappInvoices].reduce((total, invoices) => total + invoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length, 0);


          this.zapoteWhatsappInvoices = [];
          this.zapoteCentralWhatsappInvoiceAmount = 0;
          this.zapoteLocalityWhatsappInvoiceAmount = 0;
          this.zapoteShippingWhatsappInvoiceAmount = 0;
          this.escazuWhatsappInvoices = [];
          this.escazuCentralWhatsappInvoiceAmount = 0;
          this.escazuLocalityWhatsappInvoiceAmount = 0;
          this.escazuShippingWhatsappInvoiceAmount = 0;
          this.herediaWhatsappInvoices = [];
          this.herediaCentralWhatsappInvoiceAmount = 0;
          this.herediaLocalityWhatsappInvoiceAmount = 0;
          this.herediaShippingWhatsappInvoiceAmount = 0;
          this.cartagoWhatsappInvoices = [];
          this.cartagoCentralWhatsappInvoiceAmount = 0;
          this.cartagoLocalityWhatsappInvoiceAmount = 0;
          this.cartagoShippingWhatsappInvoiceAmount = 0;


          this.expressInvoices = [];

          const whatsappInvoices = response.data.result;
          for (var whatsappInvoiceIndex in whatsappInvoices){
            const whatsappInvoice = whatsappInvoices[whatsappInvoiceIndex];

            whatsappInvoice.whatsappInvoiceTotalDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);

            if (whatsappInvoice.whatsappInvoiceLocalityDateTime){
              whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime) - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            } else {
              whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            }
            if (whatsappInvoice.whatsappInvoiceShippingDateTime){
              whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(whatsappInvoice.whatsappInvoiceShippingDateTime) - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            } else {
              whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            }
            whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceShippingDateTime))/1000), whatsappInvoice.whatsappInvoiceShippingDateTime);


            if (whatsappInvoice.localityName == 'King Vape Zapote'){ 
              this.zapoteWhatsappInvoices.push(whatsappInvoice);
              if (whatsappInvoice.whatsappInvoiceState == 'C'){
                this.zapoteCentralWhatsappInvoiceAmount = this.zapoteCentralWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'S'){
                this.zapoteLocalityWhatsappInvoiceAmount = this.zapoteLocalityWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'R'){
                this.zapoteShippingWhatsappInvoiceAmount = this.zapoteShippingWhatsappInvoiceAmount + 1;
              }

            } else if (whatsappInvoice.localityName == 'King Vape Escazú'){
              this.escazuWhatsappInvoices.push(whatsappInvoice);
              if (whatsappInvoice.whatsappInvoiceState == 'C'){
                this.escazuCentralWhatsappInvoiceAmount = this.escazuCentralWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'S'){
                this.escazuLocalityWhatsappInvoiceAmount = this.escazuLocalityWhatsappInvoiceAmount + 1;
              } else {
                this.escazuShippingWhatsappInvoiceAmount = this.escazuShippingWhatsappInvoiceAmount + 1;
              }

            } else if (whatsappInvoice.localityName == 'King Vape Heredia'){
              this.herediaWhatsappInvoices.push(whatsappInvoice);
              if (whatsappInvoice.whatsappInvoiceState == 'C'){
                this.herediaCentralWhatsappInvoiceAmount = this.herediaCentralWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'S'){
                this.herediaLocalityWhatsappInvoiceAmount = this.herediaLocalityWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'R'){
                this.herediaShippingWhatsappInvoiceAmount = this.herediaShippingWhatsappInvoiceAmount + 1;
              }

            } else if (whatsappInvoice.localityName == 'King Vape Cartago'){
              this.cartagoWhatsappInvoices.push(whatsappInvoice);
              if (whatsappInvoice.whatsappInvoiceState == 'C'){
                this.cartagoCentralWhatsappInvoiceAmount = this.cartagoCentralWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'S'){
                this.cartagoLocalityWhatsappInvoiceAmount = this.cartagoLocalityWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'R'){
                this.cartagoShippingWhatsappInvoiceAmount = this.cartagoShippingWhatsappInvoiceAmount + 1;
              }

            } else {
              this.expressInvoices.push(whatsappInvoice);
            }
          }

          const newInvoicesAmount = this.zapoteWhatsappInvoices.length + this.escazuWhatsappInvoices.length + this.herediaWhatsappInvoices.length + this.cartagoWhatsappInvoices.length;
          const newUpdatedInvoicesAmount = [this.zapoteWhatsappInvoices, this.escazuWhatsappInvoices, this.herediaWhatsappInvoices, this.cartagoWhatsappInvoices].reduce((total, invoices) => total + invoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length, 0);

          if (onBoot == false){
            if (newInvoicesAmount > currentInvoicesAmount){
              this.playSound('screen');
            }
            if (newUpdatedInvoicesAmount > currentUpdatedInvoicesAmount){
              this.playSound('update');
            }
          }    
    

        } else {
          this.errorCount = this.errorCount + 1;
          if (this.errorCount >= 3){
            this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }        }
      })
      .catch(() => {
        this.errorCount = this.errorCount + 1;
        if (this.errorCount >= 3){
          this.showNotification('danger', 'Error al consultar las órdenes', 'Ha ocurrido un error inesperado al consultar las órdenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
    },

    selectAllActiveWhatsappInvoiceFromLocality(onBoot){
      axios.post(this.backendURL+'/selectAllActiveWhatsappInvoiceFromLocality',
      {
        localityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          this.errorCount = 0;

          const currentInvoicesAmount = this.localityWhatsappInvoices.length;
          const currentUpdatedInvoicesAmount = this.localityWhatsappInvoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length;

          this.localityWhatsappInvoices = [];
          this.localityWhatsappInvoiceAmount = 0;
          this.shippingWhatsappInvoiceAmount = 0;

          const whatsappInvoices = response.data.result;
          for (var whatsappInvoiceIndex in whatsappInvoices){
            const whatsappInvoice = whatsappInvoices[whatsappInvoiceIndex];
            
            if (whatsappInvoice.whatsappInvoiceLocalityDateTime){
              whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime) - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            } else {
              whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            }
            if (whatsappInvoice.whatsappInvoiceShippingDateTime){
              whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(whatsappInvoice.whatsappInvoiceShippingDateTime) - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            } else {
              whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            }
            whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceShippingDateTime))/1000), whatsappInvoice.whatsappInvoiceShippingDateTime);
            
           
            this.localityWhatsappInvoices.push(whatsappInvoice);
            if (whatsappInvoice.whatsappInvoiceState == 'S'){
              this.localityWhatsappInvoiceAmount = this.localityWhatsappInvoiceAmount + 1;
            } else if (whatsappInvoice.whatsappInvoiceState == 'R'){
              this.shippingWhatsappInvoiceAmount = this.shippingWhatsappInvoiceAmount + 1;
            }
            
          }
          const newInvoicesAmount = this.localityWhatsappInvoices.length;
          const newUpdatedInvoicesAmount = this.localityWhatsappInvoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length;

          if (onBoot == false){
            if (newInvoicesAmount > currentInvoicesAmount){
              this.playSound('invoice');
            }
            if (newUpdatedInvoicesAmount > currentUpdatedInvoicesAmount){
              this.playSound('update');
            }
          }   
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

    selectAllActiveWhatsappInvoiceFromLocalityAgent(onBoot){
      axios.post(this.backendURL+'/selectAllActiveWhatsappInvoiceFromLocalityAgent', 
      {
        localityAgentID: localStorage.getItem('localityAgentID')
      })
      .then((response) =>{
        if (response.data.success){
          this.errorCount = 0;

          const currentInvoicesAmount = this.localityAgentInvoices.length;
          const currentUpdatedInvoicesAmount = this.localityAgentInvoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length;


          this.localityAgentInvoices = [];
          this.localityAgentInvoicesAmount = 0;
          const whatsappInvoices = response.data.result;
          for (var whatsappInvoiceIndex in whatsappInvoices){
            const whatsappInvoice = whatsappInvoices[whatsappInvoiceIndex];
           
            if (whatsappInvoice.whatsappInvoiceLocalityDateTime){
              whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime) - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            } else {
              whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            }
            if (whatsappInvoice.whatsappInvoiceShippingDateTime){
              whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(whatsappInvoice.whatsappInvoiceShippingDateTime) - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            } else {
              whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            }
           
            whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceShippingDateTime))/1000), whatsappInvoice.whatsappInvoiceShippingDateTime);
            this.localityAgentInvoices.push(whatsappInvoice);
            this.localityAgentInvoicesAmount = this.localityAgentInvoicesAmount + 1;
          }

          const newInvoicesAmount = this.localityAgentInvoices.length;
          const newUpdatedInvoicesAmount = this.localityAgentInvoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length;

          if (onBoot == false){
            if (newInvoicesAmount > currentInvoicesAmount){
              this.playSound('invoice');
            }
            if (newUpdatedInvoicesAmount > currentUpdatedInvoicesAmount){
              this.playSound('update');
            }
          }
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

    selectAgentNames(){
      axios.get(constants.routes.backendAPI+'/selectAgentNames').then((response) =>{
        if (response.data.success){
          const agentNames = response.data.result;
          for (var agentIndex in response.data.result){
            this.updateWhatsappInvoiceAgentIDOptions.push({value: agentNames[agentIndex].agentID, text: agentNames[agentIndex].agentName});
          }
        } else {
          this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectMensajerosDisponibles(){
      axios.post(constants.routes.backendAPI+'/selectMensajerosDisponibles').then((response) =>{
        if (response.data.success){
          var cantidadZapote = 0;
          var cantidadEscazu = 0;
          var cantidadHeredia = 0;
          var cantidadCartago = 0;
          for (var agentIndex in response.data.result){
            const localityID = response.data.result[agentIndex].localityAgentLocalityID;
            if (localityID == 1){
              cantidadZapote += 1;
            } else if (localityID == 4){
              cantidadEscazu += 1;
            } else if (localityID == 5){
              cantidadHeredia += 1;
            } else {
              cantidadCartago += 1;
            }
          }
          this.motosZapote = cantidadZapote;
          this.motosEscazu = cantidadEscazu;
          this.motosHeredia = cantidadHeredia;
          this.motosCartago = cantidadCartago;
        } else {
          this.showNotification('danger', 'Error al solicitar la lista de motorizados disponibles', 'Ha ocurrido un error inesperado al solicitar la lista de motorizados disponibles. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al solicitar la lista de motorizados disponibles', 'Ha ocurrido un error inesperado al solicitar la lista de motorizados disponibles. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },


    async selectLocalityAgentNames(){
      axios.post(this.backendURL+'/selectLocalityAgentNames', 
      {
        localityAgentLocalityID: localStorage.getItem('localityID')
      }).then((response) =>{
        if (response.data.success){
          this.localityAgentOptions = [];
          this.localityAgentBillerOptions = [];
          const localityAgents = response.data.result;
          for (var localityAgentIndex in localityAgents){
            if (localityAgents[localityAgentIndex].localityAgentType == 'Mensajero'){
              this.localityAgentOptions.push({value: localityAgents[localityAgentIndex].localityAgentID, text: localityAgents[localityAgentIndex].localityAgentName, color: localityAgents[localityAgentIndex].localityAgentColor, today: localityAgents[localityAgentIndex].localityAgentIsWorkingToday});
              this.mensajerosToday = this.localityAgentOptions;
            } else {
              this.localityAgentBillerOptions.push({value: localityAgents[localityAgentIndex].localityAgentID, text: localityAgents[localityAgentIndex].localityAgentName, color: localityAgents[localityAgentIndex].localityAgentColor});
            }
          }
        } else {
          this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectWhatsappInvoiceLocations(){
      axios.post(this.backendURL+'/selectWhatsappInvoiceLocations')
      .then((response) =>{
        if (response.data.success){
          this.updateWhatsappInvoiceLocationOptions = [{value: 'Ubicación original', text: 'Ubicación original'}];
          const whatsappInvoiceLocations = response.data.result;
          for (var whatsappInvoiceLocationIndex in whatsappInvoiceLocations){
            const whatsappInvoiceLocation = whatsappInvoiceLocations[whatsappInvoiceLocationIndex];
            this.updateWhatsappInvoiceLocationOptions.push({id: whatsappInvoiceLocation.whatsappInvoiceLocationID, value: whatsappInvoiceLocation.whatsappInvoiceLocationLocation, text: whatsappInvoiceLocation.whatsappInvoiceLocationName});
          }
        } else {
          this.showNotification('danger', 'Error al consultar las ubicaciones', 'Ha ocurrido un error inesperado al consultar las ubicaciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las ubicaciones', 'Ha ocurrido un error inesperado al consultar las ubicaciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    runTimers(){
      var intervalo = 0;
      this.soundInterval = setInterval(() => {
        var playInvoiceSound = false;

        for (var index in this.zapoteWhatsappInvoices){
          if (this.zapoteWhatsappInvoices[index].whatsappInvoiceState == 'C'){
            var playInvoiceSound = true;
          }
          this.zapoteWhatsappInvoices[index].whatsappInvoiceTotalDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.zapoteWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.zapoteWhatsappInvoices[index].whatsappInvoiceCentralDateTime);

          if (this.zapoteWhatsappInvoices[index].whatsappInvoiceLocalityDateTime){
            this.zapoteWhatsappInvoices[index].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.zapoteWhatsappInvoices[index].whatsappInvoiceLocalityDateTime) - new Date(this.zapoteWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.zapoteWhatsappInvoices[index].whatsappInvoiceCentralDateTime);
          } else {
            this.zapoteWhatsappInvoices[index].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.zapoteWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.zapoteWhatsappInvoices[index].whatsappInvoiceCentralDateTime);
          }
          if (this.zapoteWhatsappInvoices[index].whatsappInvoiceShippingDateTime){
            this.zapoteWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.zapoteWhatsappInvoices[index].whatsappInvoiceShippingDateTime) - new Date(this.zapoteWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.zapoteWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          } else {
            this.zapoteWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.zapoteWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.zapoteWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          }
          this.zapoteWhatsappInvoices[index].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.zapoteWhatsappInvoices[index].whatsappInvoiceShippingDateTime))/1000), this.zapoteWhatsappInvoices[index].whatsappInvoiceShippingDateTime);
        }

        for (var index in this.escazuWhatsappInvoices){
          if (this.escazuWhatsappInvoices[index].whatsappInvoiceState == 'C'){
            var playInvoiceSound = true;
          }
          this.escazuWhatsappInvoices[index].whatsappInvoiceTotalDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.escazuWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.escazuWhatsappInvoices[index].whatsappInvoiceCentralDateTime);

          if (this.escazuWhatsappInvoices[index].whatsappInvoiceLocalityDateTime){
            this.escazuWhatsappInvoices[index].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.escazuWhatsappInvoices[index].whatsappInvoiceLocalityDateTime) - new Date(this.escazuWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.escazuWhatsappInvoices[index].whatsappInvoiceCentralDateTime);
          } else {
            this.escazuWhatsappInvoices[index].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.escazuWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.escazuWhatsappInvoices[index].whatsappInvoiceCentralDateTime);
          }
          if (this.escazuWhatsappInvoices[index].whatsappInvoiceShippingDateTime){
            this.escazuWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.escazuWhatsappInvoices[index].whatsappInvoiceShippingDateTime) - new Date(this.escazuWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.escazuWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          } else {
            this.escazuWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.escazuWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.escazuWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          }
          this.escazuWhatsappInvoices[index].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.escazuWhatsappInvoices[index].whatsappInvoiceShippingDateTime))/1000), this.escazuWhatsappInvoices[index].whatsappInvoiceShippingDateTime);
        }

        for (var index in this.herediaWhatsappInvoices){
          if (this.herediaWhatsappInvoices[index].whatsappInvoiceState == 'C'){
            var playInvoiceSound = true;
          }
          this.herediaWhatsappInvoices[index].whatsappInvoiceTotalDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.herediaWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.herediaWhatsappInvoices[index].whatsappInvoiceCentralDateTime);

          if (this.herediaWhatsappInvoices[index].whatsappInvoiceLocalityDateTime){
            this.herediaWhatsappInvoices[index].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.herediaWhatsappInvoices[index].whatsappInvoiceLocalityDateTime) - new Date(this.herediaWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.herediaWhatsappInvoices[index].whatsappInvoiceCentralDateTime);
          } else {
            this.herediaWhatsappInvoices[index].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.herediaWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.herediaWhatsappInvoices[index].whatsappInvoiceCentralDateTime);
          }
          if (this.herediaWhatsappInvoices[index].whatsappInvoiceShippingDateTime){
            this.herediaWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.herediaWhatsappInvoices[index].whatsappInvoiceShippingDateTime) - new Date(this.herediaWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.herediaWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          } else {
            this.herediaWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.herediaWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.herediaWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          }
          this.herediaWhatsappInvoices[index].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.herediaWhatsappInvoices[index].whatsappInvoiceShippingDateTime))/1000), this.herediaWhatsappInvoices[index].whatsappInvoiceShippingDateTime);
        }

        for (var index in this.cartagoWhatsappInvoices){
          if (this.cartagoWhatsappInvoices[index].whatsappInvoiceState == 'C'){
            var playInvoiceSound = true;
          }
          this.cartagoWhatsappInvoices[index].whatsappInvoiceTotalDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.cartagoWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.cartagoWhatsappInvoices[index].whatsappInvoiceCentralDateTime);

          if (this.cartagoWhatsappInvoices[index].whatsappInvoiceLocalityDateTime){
            this.cartagoWhatsappInvoices[index].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.cartagoWhatsappInvoices[index].whatsappInvoiceLocalityDateTime) - new Date(this.cartagoWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.cartagoWhatsappInvoices[index].whatsappInvoiceCentralDateTime);
          } else {
            this.cartagoWhatsappInvoices[index].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.cartagoWhatsappInvoices[index].whatsappInvoiceCentralDateTime))/1000), this.cartagoWhatsappInvoices[index].whatsappInvoiceCentralDateTime);
          }
          if (this.cartagoWhatsappInvoices[index].whatsappInvoiceShippingDateTime){
            this.cartagoWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.cartagoWhatsappInvoices[index].whatsappInvoiceShippingDateTime) - new Date(this.cartagoWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.cartagoWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          } else {
            this.cartagoWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.cartagoWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.cartagoWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          }
          this.cartagoWhatsappInvoices[index].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.cartagoWhatsappInvoices[index].whatsappInvoiceShippingDateTime))/1000), this.cartagoWhatsappInvoices[index].whatsappInvoiceShippingDateTime);
        }

        for (var index in this.localityWhatsappInvoices){
          if (this.localityWhatsappInvoices[index].whatsappInvoiceShippingDateTime){
            this.localityWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.localityWhatsappInvoices[index].whatsappInvoiceShippingDateTime) - new Date(this.localityWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.localityWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          } else {
            this.localityWhatsappInvoices[index].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.localityWhatsappInvoices[index].whatsappInvoiceLocalityDateTime))/1000), this.localityWhatsappInvoices[index].whatsappInvoiceLocalityDateTime);
          }
          this.localityWhatsappInvoices[index].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.localityWhatsappInvoices[index].whatsappInvoiceShippingDateTime))/1000), this.localityWhatsappInvoices[index].whatsappInvoiceShippingDateTime);
        }

        for (var localityAgentInvoiceIndex in this.localityAgentInvoices){
          this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date(this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceShippingDateTime) - new Date(this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceLocalityDateTime))/1000), this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceLocalityDateTime);
          this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceShippingDateTime))/1000), this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceShippingDateTime);
        }

        if (playInvoiceSound){
          if (intervalo >= 5){
            this.playSound('screen');
            intervalo = 0;
          }
        }

        intervalo = intervalo + 1;

      }, 1000);
    },

    getTimerRepresentation(timeInSeconds, validation){
      if (!isNaN(timeInSeconds) && (validation != null)){
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const remainingSeconds = timeInSeconds % 60;
        const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        return timeFormat;
      } else {
        return '00:00:00';
      }
    },

    getWhatsappInvoiceClientLocation(){
      try {
        const whatsappInvoiceClientLocation = JSON.parse(this.updatedWhatsappInvoice.whatsappInvoiceClientLocation);
        return {lat: whatsappInvoiceClientLocation.latitude, lng: whatsappInvoiceClientLocation.longitude};
      } catch {

      }
      
    },

    changeWhatsappInvoiceLocation(){
      this.updatedWhatsappInvoice.whatsappInvoiceClientLocation = this.updatedWhatsappInvoiceLocation;
    },


    insertLocalityAgentLocation(){
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const localityAgentLocationLatitude = position.coords.latitude;
            const localityAgentLocationLongitude = position.coords.longitude;
            axios.post(this.backendURL+'/insertLocalityAgentLocation', 
            {
              'localityAgentLocationLocalityAgentID': localStorage.getItem('localityAgentID'),
              'localityAgentLocationLatitude': localityAgentLocationLatitude,
              'localityAgentLocationLongitude': localityAgentLocationLongitude
            })
            .then((response) =>{
              if (response.data.success){
                console.log(response.data);
              } else {
                console.log('error 4')
              }
            })
            .catch(() => {
              console.log('error 3')
            })
          },
          error => {
            console.log('error 2');
          }
        );
      } else {
        console.log('error');
      }
    },

    selectApplicationLive(){
      axios.post(constants.routes.backendAPI+'/selectApplicationLive').then((response) =>{ 
        if (response.data.success){
          this.live = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar el estado del call center', 'Ha ocurrido un error inesperado al consultar el estado del call center. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al consultar el estado del call center', 'Ha ocurrido un error inesperado al consultar el estado del call center. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

  },

  mounted(){

    if (localStorage.getItem('agentType') == 'agent' || localStorage.getItem('agentType') == 'admin' || localStorage.getItem('agentType') == 'central'){
      this.agentType = 'central';
      this.selectApplicationLive();

      this.isAdmin = (localStorage.getItem('agentType') == 'admin');
      this.selectAllActiveWhatsappInvoice(true);
      this.selectMensajerosDisponibles();

      this.selectAgentNames();
      this.runTimers();

    } else if (localStorage.getItem('agentType') == 'locality'){
      this.selectApplicationLive();
      this.agentType = 'locality';
      if (localStorage.getItem('localityID') == '1'){
        this.localityName = 'ZAPOTE';
        this.localityColor = 'height: 85vh; background-color: #fed330;';
        this.mapCenter = {lat: 9.920173, lng: -84.051987};
      } else if (localStorage.getItem('localityID') == '3'){
        this.localityName = 'CARTAGO';
        this.mapCenter = {lat: 9.864751, lng: -83.925354};
        this.localityColor = 'height: 85vh; background-color: #55b5ab;';
      } else if (localStorage.getItem('localityID') == '4'){
        this.localityName = 'ESCAZÚ';
        this.mapCenter = {lat: 9.949093, lng: -84.163117};
        this.localityColor = 'height: 85vh; background-color: #db67a3;';
      } else {
        this.localityName = 'HEREDIA';
        this.mapCenter = {lat: 9.99168, lng: -84.135};
        this.localityColor = 'height: 85vh; background-color: #db67a3;';
      }   

      this.selectAllActiveWhatsappInvoiceFromLocality(true);
      this.selectLocalityAgentNames();
      this.runTimers();

    } else if (localStorage.getItem('agentType') == 'localityAgent'){
      this.agentType = 'localityAgent';
      this.localityAgentColor = localStorage.getItem('localityAgentColor');
      this.selectAllActiveWhatsappInvoiceFromLocalityAgent(true);
      this.runTimers();

    }

    this.cartagoMap = constants.routes.cartagoMap;
    this.herediaMap = constants.routes.herediaMap;
    this.zapoteMap = constants.routes.zapoteMap;
    this.escazuMap = constants.routes.escazuMap;
    this.redMap = constants.routes.redMap;
    this.redMapOptions = constants.routes.redMapOptions;

    this.queryInterval = setInterval(() => {
      if (this.agentType == 'central'){
        this.selectAllActiveWhatsappInvoice(false);
        this.selectMensajerosDisponibles();
        this.selectApplicationLive();
      } else if (this.agentType == 'locality'){
        this.selectAllActiveWhatsappInvoiceFromLocality(false);
        this.selectApplicationLive();
      } else if (this.agentType == 'localityAgent'){
        this.selectAllActiveWhatsappInvoiceFromLocalityAgent(false);
        //this.insertLocalityAgentLocation();
      }
    }, 6000);

  },

  beforeDestroy(){
    clearInterval(this.queryInterval);
    clearInterval(this.soundInterval);
    clearInterval(this.locationInterval);
  }
};
</script>
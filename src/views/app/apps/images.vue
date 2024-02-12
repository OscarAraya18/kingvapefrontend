<template>
  <div class="main-content">
    <vue-good-table :columns="tableOptions" :line-numbers="false" styleClass="tableOne vgt-table" :rows="whatsappFavoriteImages">
      <template slot="table-row" slot-scope="props">

        <span v-if="props.column.field == 'whatsappFavoriteImageFile'">
          <img style="height: 100px;" :src="props.row.whatsappFavoriteImageDriveURL">
        </span>

        <span v-else-if="props.column.field == 'whatsappFavoriteImageUploadDate'">
          {{ parseHour(props.row.whatsappFavoriteImageUploadDate) }}
        </span>

        <span v-else-if="props.column.field == 'actions'">
          <i class="i-Eraser-2 text-25 text-success mr-2" @click="openEdit(props.row)" v-b-modal.editModal style="cursor: pointer"></i>
          <i class="i-Close-Window text-25 text-danger" @click="deleteImage(props.row)" style="cursor: pointer"></i>
        </span>

      </template>

        
    </vue-good-table>



    <b-modal id="editModal" hide-header hide-footer centered> 
      <div class="p-1" v-if="editingImage != null">
        <p style="font-size: medium; margin-bottom: 5px;"><strong>Nombre:</strong></p>
        <b-form-input v-model="editingImage.whatsappFavoriteImageName" placeholder="Nombre"></b-form-input>

        <br>

        <p style="font-size: medium; margin-bottom: 5px;"><strong>Identificador de WhatsApp:</strong></p>
        <b-form-input v-model="editingImage.whatsappFavoriteImageFileID" placeholder="Identificador de WhatsApp"></b-form-input>

        <br>

        <p style="font-size: medium; margin-bottom: 5px;"><strong>Enlace de Cloudinary:</strong></p>
        <b-form-input v-model="editingImage.whatsappFavoriteImageDriveURL" placeholder="Enlace de Cloudinary"></b-form-input>

        <br>

        <p style="font-size: medium; margin-bottom: 5px;"><strong>Tipo de catálogo:</strong></p>
        <b-form-input v-model="editingImage.whatsappFavoriteImageCatalog" placeholder="Tipo de catálogo"></b-form-input>

        <br>

        <p style="font-size: medium; margin-bottom: 5px;"><strong>Renovar identificador de WhatsApp:</strong></p>
        <div v-if="loader1 == false">
          <input type="file" accept="image/png, image/jpeg" @change="uploadImage()" id="imageUploader" ref="imageFile">
          <br><br>
          <b-button @click="uploadWhatsappFavoriteImage()" variant="info">Renovar</b-button>
        </div>
        <div v-else style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>


        <br><br>
        <div style="text-align: center;">
          <div v-if="loader2 == false">
            <b-button @click="updateWhatsappFavoriteImage()" style="width: 80%;" variant="primary">Guardar cambios</b-button>
          </div>
          <div v-else style="text-align: center;">
            <br><br><span class="spinner-glow spinner-glow-primary"></span>
          </div>
        </div>
      </div>
    </b-modal>
  </div>
</template>


<script>

import axios from 'axios';
const constants = require('@../../../src/constants.js'); 

export default {
  data() {
    return {
      uploaded: false,
      loader1: false,
      loader2: false,

      editingImage: null,
      imageFile: null,

      tableOptions: [
        {
          label: "ID",
          field: "whatsappFavoriteImageID"
        },
        {
          label: "Nombre",
          field: "whatsappFavoriteImageName"
        },
        {
          label: "Identificador de WhatsApp",
          field: "whatsappFavoriteImageFileID"
        },
        {
          label: "Enlace de Cloudinary",
          field: "whatsappFavoriteImageDriveURL"
        },
        {
          label: "Imagen",
          field: "whatsappFavoriteImageFile",
          html: true
        },
        {
          label: "Tipo de catálogo",
          field: "whatsappFavoriteImageCatalog",
        },
        {
          label: "Fecha de subida",
          field: "whatsappFavoriteImageUploadDate"
        },
        {
          label: "Tiempo restante",
          field: "whatsappFavoriteImageRemainingTime"
        },
        {
          label: "",
          field: "actions"
        }
      ],
      whatsappFavoriteImages: [],
    };
  },
  
  methods: {
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

    updateWhatsappFavoriteImage(){
      if (this.uploaded == true){
        axios.post(constants.routes.backendAPI+'/updateWhatsappFavoriteImage', 
        {
          whatsappFavoriteImageID: this.editingImage.whatsappFavoriteImageID,
          whatsappFavoriteImageName: this.editingImage.whatsappFavoriteImageName,
          whatsappFavoriteImageFileID: this.editingImage.whatsappFavoriteImageFileID,
          whatsappFavoriteImageDriveURL: this.editingImage.whatsappFavoriteImageDriveURL,
          whatsappFavoriteImageCatalog: this.editingImage.whatsappFavoriteImageCatalog
        })
        .then((response) =>{
          if (response.data.success){
            this.loader2 = false;
            this.$root.$emit('bv::hide::modal', 'editModal');
            this.showNotification('success', 'Imagen actualizada', 'Se ha actualizado la imagen exitosamente.');
            this.selectAllWhatsappFavoriteImages();
          } else {
            this.loader2 = false;
            this.showNotification('danger', 'Error al actualizar la imagen', 'Ha ocurrido un error inesperado al actualizar la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch(() =>{
          this.loader2 = false;
          this.showNotification('danger', 'Error al actualizar la imagen', 'Ha ocurrido un error inesperado al actualizar la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
      } else {
        this.showNotification('danger', 'Error al actualizar la imagen', 'Debe actualizar el identificador de WhatsApp. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      }
      
    },

    uploadWhatsappFavoriteImage(){
      this.loader1 = true;
      this.imageFile = this.$refs.imageFile.files[0];
      var reader = new FileReader();
      reader.readAsDataURL(this.imageFile);
      reader.onload = () => {
        axios.post(constants.routes.backendAPI+'/uploadWhatsappImage', 
        {
          whatsappImageFile: reader.result
        })
        .then((response) =>{
          if (response.data.success){
            this.loader1 = false;
            this.uploaded = true;
            this.editingImage.whatsappFavoriteImageFileID = response.data.result.whatsappImageMessageFileID;
          } else {
            this.loader1 = false;
            this.showNotification('danger', 'Error al subir la imagen', 'Ha ocurrido un error inesperado al subir la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          }
        })
        .catch(() =>{
          this.loader1 = false;
          this.showNotification('danger', 'Error al subir la imagen', 'Ha ocurrido un error inesperado al enviar la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        })
      };
      reader.onerror = function () {
        this.loader1 = false;
        this.showNotification('danger', 'Error al cargar la imagen', 'Ha ocurrido un error inesperado al cargar la imagen. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      };
    },

    openEdit(image){
      this.uploaded = false;
      this.editingImage = image;
    },

    selectAllWhatsappFavoriteImages(){
      axios.post(constants.routes.backendAPI+'/selectAllWhatsappFavoriteImages').then((response) =>{
        if (response.data.success){
          this.whatsappFavoriteImages = response.data.result.map(function(whatsappFavoriteImage) {
            return { ...whatsappFavoriteImage, whatsappFavoriteImageRemainingTime: ''};
          });
        } else {
          this.$bvToast.toast('Ha ocurrido un error inesperado al consultar las imágenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
            title: 'Error al consultar las imágenes',
            variant: 'danger',
            solid: true
          });
        }
      })
      .catch(() =>{
        this.$bvToast.toast('Ha ocurrido un error inesperado al consultar las imágenes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al consultar las imágenes',
          variant: 'danger',
          solid: true
        });
      });
    },

    startTimers(){
      setInterval(() => {
        for (var imageIndex in this.whatsappFavoriteImages){
          this.whatsappFavoriteImages[imageIndex].whatsappFavoriteImageRemainingTime = this.getRemainingTime(this.whatsappFavoriteImages[imageIndex].whatsappFavoriteImageUploadDate);
        }
      }, 1000);
    },

    getRemainingTime(fechaInicial){
      const fechaInicio = new Date();

      const fechaFinal = new Date(fechaInicial);
      fechaFinal.setMonth(fechaFinal.getMonth() + 1);

      const diferenciaEnMilisegundos = fechaFinal - fechaInicio;

      const segundos = Math.floor(diferenciaEnMilisegundos / 1000) % 60;
      const minutos = Math.floor(diferenciaEnMilisegundos / (1000 * 60)) % 60;
      const horas = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60)) % 24;
      const dias = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24));
      const diferenciaFormateada = `${dias} días, ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

      return diferenciaFormateada;
    }
  },


  mounted(){
    this.selectAllWhatsappFavoriteImages();
    this.startTimers();
  }
};
</script>
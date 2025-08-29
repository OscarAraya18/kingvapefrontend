<template>
  <div
    v-if="ranking==false"
    class="side-content-wrap"
    @mouseenter="isMenuOver = true"
    @mouseleave="isMenuOver = false"
    @touchstart="isMenuOver = true"
  >

  <div id="invoice" style="display: none; position: fixed; bottom: 0;">
    <div style="width:100%; margin: 30px;">
      <img src="@/assets/images/logo.webp" alt style="width: 150px; height: auto;"/>
    </div>
  </div>

    <vue-perfect-scrollbar
      :settings="{ suppressScrollX: true, wheelPropagation: false }"
      :class="{ open: getSideBarToggleProperties.isSideNavOpen }"
      ref="myData"
      class="sidebar-left rtl-ps-none ps scroll"
    >
      <div>
        <ul class="navigation-left">
          
          <li
            v-if="locality == false && localityAgent == false && (agentName != 'Mile Cruz')"
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="chat"
            :class="{ active: selectedParentMenu == 'chat'}"
            :data-submenu="false"
          >
            <router-link tag="a" to="/app/apps/chat">
              <div style="padding: 15px;" @click="handleClick('chat')" :class="{clicked: isClicked === 'chat'}">
                <img src="@/assets/sidebarIcons/whatsapp.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>

          <li
            v-if="locality == false && localityAgent == false && (agentName != 'Mile Cruz')"
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="webpage"
            :class="{ active: selectedParentMenu == 'webpage' }"
            :data-submenu="false"
          >
            <router-link tag="a" to="/app/apps/webpage">
              <div style="padding: 19px;" @click="handleClick('webpage')" :class="{clicked: isClicked === 'webpage'}">
                <img src="@/assets/sidebarIcons/webpage.png" alt style="width: 80px; height: auto;"/>
              </div>
            </router-link>
          </li>


          <li
            v-if="locality == false && localityAgent == false && (agentName != 'Mile Cruz')"
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="contacts"
            :class="{ active: selectedParentMenu == 'contacts' }"
            :data-submenu="false"
          >
            <router-link tag="a" to="/app/apps/contact-list">
              <div style="padding: 10px;" @click="handleClick('contacts')" :class="{clicked: isClicked === 'contacts'}">
                <img src="@/assets/sidebarIcons/contacts.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>
      
          <li
            @mouseenter="toggleSubMenu"
            :class="{ active: selectedParentMenu == 'dashboards' }"
            class="nav-item"
            data-item="dashboards"
            v-if="isAdmin == true && locality == false"
          >
            <router-link tag="a" to="/app/dashboards/dashboard.v1">
              <div style="padding: 10px;" @click="handleClick('dashboard')" :class="{clicked: isClicked === 'dashboard'}">
                <img src="@/assets/sidebarIcons/dashboard.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>            
          </li>
          

          <li
            v-if="(agentName != 'Mile Cruz') && (localityType != 'Express')"
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="centralInvoice"
            :class="{ active: selectedParentMenu == 'centralInvoice' }"
            :data-submenu="false"
          >
            <router-link tag="a" to="/app/apps/centralInvoice">
              <div style="padding: 10px;" @click="handleClick('orders')" :class="{clicked: isClicked === 'orders'}">
                <img src="@/assets/sidebarIcons/orders.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>

          <li
            v-if="(agentName != 'Mile Cruz') && (localityType == 'Express')"
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="centralInvoice"
            :class="{ active: selectedParentMenu == 'expressInvoice' }"
            :data-submenu="false"
          >
            <router-link tag="a" to="/app/apps/expressInvoice">
              <div style="padding: 10px;" @click="handleClick('orders')" :class="{clicked: isClicked === 'orders'}">
                <img src="@/assets/sidebarIcons/orders.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>


          <li
            @mouseenter="toggleSubMenu"
            :class="{ active: selectedParentMenu == 'ranking' }"
            class="nav-item"
            data-item="ranking"
            v-if="isAdmin == true && locality == false"
          >
            <router-link tag="a" to="/app/apps/rankingAdmin">
              <div style="padding: 8px;" @click="handleClick('ranking')" :class="{clicked: isClicked === 'ranking'}">
                <img src="@/assets/sidebarIcons/ranking.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>



          <li
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="locality"
            :class="{ active: selectedParentMenu == 'locality' }"
            :data-submenu="false"
            v-if="locality == false && (agentName != 'Mile Cruz')"
          >
            <router-link tag="a" to="/app/apps/locality">
              <div style="padding: 8px;" @click="handleClick('sinpe')" :class="{clicked: isClicked === 'sinpe'}">
                <img src="@/assets/sidebarIcons/sinpe.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>

          
          <li
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="agents"
            :class="{ active: selectedParentMenu == 'agents' }"
            :data-submenu="false"
            v-if="isAdmin == true && locality == false"
          >
            <router-link tag="a" to="/app/apps/agents">
              <div style="padding: 8px;" @click="handleClick('agents')" :class="{clicked: isClicked === 'agents'}">
                <img src="@/assets/sidebarIcons/agents.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>

          <li
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="transfer"
            :class="{ active: selectedParentMenu == 'transfer' }"
            :data-submenu="false"
            v-if="isAdmin == true || agentName == 'Diana Jimenez' || agentName == 'Emma Garcia' || locality == true"
          >
            <router-link tag="a" to="/app/apps/transfer">
              <div style="padding: 8px;" @click="handleClick('transfer')" :class="{clicked: isClicked === 'transfer'}">
                <img src="@/assets/sidebarIcons/transfer.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>



          <li
            v-if="agentName == 'Mile Cruz' || agentName == 'Oscar'"
            @mouseenter="toggleSubMenu"
            class="nav-item"
            data-item="images"
            :class="{ active: selectedParentMenu == 'images' }"
            :data-submenu="false"
          >
            <router-link tag="a" to="/app/apps/images">
              <div style="padding: 8px;" @click="handleClick('images')" :class="{clicked: isClicked === 'images'}">
                <img src="@/assets/sidebarIcons/images.png" alt style="width: 250px; height: auto;"/>
              </div>
            </router-link>
          </li>

          


        </ul>
      </div>
    </vue-perfect-scrollbar>

    <vue-perfect-scrollbar
      :class="{ open: getSideBarToggleProperties.isSecondarySideNavOpen }"
      :settings="{ suppressScrollX: true, wheelPropagation: false }"
      class="sidebar-left-secondary ps rtl-ps-none"
    >
      <div ref="sidebarChild">
        <!-- Submenu Dashboards -->
        
        <ul
          class="childNav d-none"
          data-parent="apps"
          :class="{ 'd-block': selectedParentMenu == 'apps' }"
          >
          <!-- invoice-list -->

          <li
            @click.prevent="toggleSidebarDropdwon($event)"
            class="nav-item dropdown-sidemenu"
          >
            <a href="#">
              <i class="nav-icon i-File"></i>
              <span class="item-name">Invoice</span>
              <i class="dd-arrow i-Arrow-Down"></i>
            </a>
            <ul class="submenu">
              <li>
                <router-link tag="a" class to="/app/apps/invoice">
                  <i class="nav-icon i-Files"></i>
                  <span class="item-name">Invoice List</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/apps/createInvoice">
                  <i class="nav-icon i-Add-File"></i>
                  <span class="item-name">Create Invoice</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/apps/printInvoice">
                  <i class="nav-icon i-File-JPG"></i>
                  <span class="item-name">Print Invoice</span>
                </router-link>
              </li>
            </ul>
          </li>

          <!-- contact app -->
          <li
            @click.prevent="toggleSidebarDropdwon($event)"
            class="nav-item dropdown-sidemenu"
          >
            <a href="#">
              <i class="nav-icon i-File-CSV"></i>
              <span class="item-name">
                Contacts
                <span class="ml-2 badge badge-pill badge-danger">New</span>
              </span>
              <i class="dd-arrow i-Arrow-Down"></i>
            </a>
            <ul class="submenu">
              <li>
                <router-link tag="a" class to="/app/apps/contact-list">
                  <i class="nav-icon i-File-CSV"></i>
                  <span class="item-name">Contact Lists</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/apps/contact-grid">
                  <i class="nav-icon i-File-CSV"></i>
                  <span class="item-name">Contact Grid</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/apps/contact-details">
                  <i class="nav-icon i-File-CSV"></i>
                  <span class="item-name">Contact Details</span>
                </router-link>
              </li>
            </ul>
          </li>

          <li class="nav-item">
            <router-link tag="a" class to="/app/apps/products">
              <i class="nav-icon i-Add-File"></i>
              <span class="item-name"
                >Ecommerce
                <span class="ml-2 badge badge-pill badge-danger"
                  >New</span
                ></span
              >
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/apps/taskManager">
              <i class="nav-icon i-Add-File"></i>
              <span class="item-name">Task Manager</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/apps/todo-list">
              <i class="nav-icon i-Add-File"></i>
              <span class="item-name"
                >Todo App
                <span class="ml-2 badge badge-pill badge-danger"
                  >New</span
                ></span
              >
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/apps/contact-list-table">
              <i class="nav-icon i-Add-File"></i>
              <span class="item-name"
                >Contacts Table
                <span class="ml-2 badge badge-pill badge-danger"
                  >New</span
                ></span
              >
            </router-link>
          </li>

          <li class="nav-item">
            <router-link tag="a" class to="/app/apps/calendar">
              <i class="nav-icon i-Calendar-3"></i>
              <span class="item-name">Calendar</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link tag="a" class to="/app/apps/inbox">
              <i class="nav-icon i-Email"></i>
              <span class="item-name">Inbox</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/apps/chat">
              <i class="nav-icon i-Speach-Bubble-3"></i>
              <span class="item-name">Chat</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/apps/scrumboard">
              <i class="nav-icon i-Add-File"></i>
              <span class="item-name"
                >scrumboard
                <span class="ml-2 badge badge-pill badge-danger"
                  >New</span
                ></span
              >
            </router-link>
          </li>
        </ul>
        <ul
          class="childNav d-none"
          data-parent="forms"
          :class="{ 'd-block': selectedParentMenu == 'forms' }"
        >
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/basicForms">
              <i class="nav-icon i-File-Clipboard-Text--Image"></i>
              <span class="item-name">Basic Elements</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/formLayouts">
              <i class="nav-icon i-Split-Vertical"></i>
              <span class="item-name">Form Layouts</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/basicActionBar">
              <i class="nav-icon i-Receipt-4"></i>
              <span class="item-name">Basic Action Bar</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/formComponent">
              <i class="nav-icon i-Close-Window"></i>
              <span class="item-name">Form Validation</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/formWizard">
              <i class="nav-icon i-Width-Window"></i>
              <span class="item-name">Form Wizard</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/tagInput">
              <i class="nav-icon i-Tag-2"></i>
              <span class="item-name">Tag Input</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/mask">
              <i class="nav-icon i-Pen-2"></i>
              <span class="item-name">Form Mask</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/datepicker">
              <i class="nav-icon i-Calendar-4"></i>
              <span class="item-name">Datepicker</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/forms/V2Datepicker">
              <i class="nav-icon i-Calendar-4"></i>
              <span class="item-name">V2Datepicker</span>
            </router-link>
          </li>
        </ul>

        <ul
          class="childNav d-none"
          data-parent="forms"
          :class="{ 'd-block': selectedParentMenu == 'datatables' }"
        >
          <li class="nav-item">
            <router-link tag="a" class to="/app/datatables/paging">
              <i class="nav-icon i-Split-Four-Square-Window"></i>
              <span class="item-name">Paging</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/datatables/filter">
              <i class="nav-icon i-Split-Vertical"></i>
              <span class="item-name">Filter</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/datatables/list">
              <i class="nav-icon i-Split-Vertical"></i>
              <span class="item-name">List</span>
            </router-link>
          </li>
          
        </ul>

        
        <ul
          class="childNav d-none"
          data-parent="extrakits"
          :class="{ 'd-block': selectedParentMenu == 'extrakits' }"
        >
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/dropdown">
              <i class="nav-icon i-Arrow-Down"></i>
              <span class="item-name">Dropdown</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/imageCropper">
              <i class="nav-icon i-Crop-2"></i>
              <span class="item-name">Image Cropper</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/loaders">
              <i class="nav-icon i-Loading-3"></i>
              <span class="item-name">Loaders</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/sidebar">
              <i class="nav-icon i-Two-Windows"></i>
              <span class="item-name">Sidebar</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/spinners">
              <i class="nav-icon i-Two-Windows"></i>
              <span class="item-name">Overlay</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/vueDraggable">
              <i class="nav-icon i-Two-Windows"></i>
              <span class="item-name">Vue Draggable</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/avatar">
              <i class="nav-icon i-Two-Windows"></i>
              <span class="item-name">Avatar</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/calendar">
              <i class="nav-icon i-Calendar"></i>
              <span class="item-name">Calendar</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/rating">
              <i class="nav-icon i-Circular-Point"></i>
              <span class="item-name">Rating</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/spinButton">
              <i class="nav-icon i-Circular-Point"></i>
              <span class="item-name">Spinbutton</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/datePicker">
              <i class="nav-icon i-Time-Window"></i>
              <span class="item-name">Datepicker</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/timePicker">
              <i class="nav-icon i-Over-Time"></i>
              <span class="item-name">TimePicker</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/vueTree">
              <i class="nav-icon i-Up---Down-3"></i>
              <span class="item-name">Vue Tree</span>
              <span class="ml-2 badge badge-pill badge-danger">New</span>
            </router-link>
          </li>
          <!-- <li class="nav-item">
            <a href="ladda.button.html">
              <i class="nav-icon i-Loading-2"></i>
              <span class="item-name">Ladda Buttons</span>
            </a>
          </li>-->
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/toasts">
              <i class="nav-icon i-Bell"></i>
              <span class="item-name">Toastr</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/sweetAlerts">
              <i class="nav-icon i-Approved-Window"></i>
              <span class="item-name">Sweet Alerts</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/extraKits/tour">
              <i class="nav-icon i-Plane"></i>
              <span class="item-name">User Tour</span>
            </router-link>
          </li>
        </ul>
        <ul
          class="childNav d-none"
          data-parent="ui-kits"
          :class="{ 'd-block': selectedParentMenu == 'ui-kits' }"
        >
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/alerts">
              <i class="nav-icon i-Bell1"></i>
              <span class="item-name">Alerts</span>
            </router-link>
          </li>
          <!-- <li
            @click.prevent="toggleSidebarDropdwon($event)"
            class="nav-item dropdown-sidemenu"
          >
            <a href="accordion.html">
              <i class="nav-icon i-Split-Horizontal-2-Window"></i>
              <span class="item-name">Accordion</span>
              <i class="dd-arrow i-Arrow-Down"></i>
            </a>
            <ul class="submenu">
              <li>
                <a href>Sub menu item 1</a>
              </li>
              <li>
                <a href>Sub menu item 1</a>
              </li>
              <li>
                <a href>Sub menu item 1</a>
              </li>
            </ul>
          </li>-->
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/accordion">
              <i class="nav-icon i-Split-Horizontal-2-Window"></i>
              <span class="item-name">Accordion</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/badges">
              <i class="nav-icon i-Medal-2"></i>
              <span class="item-name">Badges</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/buttons">
              <i class="nav-icon i-Cursor-Click"></i>
              <span class="item-name">Buttons</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/cards">
              <i class="nav-icon i-Line-Chart-2"></i>
              <span class="item-name">Cards</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/carousel">
              <i class="nav-icon i-Video-Photographer"></i>
              <span class="item-name">Carousels</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/list">
              <i class="nav-icon i-Belt-3"></i>
              <span class="item-name">Lists</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/pagination">
              <i class="nav-icon i-Arrow-Next"></i>
              <span class="item-name">Paginations</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/popover">
              <i class="nav-icon i-Speach-Bubble-2"></i>
              <span class="item-name">Popover</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/progressbar">
              <i class="nav-icon i-Loading"></i>
              <span class="item-name">Progressbar</span>
            </router-link>
          </li>
          <!-- <li class="nav-item">
            <a href="tables.html">
              <i class="nav-icon i-File-Horizontal-Text"></i>
              <span class="item-name">Tables</span>
            </a>
          </li>-->
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/bootstrap-tab">
              <i class="nav-icon i-New-Tab"></i>
              <span class="item-name">Tabs</span>
            </router-link>
          </li>
          <!-- <li class="nav-item">
            <a href="tooltip.html">
              <i class="nav-icon i-Speach-Bubble-8"></i>
              <span class="item-name">Tooltip</span>
            </a>
          </li>-->

          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/modals">
              <i class="nav-icon i-Duplicate-Window"></i>
              <span class="item-name">Modals</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/collapsible">
              <i class="nav-icon i-Width-Window"></i>
              <span class="item-name">Collapsible</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/ui-kits/typography">
              <i class="nav-icon i-Width-Window"></i>
              <span class="item-name">Typography</span>
            </router-link>
          </li>
        </ul>

        <ul
          class="childNav d-none"
          data-parent="charts"
          :class="{ 'd-block': selectedParentMenu == 'charts' }"
        >
          <li
            @click.prevent="toggleSidebarDropdwon($event)"
            class="nav-item dropdown-sidemenu"
          >
            <a href="#">
              <i class="nav-icon i-Line-Chart"></i>
              <span class="item-name">Apex Charts</span>
              <i class="dd-arrow i-Arrow-Down"></i>
            </a>
            <ul class="submenu">
              <li>
                <router-link tag="a" class to="/app/charts/apexAreaChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Area Chart</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/charts/apexBarChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Bar Chart</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/charts/apexLineChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Line Chart</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/charts/apexMixChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Mix Chart</span>
                </router-link>
              </li>

              <li>
                <router-link tag="a" class to="/app/charts/apexColumnChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Column Chart</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/charts/apexPieDonutsChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Pie Donut Chart</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/charts/apexRadarChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Radar Chart</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/charts/apexRadialBarChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Radial Bar Chart</span>
                </router-link>
              </li>
              <li>
                <router-link tag="a" class to="/app/charts/apexScatterChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Scatter Chart</span>
                </router-link>
              </li>

              <li>
                <router-link tag="a" class to="/app/charts/apexSparklineChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Sparkline Chart</span>
                </router-link>
                <router-link tag="a" class to="/app/charts/apexAreaChart">
                  <i class="nav-icon i-Line-Chart-2"></i>
                  <span class="item-name">Apex Area Chart</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>

        <ul
          class="childNav d-none"
          data-parent="widgets"
          :class="{ 'd-block': selectedParentMenu == 'widgets' }"
        >
          <li class="nav-item">
            <router-link tag="a" class to="/app/widgets/widgetCard">
              <i class="nav-icon i-Two-Windows"></i>
              <span class="item-name">Widget Card</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/widgets/widgetStatistics">
              <i class="nav-icon i-Windows-2"></i>
              <span class="item-name">Widget Statistics</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link tag="a" class to="/app/widgets/weatherApp">
              <i class="nav-icon i-Windows-2"></i>
              <span class="item-name">Weather App</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/widgets/widgetApp">
              <i class="nav-icon i-Windows-2"></i>
              <span class="item-name">App Widgets</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/widgets/widgetList">
              <i class="nav-icon i-Windows-2"></i>
              <span class="item-name">Widget List</span>
            </router-link>
          </li>
        </ul>

        <ul
          class="childNav d-none"
          data-parent="sessions"
          :class="{ 'd-block': selectedParentMenu == 'sessions' }"
        >
          <li class="nav-item">
            <router-link tag="a" class to="/app/sessions/signIn">
              <i class="nav-icon i-Checked-User"></i>
              <span class="item-name">Sign in</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/sessions/signUp">
              <i class="nav-icon i-Add-User"></i>
              <span class="item-name">Sign up</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/sessions/forgot">
              <i class="nav-icon i-Find-User"></i>
              <span class="item-name">Forgot</span>
            </router-link>
          </li>
        </ul>
        <ul
          class="childNav d-none"
          data-parent="others"
          :class="{ 'd-block': selectedParentMenu == 'pages' }"
        >
          <li class="nav-item">
            <router-link tag="a" class to="/app/pages/error">
              <i class="nav-icon i-Error-404-Window"></i>
              <span class="item-name">Not Found</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/pages/profile">
              <i class="nav-icon i-Male"></i>
              <span class="item-name">User Profile</span>
            </router-link>
          </li>

          <li class="nav-item">
            <router-link tag="a" class to="/app/pages/icons">
              <i class="nav-icon i-Male"></i>
              <span class="item-name">icons</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/pages/search-result">
              <i class="nav-icon i-File-Search"></i>
              <span class="item-name">
                Search Result
                <span class="badge badge-pill badge-danger">New</span>
              </span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/pages/pricing-table">
              <i class="nav-icon i-Billing"></i>
              <span class="item-name">
                Pricing Table
                <span class="badge badge-pill badge-danger">New</span>
              </span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link tag="a" class to="/app/pages/faq">
              <i class="nav-icon i-Billing"></i>
              <span class="item-name">
                Faq
                <span class="badge badge-pill badge-danger">New</span>
              </span>
            </router-link>
          </li>
          <!-- <li class="nav-item">
            <a href="blank.html" class="open">
              <i class="nav-icon i-File-Horizontal"></i>
              <span class="item-name">Blank Page</span>
            </a>
          </li>-->
        </ul>
      </div>
    </vue-perfect-scrollbar>
    <div
      @click="removeOverlay()"
      class="sidebar-overlay"
      :class="{ open: getSideBarToggleProperties.isSecondarySideNavOpen }"
    ></div>
  </div>
  <!--=============== Left side End ================-->
</template>

<script>
import Topnav from "./TopNav";
import { isMobile } from "mobile-device-detect";
import router from "../../../router";
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 


import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    Topnav,
  },

  data() {
    return {
      webpageOrderAmount: null,

      webpageOrderInterval: null,

      isDisplay: true,
      isMenuOver: false,
      isStyle: true,
      selectedParentMenu: "",
      isMobile,
      isAdmin: '',
      agentName: '',
      localityName: '',
      localityType: '',
      ranking: false,

      locality: false,
      localityAgent: false,

      loader: false,

      localitiesOptions: [],
      agentOptions: [],

      initialDateOption: '',
      endDateOption: '',

      passwordInput: '',
      url: 'https://hostname.payitcr.com',

      isClicked: null

    };
  },
  async mounted() {



    this.toggleSelectedParentMenu();
    window.addEventListener("resize", this.handleWindowResize);
    document.addEventListener("click", this.returnSelectedParentMenu);
    this.handleWindowResize();
    this.agentName = localStorage.getItem('agentName');
    if (localStorage.getItem('agentType') == 'admin'){
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }

    if (localStorage.getItem('ranking') == 'yes'){
      this.ranking = true;
    } 

    if (localStorage.getItem('locality') == 'yes'){
      this.locality = true;
      this.ranking = false;
      this.localityType = localStorage.getItem('localityType');
      this.localityName = localStorage.getItem('localityName');

    }

    if (localStorage.getItem('agentType') == 'localityAgent'){
      this.localityAgent = true;
      this.ranking = false;
    }
  },

  beforeDestroy() {
    if (webpageOrderInterval){
      clearInterval(webpageOrderInterval);
    }

    document.removeEventListener("click", this.returnSelectedParentMenu);
    window.removeEventListener("resize", this.handleWindowResize);
  },
  computed: {
    ...mapGetters(["getSideBarToggleProperties"]),
  },

  methods: {
    ...mapActions([
      "changeSecondarySidebarProperties",
      "changeSecondarySidebarPropertiesViaMenuItem",
      "changeSecondarySidebarPropertiesViaOverlay",
      "changeSidebarProperties",
    ]),

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    handleClick(item){
      this.isClicked = item;
      
      setTimeout(() => {
        this.isClicked = null;
      }, 300); 

    },


    handleWindowResize() {
      //  console.log('not working is Mobile');
      if (window.innerWidth <= 1200) {
        if (this.getSideBarToggleProperties.isSideNavOpen) {
          this.changeSidebarProperties();
        }
        if (this.getSideBarToggleProperties.isSecondarySideNavOpen) {
          this.changeSecondarySidebarProperties();
        }
      } else {
        if (!this.getSideBarToggleProperties.isSideNavOpen) {
          this.changeSidebarProperties();
        }
      }
    },
    toggleSelectedParentMenu() {
      const currentParentUrl = this.$route.path
        .split("/")
        .filter((x) => x !== "")[1];

      if (currentParentUrl !== undefined || currentParentUrl !== null) {
        this.selectedParentMenu = currentParentUrl.toLowerCase();
      } else {
        this.selectedParentMenu = "dashboards";
      }
    },
    toggleSubMenu(e) {
      let hasSubmenu = e.target.dataset.submenu;
      let parent = e.target.dataset.item;
      if (hasSubmenu) {
        this.selectedParentMenu = parent;
        this.changeSecondarySidebarPropertiesViaMenuItem(true);
      } else {
        this.selectedParentMenu = parent;
        this.changeSecondarySidebarPropertiesViaMenuItem(false);
      }
      console.log(hasSubmenu, parent);
    },

    removeOverlay() {
      this.changeSecondarySidebarPropertiesViaOverlay();
      if (window.innerWidth <= 1200) {
        this.changeSidebarProperties();
      }
      this.toggleSelectedParentMenu();
    },
    returnSelectedParentMenu() {
      if (!this.isMenuOver) {
        this.toggleSelectedParentMenu();
      }
    },

    async selectWebpageOrderFromCallcenterCount(){
      const previousWebpageOrderAmount = this.webpageOrderAmount;

      axios.post(this.url + '/webpage/functions/selectWebpageOrderFromCallcenterCount').then((response) =>{
        if (response.data.success){
          this.webpageOrderAmount = response.data.result;
          if (this.webpageOrderAmount > previousWebpageOrderAmount && previousWebpageOrderAmount != null){
            var soundToPlay = new Audio(require('../../../assets/pageAssets/webpage.wav'));
            soundToPlay.play();
          }
        } else {
          this.showNotification('danger', 'Error al consultar los pedidos de la página web', 'Ha ocurrido un error inesperado al consultar los pedidos de la página web. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar los pedidos de la página web', 'Ha ocurrido un error inesperado al consultar los pedidos de la página web. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    }, 

    toggleSidebarDropdwon(event) {
      let dropdownMenus = this.$el.querySelectorAll(".dropdown-sidemenu.open");

      event.currentTarget.classList.toggle("open");

      dropdownMenus.forEach((dropdown) => {
        dropdown.classList.remove("open");
      });
    },
  },
};
</script>

<style scoped>
@keyframes clickAnimation {
  0% {
    transform: scale(1); /* Estado original */
  }
  50% {
    transform: scale(0.90); /* Un poco más pequeño en la mitad de la animación */
  }
  100% {
    transform: scale(1); /* Vuelve al tamaño original */
  }
}

.clicked {
  animation: clickAnimation 0.3s ease; /* Duración de la animación */
}

</style>

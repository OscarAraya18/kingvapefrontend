const state = {
  backendURL: 'https://payitcr.com',
  websocketURL: 'wss:payitcr.com',
  applicationVersion: '1.2.17B'
};

const getters = {
  getBackendURL: state => state.backendURL,
  getWebsocketURL: state => state.websocketURL,
  getApplicationVersion: state => state.applicationVersion
};

const actions = {
  changeBackendURL({commit}, backendURL) {
    commit('updateBackendURL', backendURL);
  },
  changeWebsocketURL({commit}, websocketURL) {
    commit('updateWebsocketURL', websocketURL);
  }
};

const mutations = {
  updateBackendURL(state, backendURL) {
    state.backendURL = backendURL;
  },

  updateWebsocketURL(state, websocketURL) {
    state.backendURL = websocketURL;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};

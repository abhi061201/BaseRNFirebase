// this class is used to check network is present or not

import NetInfo, {
    NetInfoState,
    NetInfoSubscription,
  } from '@react-native-community/netinfo';
  
  class NetworkService {
    private isConnected: boolean = true;
    private netInfoSubscription?: NetInfoSubscription;
  
    constructor() {
      this.handleConnectivityChange = this.handleConnectivityChange.bind(this);
    }
  
    handleConnectivityChange(state: NetInfoState) {
      this.isConnected = state.isConnected ?? false;
      // Perform actions based on connectivity change here
      console.log(
        'Network connectivity changed:',
        this.isConnected ? 'Connected' : 'Disconnected',
      );
    }
  
    startMonitoring() {
      this.netInfoSubscription = NetInfo.addEventListener(
        this.handleConnectivityChange,
      );
    }
  
    stopMonitoring() {
      if (this.netInfoSubscription) {
        this.netInfoSubscription();
        this.netInfoSubscription = undefined;
      }
    }
  
    getConnectionStatus(): boolean {
      return this.isConnected;
    }
  }
  
  const networkService = new NetworkService();
  export default networkService;
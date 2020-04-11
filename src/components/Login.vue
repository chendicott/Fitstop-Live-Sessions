<template>
    <div class="container" >
        <div v-if="!hasCodeBeenSent">
            <div class="max-w-md w-full p-3 mt-5 sm:mx-auto sm:w-full sm:max-w-md">
                <h2 class="font-bold mb-5 text-lg">Login using your registered Fitstop LIVE sessions number</h2>
                <div class="rounded-md shadow-sm">
                    <div>
                    <input aria-label="Phone number" v-model="number" name="number" type="number" required class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5" placeholder="Phone number" />
                    </div>
            
                </div>
                <div class="mt-6">
                    <button @click="numberSubmitted" :v-bind="number" type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:border-gray-700 focus:shadow-outline-gray active:bg-gray-700 transition duration-150 ease-in-out">
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg class="h-5 w-5 text-black-500 group-hover:text-gray-400 transition ease-in-out duration-150" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                            </svg>
                        </span>
                        <span v-if="!loading">Sign in</span>
                        <span v-else>Loading...</span>
                    </button>
                </div>
            </div>
        </div>
        <div v-else>
           <div class="max-w-md w-full p-3 mt-5 sm:mx-auto sm:w-full sm:max-w-md">
                <h2 class="font-bold mb-5 text-lg">Enter the code sent to your number</h2>
                <div class="rounded-md shadow-sm">
                    <div>
                    <input aria-label="Code" v-model="code" name="number" type="number" required class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5" placeholder="Code" />
                    </div>
            
                </div>
                <div class="mt-6">
                    <button @click="codeSubmitted" :v-bind="number" type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:border-gray-700 focus:shadow-outline-gray active:bg-gray-700 transition duration-150 ease-in-out">
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <svg class="h-5 w-5 text-black-500 group-hover:text-gray-400 transition ease-in-out duration-150" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                            </svg>
                        </span>
                        <span v-if="!loading">Finish sign in</span>
                        <span v-else>Loading...</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from "axios";
export default {
  name: 'Login',
  components: {
  },
  data: function() {
      return {
          hasCodeBeenSent: false,
          number: "",
          code: "",  
          loading: false
      }
  },
  props: {
    deviceId: String
  },
  methods: {
      numberSubmitted: function() {
        if (this.loading) {
              return;
          }
          var vm = this;
          var data = {
              phone: this.number
          };
            
            this.loading = true;
          axios({
            method: 'post',
            url: 'https://fitstop-proxy.herokuapp.com/https://api.fitstop.com/api/v1/members/send_sms_code',
            data: data,
            headers: {
                "content-type": "application/json",
                "x-device-token": this.deviceId
            }
        }).then(function() {
            vm.hasCodeBeenSent = true;
            vm.loading = false;
        }).finally(function() {
            vm.loading = false;
        })
      },
      codeSubmitted: function() {
          if (this.loading) {
              return;
          }
          var vm = this;
          var data = {
              phone: this.number,
              code: this.code
          };
            this.loading = true;
          axios({
            method: 'post',
            url: 'https://fitstop-proxy.herokuapp.com/https://api.fitstop.com/api/v1/auth/sign_in',
            data: data,
            headers: {
                "content-type": "application/json",
                "x-device-token": this.deviceId
            }
        }).then(function(e) {
             window.console.log(e);

             var name = e.data.first_name;
             var credentials = {};

             credentials.access_token = e.headers["access-token"];
             credentials.client = e.headers.client;
             credentials.device_id = vm.deviceId;
             credentials.name = name;
             credentials.uid = vm.number;
             credentials.location_id = e.data.location_id;

             vm.$emit('loggedin', credentials);
            vm.loading = false;
        }).finally(function() {
            vm.loading = false;
        })
      }
  }
}
</script>
<template>
<div class="min-h-screen bg-gray-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="container mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <nav v-if="!shouldLogin">
          <p class="py-2 text-gray-800 text-lg font-bold">Hi {{credentials.name}}.</p>
          <p class="py-4 text-gray-800 mb-3">Here's your upcoming booked sessions for today. Click on a session to open the Zoom link.</p>
          <div v-if='links.length > 0'>
            <a v-for="link in links" v-bind:key="link.live_url" :href='link.live_url' target='_blank' class='group flex items-center px-3 py-2 text-sm leading-5 font-medium text-gray-900 rounded-md bg-gray-300 hover:text-gray-900 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition ease-in-out duration-150 margin-top-small'>
              <span class='truncate'>{{link.type}} | {{link.start_time}} - {{link.end_time}}
              </span>
            </a>
          </div>
          <p v-else-if="loading" class="px-3 mt-3 py-2 bg-red-100">Loading sessions...</p>
          <p v-else class="px-3 mt-3 py-2 bg-red-100">No booked sessions</p>
        </nav>
        <login v-else :device-id="credentials.deviceId" @loggedin="loggedIn"></login>
      </div>
      <div class="text-center py-8">Built with 
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="inline-block h-4 w-4 text-red-500 group-hover:text-gray-400 transition ease-in-out duration-150" fill="currentColor"><path d="M12.76 3.76a6 6 0 0 1 8.48 8.48l-8.53 8.54a1 1 0 0 1-1.42 0l-8.53-8.54a6 6 0 0 1 8.48-8.48l.76.75.76-.75zm7.07 7.07a4 4 0 1 0-5.66-5.66l-1.46 1.47a1 1 0 0 1-1.42 0L9.83 5.17a4 4 0 1 0-5.66 5.66L12 18.66l7.83-7.83z"/></svg>
         for the Fitstop community by <a class="text-red-500" href="https://www.linkedin.com/in/chendicott/" target="_blank">Connor Hendicott</a></div>
    </div>
  </div>
</template>
<script>  
import axios from "axios";
import Login from './Login.vue';
export default {
  name: 'FitstopMain',
  components: {
    Login
  },
  data: function() {
    return {
      shouldLogin: false,
      links: [],
      credentials: undefined,
      loading: false
    }
  },
  created: function() {
    try {
      this.credentials = JSON.parse(window.localStorage.getItem("credentials"))
    } catch (e) {
      window.console.log("Error");
    }
    this.shouldLogin = !this.credentials;

    if (this.shouldLogin) {
      this.credentials = {};
      this.credentials.deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    } else {
       this.getBookings();
    }
  },
  methods: {
    getBookings: function() {
      if (this.loading) {
        return;
      }
      this.loading = true;
       var vm = this;
       var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();

      today = yyyy + '-' + mm + '-' + dd;
      
          axios({
            method: 'get',
            url: 'https://fitstop-proxy.herokuapp.com/https://api.fitstop.com/api/v2/locations/location_sessions?date='+ today +'&location_id=' + this.credentials.location_id,
            data: "",
            headers: {
                "content-type": "application/json",
                "x-device-token": this.credentials.device_id,
                "client": this.credentials.client,
                "uid": this.credentials.uid,
                "access-token": this.credentials.access_token
            }
        }).then(function(e) {
            var links = [];

            e.data.location_sessions.forEach(function(session) {
              if (session.status === "booked" || session.status === "in-progress-booked") {
                var local = {};
                local.live_url = session.live_url;
                local.type = session.type;
                local.start_time = session.start_time;
                local.end_time = session.end_time;

                links.push(local);
              }
              
            })

            vm.links = links;

            vm.shouldLogin = false;
            vm.loading = false;
        })
        .catch(function (error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);

            if (error.response.status === 401) {
              vm.credentials = undefined;
              vm.shouldLogin = true;
              vm.credentials = {};
              vm.credentials.deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
          console.log(error.config);
        })
        .finally(function(e) {
          window.console.log(e);
          vm.loading = false;
        })
    },
    loggedIn: function(e) {
      this.credentials = e;
      this.getBookings();
    }
  },
  watch: {
    "credentials": function() {
      if (!this.credentials.client) {
        return;
      }

      this.shouldLogin = false;

      window.localStorage.setItem('credentials', JSON.stringify(this.credentials));
    }
  }

}
</script>
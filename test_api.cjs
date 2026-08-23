const axios = require('axios');
axios.get('http://localhost:8000/api/command-center/summary').then(r => console.log(JSON.stringify(r.data, null, 2))).catch(e => console.log(e.message));

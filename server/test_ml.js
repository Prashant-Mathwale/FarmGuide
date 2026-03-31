const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:5000/api/ml/crop-recommendation', {
            N_level: 25, P_level: 35, K_level: 40, pH_value: 7, moisture: 45, temperature: 30, rainfall: 133
        });
        console.log("Success:", res.data);
    } catch (error) {
        console.log("Error:", error.response ? error.response.data : error.message);
    }
}
test();

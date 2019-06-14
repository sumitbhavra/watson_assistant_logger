const axios = require('axios');

const logger = async (url, watson) => {
  try {
    let response = await axios(url, {
      withCredentials: true,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      auth: {
        username: watson.username,
        password: watson.password
      }
    });
    return response;
  } catch (error) {
    console.log(error)
    throw error;
  }
}

module.exports = logger;

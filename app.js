const yargs = require("yargs");
const axios = require("axios");
const fahrenheitToCelsius = require("fahrenheit-to-celsius");

const argv = yargs
  .options({
    a: {
      demand: true,
      default: "28-200",
      valueOfalias: "Address",
      describe: "Address to fetch weather for",
      string: true
    }
  })
  .help()
  .alias("help", "h").argv;

var encodedAddress = encodeURIComponent(argv.a);
var geocodeUrl = `http://www.mapquestapi.com/geocoding/v1/address?key=XIxJKxpTAiDBujA6xvsT68MqEVQQsEHd&location=?${encodedAddress}`;
//Axios jest asynchroniczna funkcją, która zwraca objetnice resolve i reject. Tak jak zwykłe obitniece. Teraz wywołuję funkcję.
axios
  .get(geocodeUrl) //get pozwala na zrobienie htttp request, axios automatycznei parsuje dane jsone'a
  .then(response => {
    if (
      response.data === undefined || //w axios dane pobrane z API znajdują się w data
      response.data === "The AppKey submitted with this request is invalid." ||
      response.data.results[0].locations[0].adminArea5 === ""
    )
      throw new Error("Unable to find that address");
    var latitude = response.data.results[0].locations[0].latLng.lat;
    var longitude = response.data.results[0].locations[0].latLng.lng;
    console.log(response.data.results[0].locations[0].adminArea5);
    var weatherUrl = `https://api.darksky.net/forecast/286f1a48d6cf20c07aedb42da38b2acc/${latitude},${longitude}`;
    return axios.get(weatherUrl);
  })
  .then(response => {
    // w tym miejscu jest promise chaining
    var temperature = Math.round(
      fahrenheitToCelsius(response.data.currently.temperature)
    );
    var apparentTemperature = Math.round(
      fahrenheitToCelsius(response.data.currently.apparentTemperature)
    );
    console.log(
      `It's currently ${temperature}. It feels like ${apparentTemperature}`
    );
  })
  .catch(error => {
    if (error.code === "ENOTFOUND") {
      console.log("Unable to connect to API servers.");
    } else console.log(error.message);
  });

const env = "local";

let api_endpoint;
switch (env) {
  case "live":
    api_endpoint = "https://flaskapp.osc-fr1.scalingo.io";
    break;
  case "local":
    api_endpoint = "http://0.0.0.0:5000";
    break;
  default:
    api_endpoint = "http://0.0.0.0:5000";
    break;
}

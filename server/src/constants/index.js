const ENV = process.env.NODE_ENV || "development";
const locahostURL = process.env.CLIENT_URL || "http://localhost:5005";
const productionURL =
  process.env.CLIENT_URL || "https://chatify-frontend.vercel.app";

const CLIENT_URL = ENV === "production" ? productionURL : locahostURL;

export { ENV, CLIENT_URL };

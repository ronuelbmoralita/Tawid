import * as admin from "firebase-admin";

admin.initializeApp();

export {getPaymongoKey} from "./services/getPaymongoKey";
export {tawidNotification} from "./services/tawidNotification";
export {tawidNotifyAll} from "./services/tawidNotifyAll";

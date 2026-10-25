import * as admin from "firebase-admin";

admin.initializeApp();

export {getPaymongoKey} from "./cloudFunctions/getPaymongoKey";
export {tawidNotification} from "./cloudFunctions/tawidNotification";
export {tawidNotifyAll} from "./cloudFunctions/tawidNotifyAll";
export {createTawidTransaction, updateTawidTransaction} from "./cloudFunctions/tawidTransactions";
export {tawidCreateUser} from "./cloudFunctions/tawidCreateUser";

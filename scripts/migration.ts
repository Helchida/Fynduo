import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import {db} from "../services/firebase/config";

const OLD_PATH = "charges_variables";
const NEW_PATH = "households/42JTlXmuyY97cgmJ4h6j/charges_variables"; 

export async function migrateComptesMensuels() {
  console.log("Migration comptes_mensuels → households…");

  const oldCollection = collection(db, OLD_PATH);
  const oldDocs = await getDocs(oldCollection);

  for (const oldDoc of oldDocs.docs) {
    const newDocRef = doc(db, `${NEW_PATH}/${oldDoc.id}`);

    await setDoc(newDocRef, oldDoc.data());

    console.log(`✔️ Copié : ${oldDoc.id}`);
  }

  console.log("🔥 Migration terminée !");
}

migrateComptesMensuels();

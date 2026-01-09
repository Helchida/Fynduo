process.env.FIRESTORE_EMULATOR_HOST = "localhost:4000";
const firebase = require("@firebase/testing");
const fs = require("fs");
const path = require("path");

const PROJECT_ID = "fynduo-test";
const rules = fs.readFileSync("firestore.rules", "utf8");

beforeAll(async () => {
  await firebase.loadFirestoreRules({
    projectId: PROJECT_ID,
    rules: rules,
  });
});

function getFirestore(auth) {
  return firebase
    .initializeTestApp({ projectId: PROJECT_ID, auth })
    .firestore();
}

function getAdminFirestore() {
  return firebase.initializeAdminApp({ projectId: PROJECT_ID }).firestore();
}

beforeEach(async () => {
  await firebase.clearFirestoreData({ projectId: PROJECT_ID });
});

afterAll(async () => {
  await Promise.all(firebase.apps().map((app) => app.delete()));
});

describe("Firestore Security Rules", () => {
  it("❌ Refuse accès non authentifié", async () => {
    const db = getFirestore(null);
    const testDoc = db.collection("users").doc("user1");

    await firebase.assertFails(testDoc.get());
  });

  it("✅ Permet lecture son propre profil", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();

    await adminDb.collection("users").doc("user1").set({
      email: "test@test.com",
      displayName: "Test User",
      activeHouseholdId: "house1",
      households: ["house1"],
    });

    const testDoc = db.collection("users").doc("user1");
    await firebase.assertSucceeds(testDoc.get());
  });

  it("❌ Refuse lecture profil autre utilisateur", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();

    await adminDb.collection("users").doc("user2").set({
      email: "other@test.com",
      displayName: "Other User",
      activeHouseholdId: "house2",
      households: ["house2"],
    });

    const testDoc = db.collection("users").doc("user2");
    await firebase.assertFails(testDoc.get());
  });

  it("❌ Refuse modification activeHouseholdId", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();

    await adminDb.collection("users").doc("user1").set({
      email: "test@test.com",
      displayName: "Test User",
      activeHouseholdId: "house1",
      households: ["house1"],
    });

    const testDoc = db.collection("users").doc("user1");
    await firebase.assertFails(testDoc.update({ activeHouseholdId: "house2" }));
  });

  it("✅ Permet lecture charges du foyer", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();

    await adminDb.collection("users").doc("user1").set({
      email: "test@test.com",
      displayName: "Test User",
      activeHouseholdId: "house1",
      households: ["house1"],
    });

    await adminDb
      .collection("households")
      .doc("house1")
      .collection("charges_fixes")
      .doc("charge1")
      .set({
        nom: "Électricité",
        montantMensuel: 50,
        payeur: "user1",
      });

    const testDoc = db
      .collection("households")
      .doc("house1")
      .collection("charges_fixes")
      .doc("charge1");

    await firebase.assertSucceeds(testDoc.get());
  });

  it("❌ Refuse accès charges autre foyer", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();

    await adminDb.collection("users").doc("user1").set({
      email: "test@test.com",
      displayName: "Test User",
      activeHouseholdId: "house1",
      households: ["house1"],
    });

    await adminDb
      .collection("households")
      .doc("house2")
      .collection("charges_fixes")
      .doc("charge1")
      .set({
        nom: "Électricité",
        montantMensuel: 50,
        payeur: "user2",
      });

    const testDoc = db
      .collection("households")
      .doc("house2")
      .collection("charges_fixes")
      .doc("charge1");

    await firebase.assertFails(testDoc.get());
  });

  it("✅ Permet création d'une charge variable valide", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();
    await adminDb
      .collection("users")
      .doc("user1")
      .set({ activeHouseholdId: "house1" });

    const testRef = db
      .collection("households")
      .doc("house1")
      .collection("charges_variables")
      .doc("chargeV1");

    await firebase.assertSucceeds(
      testRef.set({
        description: "Courses hebdomadaires",
        montantTotal: 85.5,
        payeur: "user1",
        beneficiaires: ["user1", "user2"],
        dateStatistiques: "2023-10-27",
        dateComptes: "2023-10-27",
        moisAnnee: "10-2023",
      })
    );
  });

  it("❌ Refuse création charge variable si montant est négatif ou zéro", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();
    await adminDb
      .collection("users")
      .doc("user1")
      .set({ activeHouseholdId: "house1" });

    const testRef = db
      .collection("households")
      .doc("house1")
      .collection("charges_variables")
      .doc("chargeV2");

    await firebase.assertFails(
      testRef.set({
        description: "Test erreur",
        montantTotal: -10,
        payeur: "user1",
        beneficiaires: ["user1"],
        dateDepense: "2023-10-27",
        dateAjout: "2023-10-27",
        moisAnnee: "10-2023",
      })
    );
  });

  it("❌ Refuse création charge variable si un champ obligatoire manque", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();
    await adminDb
      .collection("users")
      .doc("user1")
      .set({ activeHouseholdId: "house1" });

    const testRef = db
      .collection("households")
      .doc("house1")
      .collection("charges_variables")
      .doc("chargeV3");

    await firebase.assertFails(
      testRef.set({
        description: "Manque le payeur",
        montantTotal: 50,
        beneficiaires: ["user1"],
        dateDepense: "2023-10-27",
        dateAjout: "2023-10-27",
        moisAnnee: "10-2023",
      })
    );
  });

  it("❌ Refuse suppression d'un compte mensuel finalisé", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();
    await adminDb
      .collection("users")
      .doc("user1")
      .set({ activeHouseholdId: "house1" });
    await adminDb
      .collection("households")
      .doc("house1")
      .collection("comptes_mensuels")
      .doc("octobre2023")
      .set({
        moisAnnee: "10-2023",
        loyerTotal: 800,
        apportsAPL: 150,
        statut: "finalisé",
      });

    const testRef = db
      .collection("households")
      .doc("house1")
      .collection("comptes_mensuels")
      .doc("octobre2023");
    await firebase.assertFails(testRef.delete());
  });

  it("❌ Refuse suppression d'une catégorie par défaut", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();
    await adminDb
      .collection("users")
      .doc("user1")
      .set({ activeHouseholdId: "house1" });

    await adminDb
      .collection("households")
      .doc("house1")
      .collection("categories")
      .doc("cat_alim")
      .set({
        label: "Alimentation",
        icon: "food",
        isDefault: true,
      });

    const testRef = db
      .collection("households")
      .doc("house1")
      .collection("categories")
      .doc("cat_alim");
    await firebase.assertFails(testRef.delete());
  });

  it("✅ Permet à un membre de voir le profil d'un autre membre du même foyer", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();

    await adminDb
      .collection("users")
      .doc("user1")
      .set({ activeHouseholdId: "house1", displayName: "User 1", households: ["house1"] });
    await adminDb
      .collection("users")
      .doc("user2")
      .set({ activeHouseholdId: "house1", displayName: "User 2", households: ["house1"] });

    const testDoc = db.collection("users").doc("user2");
    await firebase.assertSucceeds(testDoc.get());
  });

  it("✅ Permet de lister les utilisateurs de son propre foyer (Query)", async () => {
    const db = getFirestore({ uid: "user1" });
    const adminDb = getAdminFirestore();

    await adminDb
      .collection("users")
      .doc("user1")
      .set({ activeHouseholdId: "house1", displayName: "Me", households: ["house1"] });
    await adminDb
      .collection("users")
      .doc("user2")
      .set({ activeHouseholdId: "house1", displayName: "Roommate", households: ["house1"] });

    const usersCol = db.collection("users");
    const q = usersCol.where("activeHouseholdId", "==", "house1");

    await firebase.assertSucceeds(q.get());
  });

  it("❌ Refuse de lister tous les utilisateurs de la base sans filtre", async () => {
    const db = getFirestore({ uid: "user1" });
    const usersCol = db.collection("users");
    await firebase.assertFails(usersCol.get());
  });
});

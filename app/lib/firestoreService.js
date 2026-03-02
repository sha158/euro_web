import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import {
  opportunities as mockOpportunities,
  quotes as mockQuotes,
  quoteDesigns as mockQuoteDesigns,
  catalogItems as mockCatalogItems,
} from '../data/mockData';

// ─── Opportunities ───────────────────────────────────────────────────────────

export function subscribeOpportunities(callback) {
  return onSnapshot(collection(db, 'opportunities'), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(items);
  });
}

export async function addOpportunity(data) {
  await setDoc(doc(db, 'opportunities', data.id), data);
}

export async function updateOpportunity(id, data) {
  await updateDoc(doc(db, 'opportunities', id), data);
}

export async function deleteOpportunity(id) {
  await deleteDoc(doc(db, 'opportunities', id));
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

export function subscribeQuotes(callback) {
  return onSnapshot(collection(db, 'quotes'), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(items);
  });
}

export async function addQuote(data) {
  await setDoc(doc(db, 'quotes', data.id), data);
}

export async function updateQuote(id, data) {
  await updateDoc(doc(db, 'quotes', id), data);
}

export async function deleteQuote(id) {
  await deleteDoc(doc(db, 'quotes', id));
}

// ─── Designs (per quote key) ─────────────────────────────────────────────────

export function subscribeDesigns(quoteKey, callback) {
  return onSnapshot(doc(db, 'designs', quoteKey), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback(Array.isArray(data.designs) ? data.designs : []);
    } else {
      callback([]);
    }
  });
}

export async function getDesigns(quoteKey) {
  const snapshot = await getDoc(doc(db, 'designs', quoteKey));
  if (snapshot.exists()) {
    const data = snapshot.data();
    return Array.isArray(data.designs) ? data.designs : [];
  }
  return [];
}

export async function saveDesigns(quoteKey, designsArray) {
  await setDoc(doc(db, 'designs', quoteKey), { designs: designsArray });
}

// ─── Design Catalog ──────────────────────────────────────────────────────────

export function subscribeDesignCatalog(callback) {
  return onSnapshot(collection(db, 'designCatalog'), (snapshot) => {
    const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
    callback(items);
  });
}

export async function getCatalogItems() {
  const snapshot = await getDocs(collection(db, 'designCatalog'));
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
}

export async function addCatalogItem(item) {
  await setDoc(doc(db, 'designCatalog', item.id), item);
}

export async function deleteCatalogItem(id) {
  await deleteDoc(doc(db, 'designCatalog', id));
}

// ─── Quote Rates (pricing, profile, reinforcement, hardware, glass) ─────────

export function subscribeQuoteRates(quoteKey, callback) {
  return onSnapshot(doc(db, 'quoteRates', quoteKey), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      callback({});
    }
  });
}

export async function getQuoteRates(quoteKey) {
  const snapshot = await getDoc(doc(db, 'quoteRates', quoteKey));
  return snapshot.exists() ? snapshot.data() : {};
}

export async function saveQuoteRates(quoteKey, field, value) {
  await setDoc(doc(db, 'quoteRates', quoteKey), { [field]: value }, { merge: true });
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

export async function seedIfEmpty() {
  const snapshot = await getDocs(collection(db, 'opportunities'));
  if (!snapshot.empty) return false; // Already seeded

  const batch = writeBatch(db);

  // Seed opportunities
  for (const opp of mockOpportunities) {
    batch.set(doc(db, 'opportunities', opp.id), opp);
  }

  // Seed quotes
  for (const qt of mockQuotes) {
    batch.set(doc(db, 'quotes', qt.id), qt);
  }

  // Seed designs
  for (const [key, designs] of Object.entries(mockQuoteDesigns)) {
    if (designs.length > 0) {
      batch.set(doc(db, 'designs', key), { designs });
    }
  }

  // Seed catalog items
  for (const item of mockCatalogItems) {
    batch.set(doc(db, 'designCatalog', item.id), item);
  }

  await batch.commit();
  return true; // Seeded successfully
}

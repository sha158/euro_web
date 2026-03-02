'use client';
import { useState, useEffect } from 'react';
import {
  subscribeOpportunities,
  subscribeQuotes,
  subscribeDesigns,
  subscribeDesignCatalog,
  subscribeQuoteRates,
  seedIfEmpty,
} from './firestoreService';

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeOpportunities((items) => {
      setOpportunities(items);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { opportunities, loading };
}

export function useQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeQuotes((items) => {
      setQuotes(items);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { quotes, loading };
}

export function useDesigns(quoteKey) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quoteKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeDesigns(quoteKey, (items) => {
      setDesigns(items);
      setLoading(false);
    });
    return unsubscribe;
  }, [quoteKey]);

  return { designs, loading };
}

export function useDesignCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeDesignCatalog((items) => {
      setCatalog(items);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { catalog, loading };
}

export function useQuoteRates(quoteKey) {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quoteKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeQuoteRates(quoteKey, (data) => {
      setRates(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [quoteKey]);

  return { rates, loading };
}

export function useFirestoreInit() {
  const [seeded, setSeeded] = useState(false);
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    seedIfEmpty()
      .then((didSeed) => {
        setSeeded(didSeed);
        setSeeding(false);
      })
      .catch((err) => {
        console.error('Failed to seed Firestore:', err);
        setSeeding(false);
      });
  }, []);

  return { seeded, seeding };
}

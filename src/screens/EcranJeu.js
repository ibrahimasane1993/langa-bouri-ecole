import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getQuestions } from '../supabase';

const { width } = Dimensions.get('window');
const TOTAL_QUESTIONS = 10;
const LABYRINTHE_CASES = 10;

// Décor du labyrinthe selon la position
const getDecorLabyrinthe = (pos) => {
  if (pos === 0) return { emoji: '🏘️', label: 'Départ' };
  if (pos < 3) return { emoji: '🌿', label: 'Sentier' };
  if (pos < 5) return { emoji: '🌲', label: 'Forêt' };
  if (pos < 7) return { emoji: '🗼', label: 'Tour' };
  if (pos < 9) return { emoji: '🏰', label: 'Château' };
  if (pos < 10) return { emoji: '🚪', label: 'Porte' };
  return { emoji: '👑', label: 'Trône !' };
};

export default function EcranJeu({ naviguer, niveau, pseudo }) {
  const [questions, setQuestions] = useState([]);
  const [indexQ, setIndexQ] = useState(0);
  const [score, setScore] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState(null);
  const [corrige, setCorrige] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [tempsRestant, setTempsRestant] = useState(20);
  const [avatarPos, setAvatarPos] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => { chargerQuestions(); }, []);

  useEffect(() => {
    if (!chargement && !corrige) demarrerTimer();
    return () => clearInterval(timerRef.current);
  }, [indexQ, chargement, corrige]);

  // Pulse sur la question
  useEffect(() => {
    if (!corrige && !chargement) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [indexQ]);

  const chargerQuestions = async () => {
    try {
      const data = await getQuestions(niveau);
      setQuestions(data.slice(0, TOTAL_QUESTIONS));
    } catch (e) {
      setQuestions(QUESTIONS_FALLBACK[niveau] || QUESTIONS_FALLBACK[1]);
    }
    setChargement(false);
  };

  const demarrerTimer = () => {
    setTempsRestant(20);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTempsRestant(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          traiterReponse(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const traiterReponse = (reponse) => {
    clearInterval(timerRef.current);
    setReponseChoisie(reponse);
    setCorrige(true);

    const q = questions[indexQ];
    const correct = reponse === q.bonne_reponse;

    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      const newPos = Math.min(avatarPos + 1, LABYRINTHE_CASES);
      setAvatarPos(newPos);
      Animated.spring(avatarAnim, {
        toValue: newPos * ((width - 80) / LABYRINTHE_CASES),
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 70, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      if (indexQ + 1 >= TOTAL_QUESTIONS) {
        naviguer('resultat', {
          resultat: {
            score: correct ? score + 10 : score,
            total: TOTAL_QUESTIONS * 10,
            correct: correct ? score / 10 + 1 : score / 10,
            avatarPos: correct ? Math.min(avatarPos + 1, LABYRINTHE_CASES) : avatarPos,
          }
        });
      } else {
        setIndexQ(prev => prev + 1);
        setReponseChoisie(null);
        setCorrige(false);
      }
    }, 1600);
  };

  if (chargement) {
    return (
      <LinearGradient colors={['#0A0A1A', '#1A1A3E', '#0D2B0D']} style={styles.container}>
        <View style={styles.centrer}>
          <Text style={styles.chargementEmoji}>🏰</Text>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.chargementTexte}>Le château vous attend...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (questions.length === 0) {
    return (
      <LinearGradient colors={['#0A0A1A', '#1A1A3E', '#0D2B0D']} style={styles.container}>
        <View style={styles.centrer}>
          <Text style={styles.erreurTexte}>❌ Impossible de charger les questions.{'\n'}Vérifie ta connexion.</Text>
          <TouchableOpacity style={styles.btnRetour} onPress={() => naviguer('accueil')}>
            <Text style={styles.btnRetourTexte}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const q = questions[indexQ];
  const reponses = [
    { key: 'A', texte: q.reponse_a },
    { key: 'B', texte: q.reponse_b },
    { key: 'C', texte: q.reponse_c },
    { key: 'D', texte: q.reponse_d },
  ];

  const couleurBouton = (key) => {
    if (!corrige) return styles.btnReponse;
    if (key === q.bonne_reponse) return [styles.btnReponse, styles.btnCorrect];
    if (key === reponseChoisie) return [styles.btnReponse, styles.btnFaux];
    return [styles.btnReponse, styles.btnInactif];
  };

  const timerCouleur = tempsRestant > 10 ? '#4CAF50' : tempsRestant > 5 ? '#FF9800' : '#F44336';
  const decorActuel = getDecorLabyrinthe(avatarPos);
  const decorSuivant = getDecorLabyrinthe(Math.min(avatarPos + 1, LABYRINTHE_CASES));

  return (
    <LinearGradient colors={['#0A0A1A', '#1A1A3E', '#0D2B0D']} style={styles.container}>
      <SafeAreaView style={styles.safe}>

        {/* Header royal */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => naviguer('accueil')} style={styles.quitterBtn}>
            <Text style={styles.quitter}>✕</Text>
          </TouchableOpacity>
          <View style={styles.pseudoContainer}>
            <Text style={styles.pseudoEmoji}>⚔️</Text>
            <Text style={styles.pseudo}>{pseudo}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreTexte}>👑 {score}</Text>
          </View>
        </View>

        {/* Barre de progression */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(indexQ / TOTAL_QUESTIONS) * 100}%` }]} />
        </View>
        <Text style={styles.progressTexte}>⚔️ {indexQ + 1} / {TOTAL_QUESTIONS} batailles</Text>

        {/* Labyrinthe visuel amélioré */}
        <View style={styles.labyrintheContainer}>
          <View style={styles.labyrintheHeader}>
            <Text style={styles.labyDecorActuel}>{decorActuel.emoji} {decorActuel.label}</Text>
            <Text style={styles.labyFleche}>→</Text>
            <Text style={styles.labyDecorSuivant}>{decorSuivant.emoji} {decorSuivant.label}</Text>
          </View>
          <View style={styles.labyChemin}>
            {Array.from({ length: LABYRINTHE_CASES }).map((_, i) => (
              <View key={i} style={[
                styles.labyCase,
                i < avatarPos && styles.labyCaseOuverte,
                i === avatarPos && styles.labyCaseCourante,
              ]}>
                {i < avatarPos && <Text style={styles.labyCaseTick}>✓</Text>}
              </View>
            ))}
            <Text style={styles.porteFinale}>🏰</Text>
          </View>
          <Animated.Text style={[styles.avatar, { transform: [{ translateX: avatarAnim }] }]}>
            🧒
          </Animated.Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <View style={styles.timerBarre}>
            <View style={[styles.timerFill, { width: `${(tempsRestant / 20) * 100}%`, backgroundColor: timerCouleur }]} />
          </View>
          <Text style={[styles.timerTexte, { color: timerCouleur }]}>⏱ {tempsRestant}s</Text>
        </View>

        {/* Question */}
        <Animated.View style={[styles.questionBox, { transform: [{ translateX: shakeAnim }, { scale: pulseAnim }] }]}>
          <View style={styles.questionHeader}>
            <Text style={styles.themeTag}>📜 {q.theme}</Text>
            <View style={styles.questionNumBadge}>
              <Text style={styles.questionNum}>{indexQ + 1}</Text>
            </View>
          </View>
          <Text style={styles.questionTexte}>{q.question}</Text>
        </Animated.View>

        {/* Réponses */}
        <View style={styles.reponsesGrid}>
          {reponses.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={couleurBouton(r.key)}
              onPress={() => !corrige && traiterReponse(r.key)}
              disabled={corrige}
            >
              <View style={styles.keyLabelContainer}>
                <Text style={styles.keyLabel}>{r.key}</Text>
              </View>
              <Text style={styles.reponseTexte}>{r.texte}</Text>
              {corrige && r.key === q.bonne_reponse && <Text style={styles.reponseIcon}>✓</Text>}
              {corrige && r.key === reponseChoisie && r.key !== q.bonne_reponse && <Text style={styles.reponseIcon}>✗</Text>}
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const QUESTIONS_FALLBACK = {
  1: [
    { id: 1, question: "Quelle est la capitale du Sénégal ?", reponse_a: "Thiès", reponse_b: "Dakar", reponse_c: "Ziguinchor", reponse_d: "Saint-Louis", bonne_reponse: "B", theme: "Culture générale" },
    { id: 2, question: "Comment dit-on 'merci' en wolof ?", reponse_a: "Waaw", reponse_b: "Mangi fi", reponse_c: "Jërëjëf", reponse_d: "Déedéet", bonne_reponse: "C", theme: "Langues locales" },
    { id: 3, question: "Combien de jours dans une semaine ?", reponse_a: "5", reponse_b: "6", reponse_c: "7", reponse_d: "8", bonne_reponse: "C", theme: "Culture générale" },
    { id: 4, question: "De quoi les plantes ont-elles besoin ?", reponse_a: "Sel", reponse_b: "Soleil et eau", reponse_c: "Sable", reponse_d: "Feu", bonne_reponse: "B", theme: "Sciences" },
    { id: 5, question: "Quel animal est le roi de la jungle ?", reponse_a: "L'éléphant", reponse_b: "Le lion", reponse_c: "Le tigre", reponse_d: "La girafe", bonne_reponse: "B", theme: "Culture générale" },
    { id: 6, question: "Comment dit-on 'oui' en wolof ?", reponse_a: "Déedéet", reponse_b: "Waaw", reponse_c: "Jërëjëf", reponse_d: "Naam", bonne_reponse: "B", theme: "Langues locales" },
    { id: 7, question: "Combien font 5 + 3 ?", reponse_a: "7", reponse_b: "8", reponse_c: "9", reponse_d: "10", bonne_reponse: "B", theme: "Mathématiques" },
    { id: 8, question: "Quel est le plus grand océan ?", reponse_a: "Atlantique", reponse_b: "Indien", reponse_c: "Arctique", reponse_d: "Pacifique", bonne_reponse: "D", theme: "Sciences" },
    { id: 9, question: "Combien de mois dans une année ?", reponse_a: "10", reponse_b: "11", reponse_c: "12", reponse_d: "13", bonne_reponse: "C", theme: "Culture générale" },
    { id: 10, question: "Comment dit-on 'eau' en wolof ?", reponse_a: "Ndox", reponse_b: "Ceeb", reponse_c: "Lekk", reponse_d: "Dem", bonne_reponse: "A", theme: "Langues locales" },
  ]
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16 },
  centrer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  chargementEmoji: { fontSize: 64, marginBottom: 16 },
  chargementTexte: { color: '#B8A86A', marginTop: 12, fontSize: 15, fontStyle: 'italic' },
  erreurTexte: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', lineHeight: 24 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  quitterBtn: { padding: 8 },
  quitter: { fontSize: 18, color: '#8A9A8A' },
  pseudoContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pseudoEmoji: { fontSize: 16 },
  pseudo: { fontSize: 15, fontWeight: '700', color: '#FFD700' },
  scoreBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: '#FFD70050',
  },
  scoreTexte: { fontSize: 14, fontWeight: '900', color: '#FFD700' },

  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 4 },
  progressFill: { height: 4, backgroundColor: '#FFD700', borderRadius: 2 },
  progressTexte: { fontSize: 11, color: '#8A9A8A', textAlign: 'right', marginBottom: 10 },

  labyrintheContainer: { marginBottom: 10, paddingHorizontal: 4 },
  labyrintheHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  labyDecorActuel: { fontSize: 12, color: '#B8A86A', fontWeight: '700' },
  labyFleche: { fontSize: 16, color: '#FFD700' },
  labyDecorSuivant: { fontSize: 12, color: '#8A9A8A' },

  labyChemin: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 4 },
  labyCase: {
    width: (width - 80) / 10, height: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  labyCaseOuverte: { backgroundColor: 'rgba(255,215,0,0.3)', borderColor: '#FFD70060' },
  labyCaseCourante: { backgroundColor: 'rgba(255,215,0,0.1)', borderColor: '#FFD700', borderWidth: 2 },
  labyCaseTick: { fontSize: 8, color: '#FFD700' },
  porteFinale: { fontSize: 20, marginLeft: 4 },
  avatar: { fontSize: 24, position: 'absolute', bottom: 0 },

  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  timerBarre: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  timerFill: { height: 6, borderRadius: 3 },
  timerTexte: { fontSize: 13, fontWeight: '700', minWidth: 44 },

  questionBox: {
    backgroundColor: 'rgba(255,215,0,0.06)',
    borderRadius: 20, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
    minHeight: 90, justifyContent: 'center',
  },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  themeTag: { fontSize: 11, color: '#B8A86A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  questionNumBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FFD70050',
  },
  questionNum: { fontSize: 11, fontWeight: '900', color: '#FFD700' },
  questionTexte: { fontSize: 16, color: '#FFFFFF', fontWeight: '700', lineHeight: 22 },

  reponsesGrid: { gap: 8 },
  btnReponse: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, padding: 12,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  btnCorrect: { backgroundColor: 'rgba(76,175,80,0.25)', borderColor: '#4CAF50' },
  btnFaux: { backgroundColor: 'rgba(244,67,54,0.25)', borderColor: '#F44336' },
  btnInactif: { opacity: 0.3 },
  keyLabelContainer: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderWidth: 1, borderColor: '#FFD70050',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  keyLabel: { color: '#FFD700', fontWeight: '900', fontSize: 13 },
  reponseTexte: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  reponseIcon: { fontSize: 18, marginLeft: 8 },

  btnRetour: { marginTop: 24, padding: 12 },
  btnRetourTexte: { color: '#FFD700', fontSize: 16, fontWeight: '700' },
});

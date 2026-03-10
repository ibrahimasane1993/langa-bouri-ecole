import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getQuestions } from '../supabase';

const { width } = Dimensions.get('window');
const TOTAL_QUESTIONS = 10;

// Position avatar dans le labyrinthe (0 à 10 cases)
const LABYRINTHE_CASES = 10;

export default function EcranJeu({ naviguer, niveau, pseudo }) {
  const [questions, setQuestions] = useState([]);
  const [indexQ, setIndexQ] = useState(0);
  const [score, setScore] = useState(0);
  const [reponseChoisie, setReponseChoisie] = useState(null);
  const [corrige, setCorrige] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [tempsRestant, setTempsRestant] = useState(20);
  const [avatarPos, setAvatarPos] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    chargerQuestions();
  }, []);

  useEffect(() => {
    if (!chargement && !corrige) {
      demarrerTimer();
    }
    return () => clearInterval(timerRef.current);
  }, [indexQ, chargement, corrige]);

  const chargerQuestions = async () => {
    try {
      const data = await getQuestions(niveau);
      setQuestions(data.slice(0, TOTAL_QUESTIONS));
    } catch (e) {
      // Fallback questions si pas de connexion
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
          // Temps écoulé = mauvaise réponse
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
    const bonne = q.bonne_reponse;
    const correct = reponse === bonne;

    if (correct) {
      const newScore = score + 10;
      setScore(newScore);
      const newPos = Math.min(avatarPos + 1, LABYRINTHE_CASES);
      setAvatarPos(newPos);
      Animated.timing(avatarAnim, {
        toValue: newPos * ((width - 80) / LABYRINTHE_CASES),
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      if (indexQ + 1 >= TOTAL_QUESTIONS) {
        // Fin du jeu
        naviguer('resultat', {
          resultat: { score: correct ? score + 10 : score, total: TOTAL_QUESTIONS * 10, correct: correct ? score / 10 + 1 : score / 10 }
        });
      } else {
        setIndexQ(prev => prev + 1);
        setReponseChoisie(null);
        setCorrige(false);
      }
    }, 1500);
  };

  if (chargement) {
    return (
      <LinearGradient colors={['#0D5C2A', '#1A7A3A']} style={styles.container}>
        <View style={styles.centrer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.chargementTexte}>Chargement des questions...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (questions.length === 0) {
    return (
      <LinearGradient colors={['#0D5C2A', '#1A7A3A']} style={styles.container}>
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

  return (
    <LinearGradient colors={['#0D5C2A', '#1A7A3A', '#2E9B50']} style={styles.container}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => naviguer('accueil')}>
            <Text style={styles.quitter}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.pseudo}>👤 {pseudo}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreTexte}>⭐ {score}</Text>
          </View>
        </View>

        {/* Barre de progression */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((indexQ) / TOTAL_QUESTIONS) * 100}%` }]} />
        </View>
        <Text style={styles.progressTexte}>Question {indexQ + 1} / {TOTAL_QUESTIONS}</Text>

        {/* Labyrinthe visuel */}
        <View style={styles.labyrinthe}>
          <View style={styles.labyChemin}>
            {Array.from({ length: LABYRINTHE_CASES }).map((_, i) => (
              <View key={i} style={[styles.labyCase, i < avatarPos && styles.labyCaseOuverte]} />
            ))}
            <Text style={styles.porte}>🚪</Text>
          </View>
          <Animated.Text style={[styles.avatar, { transform: [{ translateX: avatarAnim }] }]}>🧒</Animated.Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <View style={[styles.timerBarre, { backgroundColor: '#1A5C2A' }]}>
            <View style={[styles.timerFill, { width: `${(tempsRestant / 20) * 100}%`, backgroundColor: timerCouleur }]} />
          </View>
          <Text style={[styles.timerTexte, { color: timerCouleur }]}>⏱ {tempsRestant}s</Text>
        </View>

        {/* Question */}
        <Animated.View style={[styles.questionBox, { transform: [{ translateX: shakeAnim }] }]}>
          <Text style={styles.themeTag}>{q.theme}</Text>
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
              <Text style={styles.keyLabel}>{r.key}</Text>
              <Text style={styles.reponseTexte}>{r.texte}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

// Questions de secours si pas de connexion
const QUESTIONS_FALLBACK = {
  1: [
    { id: 1, question: "Quelle est la capitale du Sénégal ?", reponse_a: "Thiès", reponse_b: "Dakar", reponse_c: "Ziguinchor", reponse_d: "Saint-Louis", bonne_reponse: "B", theme: "Culture générale" },
    { id: 2, question: "Comment dit-on 'merci' en wolof ?", reponse_a: "Waaw", reponse_b: "Mangi fi", reponse_c: "Jërëjëf", reponse_d: "Déedéet", bonne_reponse: "C", theme: "Langues locales" },
    { id: 3, question: "Combien de jours dans une semaine ?", reponse_a: "5", reponse_b: "6", reponse_c: "7", reponse_d: "8", bonne_reponse: "C", theme: "Culture générale" },
    { id: 4, question: "De quoi les plantes ont-elles besoin ?", reponse_a: "Sel", reponse_b: "Soleil et eau", reponse_c: "Sable", reponse_d: "Feu", bonne_reponse: "B", theme: "Sciences" },
    { id: 5, question: "Quel animal est le roi de la jungle ?", reponse_a: "L'éléphant", reponse_b: "Le lion", reponse_c: "Le tigre", reponse_d: "La girafe", bonne_reponse: "B", theme: "Culture générale" },
    { id: 6, question: "Comment dit-on 'oui' en wolof ?", reponse_a: "Déedéet", reponse_b: "Waaw", reponse_c: "Jërëjëf", reponse_d: "Naam", bonne_reponse: "B", theme: "Langues locales" },
    { id: 7, question: "Combien font 5 + 3 ?", reponse_a: "7", reponse_b: "8", reponse_c: "9", reponse_d: "10", bonne_reponse: "B", theme: "Culture générale" },
    { id: 8, question: "Quel est le plus grand océan ?", reponse_a: "Atlantique", reponse_b: "Indien", reponse_c: "Arctique", reponse_d: "Pacifique", bonne_reponse: "D", theme: "Sciences" },
    { id: 9, question: "Combien de mois dans une année ?", reponse_a: "10", reponse_b: "11", reponse_c: "12", reponse_d: "13", bonne_reponse: "C", theme: "Culture générale" },
    { id: 10, question: "Comment dit-on 'eau' en wolof ?", reponse_a: "Ndox", reponse_b: "Ceeb", reponse_c: "Lekk", reponse_d: "Dem", bonne_reponse: "A", theme: "Langues locales" },
  ]
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16 },
  centrer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  quitter: { fontSize: 20, color: '#B8EBBF', padding: 8 },
  pseudo: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  scoreBadge: { backgroundColor: '#FFD700', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  scoreTexte: { fontSize: 14, fontWeight: '900', color: '#0D5C2A' },

  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: '#FFD700', borderRadius: 3 },
  progressTexte: { fontSize: 12, color: '#B8EBBF', textAlign: 'right', marginBottom: 12 },

  labyrinthe: { marginBottom: 12, paddingHorizontal: 8 },
  labyChemin: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  labyCase: { width: (width - 80) / 10, height: 18, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3 },
  labyCaseOuverte: { backgroundColor: '#FFD700' },
  porte: { fontSize: 20, marginLeft: 4 },
  avatar: { fontSize: 26, position: 'absolute', bottom: 0 },

  timerContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  timerBarre: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  timerFill: { height: 8, borderRadius: 4 },
  timerTexte: { fontSize: 13, fontWeight: '700', minWidth: 40 },

  questionBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    minHeight: 100,
    justifyContent: 'center',
  },
  themeTag: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  questionTexte: { fontSize: 17, color: '#FFFFFF', fontWeight: '700', lineHeight: 24 },

  reponsesGrid: { gap: 10 },
  btnReponse: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  btnCorrect: { backgroundColor: '#2E7D32', borderColor: '#4CAF50' },
  btnFaux: { backgroundColor: '#B71C1C', borderColor: '#F44336' },
  btnInactif: { opacity: 0.4 },
  keyLabel: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    textAlign: 'center', lineHeight: 28,
    color: '#FFD700', fontWeight: '900',
    marginRight: 12, fontSize: 13,
  },
  reponseTexte: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600', lineHeight: 20 },

  chargementTexte: { color: '#B8EBBF', marginTop: 16, fontSize: 15 },
  erreurTexte: { color: '#FFFFFF', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  btnRetour: { marginTop: 24, padding: 12 },
  btnRetourTexte: { color: '#FFD700', fontSize: 16, fontWeight: '700' },
});

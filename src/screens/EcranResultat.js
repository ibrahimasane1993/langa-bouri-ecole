import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sauvegarderScore } from '../supabase';

const { width } = Dimensions.get('window');

export default function EcranResultat({ naviguer, resultat, pseudo, niveau }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { score, total, correct } = resultat;
  const pourcentage = Math.round((score / total) * 100);

  const mention = () => {
    if (pourcentage >= 90) return { emoji: '🏆', texte: 'Excellent !', couleur: '#FFD700' };
    if (pourcentage >= 70) return { emoji: '⭐', texte: 'Très bien !', couleur: '#4CAF50' };
    if (pourcentage >= 50) return { emoji: '👍', texte: 'Bien !', couleur: '#2196F3' };
    return { emoji: '💪', texte: 'Continue !', couleur: '#FF9800' };
  };

  const m = mention();

  useEffect(() => {
    sauvegarderScore(pseudo, score, niveau);

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#0D5C2A', '#1A7A3A', '#2E9B50']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.contenu, { opacity: fadeAnim }]}>

          {/* Trophée animé */}
          <Animated.Text style={[styles.trophee, { transform: [{ scale: scaleAnim }] }]}>
            {m.emoji}
          </Animated.Text>

          <Text style={[styles.mention, { color: m.couleur }]}>{m.texte}</Text>
          <Text style={styles.pseudo}>{pseudo}</Text>

          {/* Score card */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreRond}>
              <Text style={styles.scoreGrand}>{score}</Text>
              <Text style={styles.scoreSur}>/ {total} pts</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>✅ {correct}</Text>
                <Text style={styles.statLabel}>Bonnes</Text>
              </View>
              <View style={styles.separateur} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>❌ {10 - correct}</Text>
                <Text style={styles.statLabel}>Fausses</Text>
              </View>
              <View style={styles.separateur} />
              <View style={styles.statItem}>
                <Text style={styles.statVal}>🎯 {pourcentage}%</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
            </View>
          </View>

          {/* Niveau suivant ? */}
          {pourcentage >= 70 && niveau < 4 && (
            <View style={styles.debloqueBadge}>
              <Text style={styles.debloqueTexte}>🔓 Niveau {niveau + 1} débloqué !</Text>
            </View>
          )}

          {/* Boutons */}
          <TouchableOpacity
            style={styles.btnPrimaire}
            onPress={() => naviguer('jeu', { niveau, pseudo })}
          >
            <Text style={styles.btnPrimaireTexte}>🔄 Rejouer</Text>
          </TouchableOpacity>

          {pourcentage >= 70 && niveau < 4 && (
            <TouchableOpacity
              style={styles.btnSuivant}
              onPress={() => naviguer('jeu', { niveau: niveau + 1, pseudo })}
            >
              <Text style={styles.btnSuivantTexte}>➡️ Niveau suivant</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btnSecondaire} onPress={() => naviguer('classement')}>
            <Text style={styles.btnSecondaireTexte}>🏆 Classement</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnRetour} onPress={() => naviguer('accueil')}>
            <Text style={styles.btnRetourTexte}>🏠 Accueil</Text>
          </TouchableOpacity>

        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  contenu: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  trophee: { fontSize: 80, marginBottom: 8 },
  mention: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  pseudo: { fontSize: 18, color: '#B8EBBF', marginBottom: 24, fontStyle: 'italic' },

  scoreCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreRond: { alignItems: 'center', marginBottom: 20 },
  scoreGrand: { fontSize: 64, fontWeight: '900', color: '#FFD700' },
  scoreSur: { fontSize: 16, color: '#B8EBBF', marginTop: -8 },

  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: '#B8EBBF', marginTop: 2 },
  separateur: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },

  debloqueBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
  },
  debloqueTexte: { fontSize: 14, fontWeight: '900', color: '#0D5C2A' },

  btnPrimaire: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaireTexte: { fontSize: 16, fontWeight: '900', color: '#0D5C2A' },

  btnSuivant: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnSuivantTexte: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },

  btnSecondaire: {
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnSecondaireTexte: { fontSize: 15, fontWeight: '700', color: '#FFD700' },

  btnRetour: { padding: 12 },
  btnRetourTexte: { color: '#B8EBBF', fontSize: 15 },
});

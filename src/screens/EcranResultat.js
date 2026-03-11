import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sauvegarderScore } from '../supabase';

const { width } = Dimensions.get('window');

export default function EcranResultat({ naviguer, resultat, pseudo, niveau }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const couronneBounce = useRef(new Animated.Value(0)).current;
  const brillance = useRef(new Animated.Value(0)).current;

  const { score, total, correct } = resultat;
  const pourcentage = Math.round((score / total) * 100);
  const couronneConquise = pourcentage >= 70;

  const mention = () => {
    if (pourcentage >= 90) return { emoji: '👑', texte: 'La Couronne est à toi !', couleur: '#FFD700', sous: 'Tu règnes sur le royaume !' };
    if (pourcentage >= 70) return { emoji: '🏆', texte: 'Victoire Royale !', couleur: '#4CAF50', sous: 'Tu as conquis le château !' };
    if (pourcentage >= 50) return { emoji: '⚔️', texte: 'Brave Chevalier !', couleur: '#2196F3', sous: 'Continue ta quête !' };
    return { emoji: '🛡️', texte: 'Reprends les armes !', couleur: '#FF9800', sous: 'Le château résiste encore...' };
  };

  const m = mention();

  useEffect(() => {
    sauvegarderScore(pseudo, score, niveau);

    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    if (couronneConquise) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(couronneBounce, { toValue: -15, duration: 600, useNativeDriver: true }),
          Animated.timing(couronneBounce, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(brillance, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(brillance, { toValue: 0, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  return (
    <LinearGradient colors={['#0A0A1A', '#1A1A3E', '#0D2B0D']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.contenu, { opacity: fadeAnim }]}>

          {/* Couronne animée si victoire */}
          {couronneConquise && (
            <Animated.Text style={[styles.couronneBig, { transform: [{ translateY: couronneBounce }] }]}>
              👑
            </Animated.Text>
          )}

          {/* Trophée principal */}
          <Animated.Text style={[styles.trophee, { transform: [{ scale: scaleAnim }] }]}>
            {m.emoji}
          </Animated.Text>

          <Text style={[styles.mention, { color: m.couleur }]}>{m.texte}</Text>
          <Text style={styles.sousMention}>{m.sous}</Text>
          <Text style={styles.pseudo}>— {pseudo} —</Text>

          {/* Score card style parchemin */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreCardDecor}>
              <Text style={styles.scoreCardDecorText}>⚜️ Résultat ⚜️</Text>
            </View>
            <View style={styles.scoreRond}>
              <Text style={styles.scoreGrand}>{score}</Text>
              <Text style={styles.scoreSur}>/ {total} pts</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>⚔️</Text>
                <Text style={styles.statVal}>{correct}</Text>
                <Text style={styles.statLabel}>Victoires</Text>
              </View>
              <View style={styles.separateur} />
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>🛡️</Text>
                <Text style={styles.statVal}>{10 - correct}</Text>
                <Text style={styles.statLabel}>Défaites</Text>
              </View>
              <View style={styles.separateur} />
              <View style={styles.statItem}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.statVal}>{pourcentage}%</Text>
                <Text style={styles.statLabel}>Précision</Text>
              </View>
            </View>
          </View>

          {/* Badge niveau débloqué */}
          {pourcentage >= 70 && niveau < 4 && (
            <View style={styles.debloqueBadge}>
              <Text style={styles.debloqueTexte}>🔓 Niveau {niveau + 1} débloqué !</Text>
            </View>
          )}

          {/* Boutons */}
          <TouchableOpacity style={styles.btnRoyal} onPress={() => naviguer('jeu', { niveau, pseudo })}>
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.btnGradient}>
              <Text style={styles.btnRoyalTexte}>🔄 Rejouer la bataille</Text>
            </LinearGradient>
          </TouchableOpacity>

          {pourcentage >= 70 && niveau < 4 && (
            <TouchableOpacity style={styles.btnSuivant} onPress={() => naviguer('jeu', { niveau: niveau + 1, pseudo })}>
              <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.btnGradient}>
                <Text style={styles.btnRoyalTexte}>🏰 Niveau suivant →</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.btnSecondaire} onPress={() => naviguer('classement')}>
            <Text style={styles.btnSecondaireTexte}>🏆 Hall des Champions</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnRetour} onPress={() => naviguer('accueil')}>
            <Text style={styles.btnRetourTexte}>🏰 Retour au château</Text>
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

  couronneBig: { fontSize: 48, marginBottom: -10 },
  trophee: { fontSize: 72, marginBottom: 8 },
  mention: { fontSize: 28, fontWeight: '900', marginBottom: 4, textAlign: 'center' },
  sousMention: { fontSize: 14, color: '#8A9A8A', marginBottom: 4, fontStyle: 'italic' },
  pseudo: { fontSize: 16, color: '#B8A86A', marginBottom: 20, letterSpacing: 2 },

  scoreCard: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 20, padding: 20, width: '100%',
    alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
  },
  scoreCardDecor: { marginBottom: 12 },
  scoreCardDecorText: { color: '#B8A86A', fontSize: 12, letterSpacing: 2 },
  scoreRond: { alignItems: 'center', marginBottom: 16 },
  scoreGrand: { fontSize: 60, fontWeight: '900', color: '#FFD700' },
  scoreSur: { fontSize: 14, color: '#8A9A8A', marginTop: -8 },

  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statVal: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  statLabel: { fontSize: 11, color: '#8A9A8A', marginTop: 2 },
  separateur: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.1)' },

  debloqueBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 16,
    borderWidth: 1, borderColor: '#FFD70050',
  },
  debloqueTexte: { fontSize: 14, fontWeight: '900', color: '#FFD700' },

  btnRoyal: { width: '100%', marginBottom: 10, borderRadius: 16, overflow: 'hidden', elevation: 8 },
  btnSuivant: { width: '100%', marginBottom: 10, borderRadius: 16, overflow: 'hidden', elevation: 8 },
  btnGradient: { paddingVertical: 14, alignItems: 'center', borderRadius: 16 },
  btnRoyalTexte: { fontSize: 16, fontWeight: '900', color: '#1A0A00' },

  btnSecondaire: {
    borderWidth: 2, borderColor: '#FFD700', borderRadius: 16,
    paddingVertical: 12, width: '100%', alignItems: 'center', marginBottom: 8,
  },
  btnSecondaireTexte: { fontSize: 15, fontWeight: '700', color: '#FFD700' },

  btnRetour: { padding: 12 },
  btnRetourTexte: { color: '#8A9A8A', fontSize: 14 },
});

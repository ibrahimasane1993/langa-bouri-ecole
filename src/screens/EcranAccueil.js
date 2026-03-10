import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  Animated, Dimensions, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const NIVEAUX = [
  { id: 1, label: 'Niveau 1', sous: 'Primaire', emoji: '🌱', couleur: '#4CAF50', themes: 'Culture générale' },
  { id: 2, label: 'Niveau 2', sous: 'Collège', emoji: '📚', couleur: '#2196F3', themes: 'Histoire de l\'Afrique' },
  { id: 3, label: 'Niveau 3', sous: 'Lycée', emoji: '🔬', couleur: '#9C27B0', themes: 'Sciences avancées' },
  { id: 4, label: 'Niveau 4', sous: 'Expert', emoji: '🏆', couleur: '#FF9800', themes: 'Mélange des thèmes' },
];

export default function EcranAccueil({ naviguer }) {
  const [pseudo, setPseudo] = useState('');
  const [niveauChoisi, setNiveauChoisi] = useState(null);
  const [etape, setEtape] = useState('accueil'); // accueil | choix_niveau | saisie_pseudo

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Bounce animation sur le logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const demarrer = () => {
    if (!pseudo.trim()) return;
    naviguer('jeu', { niveau: niveauChoisi, pseudo: pseudo.trim() });
  };

  if (etape === 'accueil') {
    return (
      <LinearGradient colors={['#0D5C2A', '#1A7A3A', '#2E9B50']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Logo / Titre */}
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <Text style={styles.emojiLogo}>🏛️</Text>
            </Animated.View>
            <Text style={styles.titre}>Langa bouri</Text>
            <Text style={styles.titreAccent}>Ecole</Text>
            <Text style={styles.sousTitre}>Le jeu éducatif sénégalais</Text>

            {/* Décorations */}
            <View style={styles.decoRow}>
              <Text style={styles.deco}>🌍</Text>
              <Text style={styles.deco}>📖</Text>
              <Text style={styles.deco}>⭐</Text>
              <Text style={styles.deco}>🎯</Text>
            </View>

            {/* Description */}
            <View style={styles.descBox}>
              <Text style={styles.descText}>
                Avance dans le labyrinthe en répondant aux questions.{'\n'}
                Plus tu avances, plus c'est difficile !
              </Text>
            </View>

            {/* Boutons */}
            <TouchableOpacity style={styles.btnPrimaire} onPress={() => setEtape('choix_niveau')}>
              <Text style={styles.btnPrimaireTexte}>🎮 Jouer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondaire} onPress={() => naviguer('classement')}>
              <Text style={styles.btnSecondaireTexte}>🏆 Classement</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (etape === 'choix_niveau') {
    return (
      <LinearGradient colors={['#0D5C2A', '#1A7A3A', '#2E9B50']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.titrePage}>Choisis ton niveau</Text>
            {NIVEAUX.map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.carteNiveau, niveauChoisi === n.id && styles.carteNiveauActive, { borderColor: n.couleur }]}
                onPress={() => setNiveauChoisi(n.id)}
              >
                <Text style={styles.niveauEmoji}>{n.emoji}</Text>
                <View style={styles.niveauInfo}>
                  <Text style={styles.niveauLabel}>{n.label} — {n.sous}</Text>
                  <Text style={styles.niveauTheme}>{n.themes}</Text>
                </View>
                {niveauChoisi === n.id && <Text style={styles.check}>✅</Text>}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.btnPrimaire, !niveauChoisi && styles.btnDisabled]}
              onPress={() => niveauChoisi && setEtape('saisie_pseudo')}
            >
              <Text style={styles.btnPrimaireTexte}>Continuer →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnRetour} onPress={() => setEtape('accueil')}>
              <Text style={styles.btnRetourTexte}>← Retour</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (etape === 'saisie_pseudo') {
    return (
      <LinearGradient colors={['#0D5C2A', '#1A7A3A', '#2E9B50']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.safe}>
            <View style={styles.centreForm}>
              <Text style={styles.emojiLogo}>✏️</Text>
              <Text style={styles.titrePage}>Ton prénom</Text>
              <Text style={styles.sousTitrePage}>Pour apparaître dans le classement</Text>

              <TextInput
                style={styles.input}
                placeholder="Tape ton prénom ici..."
                placeholderTextColor="#A5D6B0"
                value={pseudo}
                onChangeText={setPseudo}
                maxLength={20}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.btnPrimaire, !pseudo.trim() && styles.btnDisabled]}
                onPress={demarrer}
              >
                <Text style={styles.btnPrimaireTexte}>🚀 C'est parti !</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnRetour} onPress={() => setEtape('choix_niveau')}>
                <Text style={styles.btnRetourTexte}>← Retour</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  centreForm: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  emojiLogo: { fontSize: 72, marginBottom: 8 },
  titre: { fontSize: 42, fontWeight: '900', color: '#FFFFFF', letterSpacing: 1 },
  titreAccent: { fontSize: 42, fontWeight: '900', color: '#FFD700', letterSpacing: 1, marginBottom: 8 },
  sousTitre: { fontSize: 16, color: '#B8EBBF', marginBottom: 24, fontStyle: 'italic' },
  titrePage: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  sousTitrePage: { fontSize: 14, color: '#B8EBBF', marginBottom: 24, textAlign: 'center' },

  decoRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  deco: { fontSize: 28 },

  descBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
    width: '100%',
  },
  descText: { color: '#E8F5ED', fontSize: 15, textAlign: 'center', lineHeight: 22 },

  btnPrimaire: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  btnPrimaireTexte: { fontSize: 18, fontWeight: '900', color: '#0D5C2A' },
  btnDisabled: { opacity: 0.4 },

  btnSecondaire: {
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  btnSecondaireTexte: { fontSize: 16, fontWeight: '700', color: '#FFD700' },

  btnRetour: { marginTop: 8, padding: 12 },
  btnRetourTexte: { color: '#B8EBBF', fontSize: 15 },

  carteNiveau: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  carteNiveauActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  niveauEmoji: { fontSize: 36, marginRight: 16 },
  niveauInfo: { flex: 1 },
  niveauLabel: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  niveauTheme: { fontSize: 13, color: '#B8EBBF', marginTop: 2 },
  check: { fontSize: 24 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    color: '#FFFFFF',
    width: '100%',
    marginBottom: 24,
    textAlign: 'center',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, StyleSheet,
  Animated, Dimensions, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const NIVEAUX = [
  { id: 1, label: 'Sentier du Village', sous: 'Primaire', emoji: '🌿', couleur: '#4CAF50', themes: 'Culture générale' },
  { id: 2, label: 'Forêt Mystérieuse', sous: 'Collège', emoji: '🌲', couleur: '#2196F3', themes: "Histoire de l'Afrique" },
  { id: 3, label: 'Tour du Gardien', sous: 'Lycée', emoji: '🗼', couleur: '#9C27B0', themes: 'Sciences avancées' },
  { id: 4, label: 'Salle du Trône', sous: 'Expert', emoji: '👑', couleur: '#FF9800', themes: 'Conquérir la couronne !' },
];

export default function EcranAccueil({ naviguer }) {
  const [pseudo, setPseudo] = useState('');
  const [niveauChoisi, setNiveauChoisi] = useState(null);
  const [etape, setEtape] = useState('accueil');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const chateauAnim = useRef(new Animated.Value(0.8)).current;
  const torche1 = useRef(new Animated.Value(1)).current;
  const torche2 = useRef(new Animated.Value(0.5)).current;
  const flagAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      Animated.spring(chateauAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(torche1, { toValue: 0.6, duration: 400, useNativeDriver: true }),
        Animated.timing(torche1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(torche1, { toValue: 0.8, duration: 200, useNativeDriver: true }),
        Animated.timing(torche1, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(torche2, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(torche2, { toValue: 0.5, duration: 450, useNativeDriver: true }),
        Animated.timing(torche2, { toValue: 0.9, duration: 200, useNativeDriver: true }),
        Animated.timing(torche2, { toValue: 0.5, duration: 300, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flagAnim, { toValue: 5, duration: 800, useNativeDriver: true }),
        Animated.timing(flagAnim, { toValue: -5, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (etape === 'accueil') {
    return (
      <LinearGradient colors={['#0A0A1A', '#1A1A3E', '#0D2B0D']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Animated.ScrollView
            contentContainerStyle={styles.scrollContent}
            style={{ opacity: fadeAnim }}
            showsVerticalScrollIndicator={false}
          >
            {/* Ciel nocturne */}
            <View style={styles.cielEtoile}>
              <Text style={styles.etoile1}>✦</Text>
              <Text style={styles.etoile2}>✦</Text>
              <Text style={styles.etoile3}>✦</Text>
              <Text style={styles.etoile4}>✦</Text>
              <Text style={styles.lune}>🌙</Text>
            </View>

            {/* Château */}
            <Animated.View style={[styles.chateauContainer, { transform: [{ scale: chateauAnim }] }]}>
              <View style={styles.drapeauxRow}>
                <Animated.Text style={[styles.drapeau, { transform: [{ translateX: flagAnim }] }]}>🚩</Animated.Text>
                <Animated.Text style={[styles.drapeauCentre, { transform: [{ translateX: flagAnim }] }]}>👑</Animated.Text>
                <Animated.Text style={[styles.drapeau, { transform: [{ translateX: flagAnim }] }]}>🚩</Animated.Text>
              </View>

              <View style={styles.chateau}>
                <View style={styles.creneaux}>
                  {[...Array(7)].map((_, i) => (
                    <View key={i} style={[styles.creneau, i % 2 === 0 ? styles.creneauHaut : styles.creneauBas]} />
                  ))}
                </View>
                <View style={styles.murPrincipal}>
                  <View style={styles.fenetresRow}>
                    <View style={styles.fenetre}><Text style={styles.fenetreLueur}>✨</Text></View>
                    <View style={styles.fenetreArc}><Text style={styles.fenetreLueur}>🌟</Text></View>
                    <View style={styles.fenetre}><Text style={styles.fenetreLueur}>✨</Text></View>
                  </View>
                  <View style={styles.torchesRow}>
                    <Animated.Text style={[styles.torche, { opacity: torche1 }]}>🔥</Animated.Text>
                    <Animated.Text style={[styles.torche, { opacity: torche2 }]}>🔥</Animated.Text>
                  </View>
                  <View style={styles.porteContainer}>
                    <View style={styles.porteArc}>
                      <Text style={styles.porteEmoji}>🚪</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.pont}>
                  <View style={styles.pontArche} />
                </View>
              </View>
            </Animated.View>

            {/* Titre */}
            <Animated.View style={[styles.titreContainer, { transform: [{ translateY: slideAnim }] }]}>
              <Text style={styles.titreEcole}>LANGA BOURI</Text>
              <View style={styles.titreSeparateur}>
                <View style={styles.titreLigne} />
                <Text style={styles.titreEcoleAccent}>ÉCOLE</Text>
                <View style={styles.titreLigne} />
              </View>
              <Text style={styles.sousTitre}>⚔️ Conquiers la couronne royale ⚔️</Text>
            </Animated.View>

            {/* Description */}
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionTitre}>🗺️ La Quête</Text>
              <Text style={styles.descriptionTexte}>
                Traverse le labyrinthe en répondant aux questions.{'\n'}
                Atteins la Salle du Trône et empare-toi de la couronne !
              </Text>
              <View style={styles.cheminVisuel}>
                <Text style={styles.cheminEmoji}>🏘️</Text>
                <Text style={styles.cheminFlech}>→→</Text>
                <Text style={styles.cheminEmoji}>🌲</Text>
                <Text style={styles.cheminFlech}>→→</Text>
                <Text style={styles.cheminEmoji}>🏰</Text>
                <Text style={styles.cheminFlech}>→→</Text>
                <Text style={styles.cheminEmoji}>👑</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.btnRoyal} onPress={() => setEtape('choix_niveau')}>
              <LinearGradient colors={['#FFD700', '#FFA500', '#FF8C00']} style={styles.btnGradient}>
                <Text style={styles.btnRoyalTexte}>⚔️ Partir en Quête</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondaire} onPress={() => naviguer('classement')}>
              <Text style={styles.btnSecondaireTexte}>🏆 Hall des Champions</Text>
            </TouchableOpacity>

            <Text style={styles.decorSolTexte}>— 🌿 ⚜️ 🌿 —</Text>
          </Animated.ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (etape === 'choix_niveau') {
    return (
      <LinearGradient colors={['#0A0A1A', '#1A1A3E', '#0D2B0D']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scrollChoix} showsVerticalScrollIndicator={false}>
            <View style={styles.enTeteChoix}>
              <Text style={styles.enTeteEmoji}>🗺️</Text>
              <Text style={styles.enTeteTitre}>Choisis ton chemin</Text>
              <Text style={styles.enTeteSous}>Chaque chemin mène au château</Text>
            </View>

            <View style={styles.parchemin}>
              {NIVEAUX.map((n, index) => (
                <View key={n.id}>
                  <TouchableOpacity
                    style={[styles.carteNiveau, niveauChoisi === n.id && styles.carteNiveauActive, { borderColor: n.couleur }]}
                    onPress={() => setNiveauChoisi(n.id)}
                  >
                    <View style={[styles.niveauIcone, { backgroundColor: n.couleur + '30', borderColor: n.couleur }]}>
                      <Text style={styles.niveauEmoji}>{n.emoji}</Text>
                    </View>
                    <View style={styles.niveauInfo}>
                      <Text style={styles.niveauLabel}>{n.label}</Text>
                      <Text style={styles.niveauSous}>{n.sous}</Text>
                      <Text style={styles.niveauTheme}>{n.themes}</Text>
                    </View>
                    {niveauChoisi === n.id && (
                      <View style={styles.niveauCheck}>
                        <Text style={styles.niveauCheckTexte}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {index < NIVEAUX.length - 1 && <Text style={styles.cheminConnecteur}>↓</Text>}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.btnRoyal, !niveauChoisi && styles.btnDisabled]}
              onPress={() => niveauChoisi && setEtape('saisie_pseudo')}
            >
              <LinearGradient colors={niveauChoisi ? ['#FFD700', '#FFA500'] : ['#555', '#444']} style={styles.btnGradient}>
                <Text style={styles.btnRoyalTexte}>Continuer →</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnRetour} onPress={() => setEtape('accueil')}>
              <Text style={styles.btnRetourTexte}>← Retour au château</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (etape === 'saisie_pseudo') {
    return (
      <LinearGradient colors={['#0A0A1A', '#1A1A3E', '#0D2B0D']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.safe}>
            <View style={styles.centreForm}>
              <Text style={styles.parchemin2Emoji}>📜</Text>
              <Text style={styles.parchemin2Titre}>Inscris ton nom</Text>
              <Text style={styles.parchemin2Sous}>dans le Grand Livre du Royaume</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputDecor}>⚜️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ton nom de chevalier..."
                  placeholderTextColor="#8A9A8A"
                  value={pseudo}
                  onChangeText={setPseudo}
                  maxLength={20}
                  autoFocus
                />
                <Text style={styles.inputDecor}>⚜️</Text>
              </View>
              <TouchableOpacity
                style={[styles.btnRoyal, !pseudo.trim() && styles.btnDisabled]}
                onPress={() => {
                  if (!pseudo.trim()) return;
                  naviguer('jeu', { niveau: niveauChoisi, pseudo: pseudo.trim() });
                }}
              >
                <LinearGradient colors={pseudo.trim() ? ['#FFD700', '#FFA500'] : ['#555', '#444']} style={styles.btnGradient}>
                  <Text style={styles.btnRoyalTexte}>🏰 Entrer dans le château !</Text>
                </LinearGradient>
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
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 40 },
  scrollChoix: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 24 },
  centreForm: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },

  cielEtoile: { width: '100%', height: 60, position: 'relative', marginTop: 8 },
  etoile1: { position: 'absolute', top: 10, left: 20, fontSize: 14, color: '#FFD700', opacity: 0.6 },
  etoile2: { position: 'absolute', top: 30, left: 80, fontSize: 10, color: '#FFD700', opacity: 0.4 },
  etoile3: { position: 'absolute', top: 15, right: 40, fontSize: 14, color: '#FFD700', opacity: 0.6 },
  etoile4: { position: 'absolute', top: 5, right: 120, fontSize: 10, color: '#FFD700', opacity: 0.4 },
  lune: { position: 'absolute', top: 5, right: 30, fontSize: 28 },

  chateauContainer: { alignItems: 'center', marginTop: -10, marginBottom: 8 },
  drapeauxRow: { flexDirection: 'row', justifyContent: 'space-between', width: 200, marginBottom: 2 },
  drapeau: { fontSize: 20 },
  drapeauCentre: { fontSize: 24 },

  chateau: { alignItems: 'center' },
  creneaux: { flexDirection: 'row', width: 220 },
  creneau: { flex: 1, marginHorizontal: 1, borderRadius: 2, backgroundColor: '#3A2A1A' },
  creneauHaut: { height: 20 },
  creneauBas: { height: 12, marginTop: 8 },

  murPrincipal: {
    width: 220, backgroundColor: '#2A1F10',
    borderWidth: 2, borderColor: '#5A4A2A',
    alignItems: 'center', paddingVertical: 8, borderRadius: 4,
  },
  fenetresRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  fenetre: {
    width: 32, height: 40, backgroundColor: '#1A0A00',
    borderRadius: 4, borderWidth: 2, borderColor: '#8B6914',
    alignItems: 'center', justifyContent: 'center',
  },
  fenetreArc: {
    width: 40, height: 48, backgroundColor: '#1A0A00',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 2, borderColor: '#FFD700',
    alignItems: 'center', justifyContent: 'center',
  },
  fenetreLueur: { fontSize: 12 },
  torchesRow: { flexDirection: 'row', justifyContent: 'space-between', width: 160, marginBottom: 8 },
  torche: { fontSize: 20 },
  porteContainer: { alignItems: 'center' },
  porteArc: {
    width: 56, height: 70, backgroundColor: '#0A0500',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 3, borderColor: '#8B6914',
    alignItems: 'center', justifyContent: 'center',
  },
  porteEmoji: { fontSize: 28 },
  pont: {
    width: 180, height: 20, backgroundColor: '#3A2A1A',
    borderRadius: 4, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#5A4A2A',
  },
  pontArche: {
    width: 50, height: 14, borderTopLeftRadius: 25, borderTopRightRadius: 25,
    backgroundColor: '#2A1F10', borderWidth: 1, borderColor: '#5A4A2A',
  },

  titreContainer: { alignItems: 'center', marginBottom: 16, marginTop: 8 },
  titreEcole: {
    fontSize: 36, fontWeight: '900', color: '#FFD700', letterSpacing: 4,
    textShadowColor: '#FF8C00', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  titreSeparateur: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  titreLigne: { flex: 1, height: 1, backgroundColor: '#FFD70060' },
  titreEcoleAccent: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: 6 },
  sousTitre: { fontSize: 13, color: '#B8A86A', marginTop: 8, fontStyle: 'italic', textAlign: 'center' },

  descriptionBox: {
    backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 16, padding: 16,
    width: '100%', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
  },
  descriptionTitre: { fontSize: 15, fontWeight: '800', color: '#FFD700', marginBottom: 8, textAlign: 'center' },
  descriptionTexte: { color: '#C8D8C8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  cheminVisuel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  cheminEmoji: { fontSize: 20 },
  cheminFlech: { fontSize: 10, color: '#FFD700', fontWeight: '900' },

  btnRoyal: { width: '100%', marginBottom: 12, borderRadius: 16, overflow: 'hidden', elevation: 8 },
  btnGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  btnRoyalTexte: { fontSize: 18, fontWeight: '900', color: '#1A0A00', letterSpacing: 1 },
  btnDisabled: { opacity: 0.4 },
  btnSecondaire: {
    borderWidth: 2, borderColor: '#FFD700', borderRadius: 16,
    paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 12,
  },
  btnSecondaireTexte: { fontSize: 16, fontWeight: '700', color: '#FFD700' },
  btnRetour: { marginTop: 8, padding: 12 },
  btnRetourTexte: { color: '#8A9A8A', fontSize: 14 },
  decorSolTexte: { color: '#5A6A5A', fontSize: 13, letterSpacing: 2, marginTop: 8 },

  enTeteChoix: { alignItems: 'center', marginBottom: 20 },
  enTeteEmoji: { fontSize: 48, marginBottom: 8 },
  enTeteTitre: { fontSize: 26, fontWeight: '900', color: '#FFD700' },
  enTeteSous: { fontSize: 13, color: '#8A9A8A', marginTop: 4 },

  parchemin: { width: '100%', marginBottom: 20 },
  cheminConnecteur: { textAlign: 'center', color: '#5A6A5A', fontSize: 20, marginVertical: 2 },
  carteNiveau: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 2,
    borderColor: 'transparent', padding: 16, flexDirection: 'row', alignItems: 'center', width: '100%',
  },
  carteNiveauActive: { backgroundColor: 'rgba(255,215,0,0.1)' },
  niveauIcone: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  niveauEmoji: { fontSize: 26 },
  niveauInfo: { flex: 1 },
  niveauLabel: { fontSize: 15, fontWeight: '900', color: '#FFFFFF' },
  niveauSous: { fontSize: 11, color: '#8A9A8A', marginTop: 1 },
  niveauTheme: { fontSize: 12, color: '#B8A86A', marginTop: 2, fontStyle: 'italic' },
  niveauCheck: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFD700', alignItems: 'center', justifyContent: 'center' },
  niveauCheckTexte: { fontSize: 16, fontWeight: '900', color: '#1A0A00' },

  parchemin2Emoji: { fontSize: 60, marginBottom: 12 },
  parchemin2Titre: { fontSize: 26, fontWeight: '900', color: '#FFD700', textAlign: 'center' },
  parchemin2Sous: { fontSize: 13, color: '#8A9A8A', marginBottom: 32, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
  inputDecor: { fontSize: 20, marginHorizontal: 8 },
  input: {
    flex: 1, backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 14,
    borderWidth: 2, borderColor: '#8B6914', paddingHorizontal: 20, paddingVertical: 16,
    fontSize: 18, color: '#FFFFFF', textAlign: 'center',
  },
});

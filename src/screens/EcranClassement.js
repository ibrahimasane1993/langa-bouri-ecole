import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getClassement } from '../supabase';

const MEDAILLES = ['🥇', '🥈', '🥉'];

export default function EcranClassement({ naviguer }) {
  const [classement, setClassement] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setChargement(true);
    const data = await getClassement();
    setClassement(data);
    setChargement(false);
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.ligne, index === 0 && styles.premiereLigne]}>
      <Text style={styles.rang}>{index < 3 ? MEDAILLES[index] : `#${index + 1}`}</Text>
      <View style={styles.info}>
        <Text style={styles.pseudoTexte}>{item.pseudo}</Text>
        <Text style={styles.niveauTexte}>Niveau {item.niveau}</Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreTexte}>{item.score}</Text>
        <Text style={styles.ptsTexte}>pts</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0D5C2A', '#1A7A3A', '#2E9B50']} style={styles.container}>
      <SafeAreaView style={styles.safe}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => naviguer('accueil')}>
            <Text style={styles.retour}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.titre}>🏆 Classement</Text>
          <TouchableOpacity onPress={charger}>
            <Text style={styles.refresh}>🔄</Text>
          </TouchableOpacity>
        </View>

        {chargement ? (
          <View style={styles.centrer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.chargementTexte}>Chargement...</Text>
          </View>
        ) : classement.length === 0 ? (
          <View style={styles.centrer}>
            <Text style={styles.videEmoji}>🎯</Text>
            <Text style={styles.videTexte}>Pas encore de scores.{'\n'}Sois le premier !</Text>
            <TouchableOpacity style={styles.btnJouer} onPress={() => naviguer('accueil')}>
              <Text style={styles.btnJouerTexte}>🎮 Jouer maintenant</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={classement}
            renderItem={renderItem}
            keyExtractor={(item) => item.pseudo}
            contentContainerStyle={styles.liste}
            showsVerticalScrollIndicator={false}
          />
        )}

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 16 },
  centrer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  retour: { color: '#B8EBBF', fontSize: 15 },
  titre: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  refresh: { fontSize: 22 },

  liste: { paddingBottom: 32 },

  ligne: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  premiereLigne: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderColor: '#FFD700',
  },

  rang: { fontSize: 24, marginRight: 14, minWidth: 36, textAlign: 'center' },
  info: { flex: 1 },
  pseudoTexte: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  niveauTexte: { fontSize: 12, color: '#B8EBBF', marginTop: 2 },

  scoreBox: { alignItems: 'center' },
  scoreTexte: { fontSize: 22, fontWeight: '900', color: '#FFD700' },
  ptsTexte: { fontSize: 11, color: '#B8EBBF' },

  chargementTexte: { color: '#B8EBBF', marginTop: 12, fontSize: 15 },
  videEmoji: { fontSize: 64, marginBottom: 16 },
  videTexte: { color: '#B8EBBF', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 },

  btnJouer: {
    backgroundColor: '#FFD700',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  btnJouerTexte: { fontSize: 16, fontWeight: '900', color: '#0D5C2A' },
});

import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import EcranAccueil from './src/screens/EcranAccueil';
import EcranJeu from './src/screens/EcranJeu';
import EcranResultat from './src/screens/EcranResultat';
import EcranClassement from './src/screens/EcranClassement';

export default function App() {
  const [ecran, setEcran] = useState('accueil');
  const [niveau, setNiveau] = useState(1);
  const [pseudo, setPseudo] = useState('');
  const [resultat, setResultat] = useState(null);

  const naviguer = (destination, params = {}) => {
    if (params.niveau) setNiveau(params.niveau);
    if (params.pseudo) setPseudo(params.pseudo);
    if (params.resultat) setResultat(params.resultat);
    setEcran(destination);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#1A7A3A" />
      {ecran === 'accueil' && (
        <EcranAccueil naviguer={naviguer} />
      )}
      {ecran === 'jeu' && (
        <EcranJeu naviguer={naviguer} niveau={niveau} pseudo={pseudo} />
      )}
      {ecran === 'resultat' && (
        <EcranResultat naviguer={naviguer} resultat={resultat} pseudo={pseudo} niveau={niveau} />
      )}
      {ecran === 'classement' && (
        <EcranClassement naviguer={naviguer} />
      )}
    </SafeAreaProvider>
  );
}

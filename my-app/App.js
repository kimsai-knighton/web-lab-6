import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';

// Временные заглушки для экранов, их мы вынесем позже
function NotesListScreen() {
  return <View style={styles.screen}><Text>Здесь будет список заметок</Text></View>;
}

function CreateNoteScreen() {
  return <View style={styles.screen}><Text>Здесь будет создание заметки</Text></View>;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState('list');
  
  const [fontsLoaded] = useFonts({
    'Header': require('./assets/header.ttf'),
  });

  // Глобальный стейт заметок, доступный обеим вкладкам
  const [notes, setNotes] = useState([]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Рабочая зона: показываем экран в зависимости от стейта */}
      <View style={styles.content}>
        {currentTab === 'list' ? <NotesListScreen /> : <CreateNoteScreen />}
      </View>

      {/* 2. Панель вкладок (Tabs) внизу экрана */}
      <View style={styles.tabBar}>
		<TouchableOpacity 
          style={[styles.tabButton, currentTab === 'create' && styles.activeTab]} 
          onPress={() => setCurrentTab('create')}
        >
          <Text style={styles.tabText}>Новая заметка</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, currentTab === 'list' && styles.activeTab]} 
          onPress={() => setCurrentTab('list')}
        >
          <Text style={styles.tabText}>Мои заметки</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 50,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fdf5e3',
  },
  tabText: {
    fontSize: 16,
	fontFamily: 'Header',
    fontWeight: '600',
  },

});
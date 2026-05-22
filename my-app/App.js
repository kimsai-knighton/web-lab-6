import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, TextInput, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';

// Экран №1. Список заметок
function NotesListScreen({ notes, onSelectNote }) {
  return (
    <View style={{ flex: 1, padding: 20, marginTop: 30 }}>
      {notes.length === 0 ? (
        <View style={styles.screen}>
          <Text style={{ fontFamily: 'Header', fontSize: 18 }}>Заметок пока нет</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.noteCard} onPress={() => onSelectNote(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteText} numberOfLines={2}>{item.text}</Text> 
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// Экран №2. Отдельное чтение заметки
function ReadNoteScreen({ note, onBack, onDelete }) {
  return (
    <View style={styles.readContainer}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <View style={styles.readContent}>
        <Text style={styles.readTitle}>{note.title}</Text>
        <Text style={styles.readText}>{note.text}</Text>
      </View>

      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => {
          onDelete(note.id);
          onBack(); 
        }}
      >
        <Text style={styles.deleteButtonText}>Удалить заметку</Text>
      </TouchableOpacity>
    </View>
  );
}

// Экран №3. Создание заметки
function CreateNoteScreen({ onAddNote }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const handleSave = () => {
    if (!title.trim() || !text.trim()) return; 

    const newNote = {
      id: Date.now().toString(),
      title: title,
      text: text,
    };

    onAddNote(newNote); 
    setTitle(''); 
    setText('');
  };

  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Название заметки"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.inputT}
        placeholder="Текст заметки..."
        value={text}
        onChangeText={setText}
        multiline
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Сохранить</Text>
      </TouchableOpacity>
    </View>
  );
}

// Главный компонент приложения
export default function App() {
  const [currentTab, setCurrentTab] = useState('list');
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null); // Перенесли сюда
  
  const [fontsLoaded] = useFonts({
    'Header': require('./assets/header.ttf'),
  });

  // Загрузка заметок при старте
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const savedNotes = await AsyncStorage.getItem('MY_NOTES');
        if (savedNotes) setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.log('Ошибка при чтении заметок:', e);
      }
    };
    loadNotes();
  }, []);

  // Добавление заметки
  const addNote = async (newNote) => {
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    try {
      await AsyncStorage.setItem('MY_NOTES', JSON.stringify(updatedNotes));
    } catch (e) {
      console.log('Ошибка при сохранении:', e);
    }
    setCurrentTab('list');
  };

  // Удаление заметки
  const deleteNote = async (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    try {
      await AsyncStorage.setItem('MY_NOTES', JSON.stringify(updatedNotes));
    } catch (e) {
      console.log('Ошибка при удалении:', e);
    }
  };

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Рабочая зона */}
      <View style={styles.content}>
        {selectedNote ? (
          <ReadNoteScreen 
            note={selectedNote} 
            onBack={() => setSelectedNote(null)} 
            onDelete={deleteNote} 
          />
        ) : currentTab === 'list' ? (
          <NotesListScreen notes={notes} onSelectNote={setSelectedNote} />
        ) : (
          <CreateNoteScreen onAddNote={addNote} />
        )}
      </View>

      {/* 2. Панель вкладок (скрывается на экране чтения) */}
      {!selectedNote && (
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
      )}

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
  input: {
    height: 45,
    margin: 12,
	marginTop: 20,
    marginBottom: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    padding: 10,
    fontSize: 20,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
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
  formContainer: {
    marginTop: 20,
    paddingRight: 15,
  },
  inputT: {
    height: 600, 
    margin: 12,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    fontSize: 20,
    borderRadius: 8,
    padding: 10,
  },
  saveButton: {
    borderWidth: 1,
    borderColor: '#336e23',
    backgroundColor: '#92be869f',
    width: 130,
    height: 50,
    borderRadius: 8,
    alignSelf: 'center',
    justifyContent: 'center', 
    alignItems: 'center',     
  },
  saveButtonText: {
    fontFamily: 'Header',
    color: '#1e3d14',
    fontSize: 20,
  },
  noteCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noteTitle: {
    fontSize: 18,
    fontFamily: 'Header',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 15,
    color: '#444',
  },
  readContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'space-between', 
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 26,
    fontFamily: 'Header',
    color: '#333',
	marginTop: 15,
  },
  readContent: {
    flex: 1, 
  },
  readTitle: {
    fontSize: 26,
    fontFamily: 'Header',
    marginBottom: 15,
	marginTop: -15,
    color: '#111',
  },
  readText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#c62828',
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#c62828',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Header',
  },
});
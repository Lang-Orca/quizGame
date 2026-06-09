import React, {useEffect, useState, useRef} from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface LogEntry {
  id: string;
  type: 'log' | 'warn' | 'error';
  timestamp: Date;
  messages: any[];
}

let originalLog: any = null;
let originalWarn: any = null;
let originalError: any = null;

// Mémoire statique pour que les logs persistent si le composant est démonté/remonté
const globalLogs: LogEntry[] = [];
let notifySubscribers: () => void = () => {};

export function initDebugConsole() {
  if (originalLog) return; // Déjà initialisé

  originalLog = console.log;
  originalWarn = console.warn;
  originalError = console.error;

  const pushLog = (type: 'log' | 'warn' | 'error', ...args: any[]) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(7) + Date.now(),
      type,
      timestamp: new Date(),
      messages: args,
    };
    globalLogs.unshift(entry);
    if (globalLogs.length > 500) {
      globalLogs.length = 500; // Garder les 500 derniers logs
    }
    notifySubscribers();
  };

  console.log = (...args) => {
    originalLog(...args);
    pushLog('log', ...args);
  };

  console.warn = (...args) => {
    originalWarn(...args);
    pushLog('warn', ...args);
  };

  console.error = (...args) => {
    originalError(...args);
    pushLog('error', ...args);
  };
}

export function DebugConsole() {
  const [visible, setVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all');

  useEffect(() => {
    initDebugConsole();
    setLogs([...globalLogs]);
    notifySubscribers = () => {
      setLogs([...globalLogs]);
    };
    return () => {
      notifySubscribers = () => {};
    };
  }, []);

  const formatMessage = (msg: any) => {
    if (typeof msg === 'string') return msg;
    try {
      return JSON.stringify(msg, null, 2);
    } catch {
      return String(msg);
    }
  };

  const filteredLogs = logs.filter(l => filter === 'all' || l.type === filter);

  return (
    <>
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setVisible(true)}>
        <Text style={styles.floatingButtonText}>🐞</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Console de Débogage</Text>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filters}>
            <TouchableOpacity onPress={() => setFilter('all')} style={[styles.filterBtn, filter === 'all' && styles.activeFilter]}>
              <Text style={styles.filterText}>Tous</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilter('log')} style={[styles.filterBtn, filter === 'log' && styles.activeFilter]}>
              <Text style={styles.filterText}>Logs</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilter('warn')} style={[styles.filterBtn, filter === 'warn' && styles.activeFilter]}>
              <Text style={styles.filterText}>Warns</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFilter('error')} style={[styles.filterBtn, filter === 'error' && styles.activeFilter]}>
              <Text style={styles.filterText}>Errors</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                globalLogs.length = 0;
                setLogs([]);
              }}
              style={styles.clearBtn}>
              <Text style={styles.clearText}>Effacer</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredLogs}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={[styles.logItem, styles[item.type]]}>
                <Text style={styles.timestamp}>
                  {item.timestamp.toLocaleTimeString()} [{item.type.toUpperCase()}]
                </Text>
                <Text style={styles.logText}>
                  {item.messages.map(formatMessage).join(' ')}
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#334155',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: '#38bdf8',
    fontSize: 16,
  },
  filters: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#334155',
  },
  activeFilter: {
    backgroundColor: '#38bdf8',
  },
  filterText: {
    color: '#fff',
    fontSize: 12,
  },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#dc2626',
    marginLeft: 'auto',
  },
  clearText: {
    color: '#fff',
    fontSize: 12,
  },
  logItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  log: {
    backgroundColor: '#0f172a',
  },
  warn: {
    backgroundColor: '#422006',
  },
  error: {
    backgroundColor: '#450a0a',
  },
  timestamp: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 4,
  },
  logText: {
    fontSize: 13,
    color: '#f8fafc',
    fontFamily: 'Courier',
  },
});

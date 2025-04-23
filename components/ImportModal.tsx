import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { X, Upload, FileText, Download } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '@/constants/colors';
import Button from './Button';
import { parseCSV } from '@/utils/csv-import';
import { downloadTemplate } from '@/utils/csv-export';

type ImportType = 'players' | 'games';

interface ImportModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  type: ImportType;
}

export default function ImportModal({ visible, onClose, onImport, type }: ImportModalProps) {
  const [file, setFile] = useState<{ name: string; uri: string } | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const resetState = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      // DocumentPicker.getDocumentAsync returns an array of assets in newer versions
      const asset = 'assets' in result ? result.assets[0] : result;
      
      if (!asset.name.toLowerCase().endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      
      setFile({
        name: asset.name,
        uri: asset.uri
      });
      setError(null);
      
      // Parse the CSV file
      setLoading(true);
      try {
        const data = await parseCSV(asset.uri, type);
        setParsedData(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      }
    } catch (err) {
      setError('Error selecting file');
      console.error(err);
    }
  };
  
  const handleImport = () => {
    if (!parsedData) return;
    
    setLoading(true);
    try {
      onImport(parsedData);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to import data');
    }
  };
  
  const handleDownloadTemplate = () => {
    downloadTemplate(type);
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Import {type === 'players' ? 'Players' : 'Games'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <Text style={styles.description}>
              Upload a CSV file to bulk import {type === 'players' ? 'players' : 'games'}.
              Make sure your CSV file follows the required format.
            </Text>
            
            <View style={styles.templateSection}>
              <Text style={styles.sectionTitle}>Need a template?</Text>
              <Button
                title="Download Template"
                onPress={handleDownloadTemplate}
                variant="outline"
                icon={<Download size={16} color={Colors.primary} />}
              />
            </View>
            
            <View style={styles.uploadSection}>
              <Text style={styles.sectionTitle}>Upload CSV File</Text>
              
              {file ? (
                <View style={styles.fileInfo}>
                  <FileText size={24} color={Colors.primary} />
                  <Text style={styles.fileName}>{file.name}</Text>
                  <TouchableOpacity onPress={() => setFile(null)}>
                    <X size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <Button
                  title="Select CSV File"
                  onPress={pickDocument}
                  variant="outline"
                  icon={<Upload size={16} color={Colors.primary} />}
                  style={styles.uploadButton}
                />
              )}
            </View>
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Processing...</Text>
              </View>
            )}
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {parsedData && !error && !success && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>
                  Ready to import {parsedData.length} {type}
                </Text>
                <Text style={styles.previewDescription}>
                  Please review the data before importing. This will add new {type} to your database.
                </Text>
              </View>
            )}
            
            {success && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  Successfully imported {parsedData?.length} {type}!
                </Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title={success ? "Done" : "Import Data"}
              onPress={success ? handleClose : handleImport}
              variant="primary"
              style={styles.footerButton}
              disabled={!parsedData || loading || error !== null}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    maxHeight: '70%',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  templateSection: {
    marginBottom: 24,
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  uploadButton: {
    width: '100%',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: Colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
  previewContainer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  successContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: 'green',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
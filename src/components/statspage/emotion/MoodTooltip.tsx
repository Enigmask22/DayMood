import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TouchableWithoutFeedback 
} from 'react-native';
import { format, parseISO } from 'date-fns';
import { TooltipData } from './types';

interface MoodTooltipProps {
  data: TooltipData;
  onClose: () => void;
}

const MoodTooltip: React.FC<MoodTooltipProps> = ({ data, onClose }) => {
  if (!data.visible) return null;
  
  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Modal
      transparent={true}
      visible={data.visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <Text style={styles.title}>Mood Summary</Text>
                <Text style={styles.date}>{formatDate(data.date)}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.moodList}>
                {data.moods.map((mood, index) => (
                  <View key={index} style={styles.moodItem}>
                    <View style={styles.moodNameSection}>
                      <View 
                        style={[
                          styles.colorIndicator, 
                          { backgroundColor: mood.moodColor }
                        ]} 
                      />
                      <Text style={styles.moodName}>{mood.moodName}</Text>
                    </View>
                    
                    <View style={styles.countSection}>
                      <Text style={styles.moodCount}>{mood.count}</Text>
                      <Text style={styles.moodPercentage}>{mood.percentage}%</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.footer}>
                <Text style={styles.totalLabel}>
                  Total Records: <Text style={styles.totalValue}>{data.totalCount}</Text>
                </Text>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 16,
  },
  moodList: {
    marginBottom: 16,
  },
  moodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  moodNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  moodName: {
    fontSize: 16,
    color: '#334155',
  },
  countSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 8,
    minWidth: 20,
    textAlign: 'right',
  },
  moodPercentage: {
    fontSize: 14,
    color: '#64748b',
    minWidth: 40,
  },
  footer: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 16,
    textAlign: 'center',
  },
  totalValue: {
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MoodTooltip;
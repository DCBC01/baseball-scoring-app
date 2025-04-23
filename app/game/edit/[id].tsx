import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, ArrowLeft, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useGameStore } from '@/store/game-store';
import { useAuthStore } from '@/store/auth-store';
import Button from '@/components/Button';

export default function EditGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { games, updateGame } = useGameStore();
  const { isAdmin } = useAuthStore();
  
  const game = games.find(g => g.id === id);
  
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('Home');
  const [result, setResult] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Load game data
  useEffect(() => {
    if (game) {
      setOpponent(game.opponent);
      setDate(game.date);
      setLocation(game.location);
      setResult(game.result || '');
    }
  }, [game]);
  
  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.replace('/');
    }
  }, [isAdmin]);
  
  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Game not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </SafeAreaView>
    );
  }
  
  const handleSubmit = () => {
    if (!opponent || !date || !location) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    updateGame({
      ...game,
      opponent,
      date,
      location,
      result: result || undefined,
    });
    
    router.back();
  };
  
  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Simple date picker for web
  const renderDatePicker = () => {
    if (!showDatePicker) return null;
    
    const currentDate = new Date(date);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Create array of day numbers
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    // Create array for empty cells before first day
    const emptyCells = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    
    // Combine empty cells and days
    const calendarDays = [...emptyCells, ...days];
    
    // Create weeks (rows of 7 days)
    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    const handlePrevMonth = () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setDate(newDate.toISOString().split('T')[0]);
    };
    
    const handleNextMonth = () => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setDate(newDate.toISOString().split('T')[0]);
    };
    
    const handleSelectDay = (day: number) => {
      const newDate = new Date(currentDate);
      newDate.setDate(day);
      setDate(newDate.toISOString().split('T')[0]);
      setShowDatePicker(false);
    };
    
    return (
      <View style={styles.datePickerContainer}>
        <View style={styles.datePickerHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.datePickerArrow}>
            <ArrowLeft size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.datePickerTitle}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.datePickerArrow}>
            <ArrowRight size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.datePickerDaysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.datePickerDayHeader}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.datePickerCalendar}>
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.datePickerWeek}>
              {week.map((day, dayIndex) => {
                if (day === null) {
                  return <View key={`empty-${dayIndex}`} style={styles.datePickerEmptyDay} />;
                }
                
                const isSelected = day === currentDate.getDate();
                
                return (
                  <TouchableOpacity
                    key={`day-${day}`}
                    style={[
                      styles.datePickerDay,
                      isSelected && styles.datePickerSelectedDay,
                    ]}
                    onPress={() => handleSelectDay(day)}
                  >
                    <Text
                      style={[
                        styles.datePickerDayText,
                        isSelected && styles.datePickerSelectedDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Edit Game</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Opponent</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter opponent team name"
              value={opponent}
              onChangeText={setOpponent}
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => {
              if (Platform.OS === 'web') {
                setShowDatePicker(!showDatePicker);
              } else {
                // On native, we'd use a DateTimePicker
                // For this example, we'll just toggle the web version
                setShowDatePicker(!showDatePicker);
              }
            }}
          >
            <View style={styles.dateInput}>
              <Calendar size={20} color={Colors.gray[500]} />
              <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
            </View>
          </TouchableOpacity>
          
          {renderDatePicker()}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationContainer}>
            <TouchableOpacity
              style={[
                styles.locationOption,
                location === 'Home' && styles.locationOptionSelected,
              ]}
              onPress={() => setLocation('Home')}
            >
              <MapPin 
                size={20} 
                color={location === 'Home' ? Colors.primary : Colors.gray[500]} 
              />
              <Text 
                style={[
                  styles.locationText,
                  location === 'Home' && styles.locationTextSelected,
                ]}
              >
                Home
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.locationOption,
                location === 'Away' && styles.locationOptionSelected,
              ]}
              onPress={() => setLocation('Away')}
            >
              <MapPin 
                size={20} 
                color={location === 'Away' ? Colors.primary : Colors.gray[500]} 
              />
              <Text 
                style={[
                  styles.locationText,
                  location === 'Away' && styles.locationTextSelected,
                ]}
              >
                Away
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {game.isCompleted && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Result (e.g., "W 5-3" or "L 2-4")</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter game result"
                value={result}
                onChangeText={setResult}
                placeholderTextColor={Colors.gray[400]}
              />
            </View>
          </View>
        )}
        
        <Button
          title="Save Changes"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  locationOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    paddingVertical: 12,
  },
  locationOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.gray[500],
  },
  locationTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  datePickerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  datePickerArrow: {
    padding: 8,
  },
  datePickerDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  datePickerDayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[500],
  },
  datePickerCalendar: {},
  datePickerWeek: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  datePickerDay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 4,
  },
  datePickerSelectedDay: {
    backgroundColor: Colors.primary,
  },
  datePickerDayText: {
    fontSize: 14,
    color: Colors.text,
  },
  datePickerSelectedDayText: {
    color: 'white',
    fontWeight: '500',
  },
  datePickerEmptyDay: {
    flex: 1,
  },
});
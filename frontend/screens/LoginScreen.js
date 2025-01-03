import React, { useState, useContext } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet,ActivityIndicator,} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { AuthContext } from '../AuthContext';

const LoginScreen = ({ navigation }) => {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false); 
  const [isOffline, setIsOffline] = useState(false);
  const { login } = useContext(AuthContext);

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);

    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigation.navigate('Home');
      } else {
        setServerError('Invalid email or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Planner</Text>
      <Text style={styles.subtitle}>Login</Text>

      {/* Email */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            placeholderTextColor="#95a5a6"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Password */}
      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Password"
            placeholderTextColor="#95a5a6"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      {/* Server error */}
      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      {/* Offline mode message */}
      {isOffline && <Text style={styles.offlineMessage}>You're connecting offline...</Text>}

      {/* Login button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Loading indicator */}
      {loading && <ActivityIndicator size="large" color="#2ecc71" style={styles.loading} />}

      {/* Register Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Don’t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ecf8f4',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#27ae60',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  error: {
    width: '100%',
    color: '#e74c3c',
    marginBottom: 10,
    fontSize: 14,
  },
  serverError: {
    width: '100%',
    color: '#e74c3c',
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  offlineMessage: {
    marginBottom: 10,
    fontSize: 14,
    color: '#e67e22',
    textAlign: 'center',
  },
  loading: {
    marginVertical: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#27ae60',
    fontSize: 16,
    marginTop: 10,
  },
});

export default LoginScreen;
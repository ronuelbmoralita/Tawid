import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import { Modal, View, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface WavingContextType {
  loading: boolean;
  showWaving: () => void;
  hideWaving: () => void;
}

const WavingContext = createContext<WavingContextType | undefined>(undefined);

interface WavingProviderProps {
  children: ReactNode;
}

// === Module-level singleton controller ===
// Lets non-component code (e.g. googleAuth.ts) trigger the waving loader
// without calling a hook. WavingProvider registers its real show/hide
// functions here on mount. Calling these before the provider has mounted
// is a no-op (safe, just does nothing).
let _showWaving: () => void = () => { };
let _hideWaving: () => void = () => { };

export const waving = {
  show: () => _showWaving(),
  hide: () => _hideWaving(),
};

// Custom Wave Loader Component
export const WavingLoader: React.FC = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const waveCount = 3;
  const amplitude = 12;
  const svgWidth = 120;
  const svgHeight = 40;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const generateWavePath = () => {
    const waveWidth = svgWidth / waveCount;
    const startX = 10; // Add padding for rounded start
    const endX = svgWidth - 10; // Add padding for rounded end
    const usableWidth = endX - startX;
    const adjustedWaveWidth = usableWidth / waveCount;

    let path = `M${startX},${svgHeight / 2} Q${startX + adjustedWaveWidth / 4},${svgHeight / 2 - amplitude} ${startX + adjustedWaveWidth / 2},${svgHeight / 2}`;

    for (let i = 1; i <= waveCount * 2 - 1; i++) {
      path += ` T${startX + (adjustedWaveWidth / 2) * (i + 1)},${svgHeight / 2}`;
    }
    return path;
  };

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [svgWidth * 2, 0],
  });

  return (
    <View style={{
      width: 120,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        <Path
          d={generateWavePath()}
          stroke={colors.white}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <AnimatedPath
          d={generateWavePath()}
          stroke={colors.brand}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${svgWidth * 2}`}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
    </View>
  );
};

export const WavingProvider: React.FC<WavingProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const loadingStartTime = useRef<number | null>(null);

  const showWaving = (): void => {
    loadingStartTime.current = Date.now();
    setLoading(true);
  };

  const hideWaving = (): void => {
    if (loadingStartTime.current) {
      const elapsedTime = Date.now() - loadingStartTime.current;
      const remainingTime = Math.max(0, 2000 - elapsedTime);

      setTimeout(() => {
        setLoading(false);
        loadingStartTime.current = null;
      }, remainingTime);
    } else {
      setLoading(false);
    }
  };

  // Register the real functions with the module-level singleton so
  // non-component code can drive the loader too.
  useEffect(() => {
    _showWaving = showWaving;
    _hideWaving = hideWaving;
    return () => {
      _showWaving = () => { };
      _hideWaving = () => { };
    };
  }, []);

  return (
    <WavingContext.Provider value={{ loading, showWaving, hideWaving }}>
      {children}
      <Modal
        statusBarTranslucent
        transparent
        visible={loading}
        animationType="fade"
        onRequestClose={() => { }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <WavingLoader />
        </View>
      </Modal>
    </WavingContext.Provider>
  );
};

export const useWaving = (): WavingContextType => {
  const context = useContext(WavingContext);
  if (!context) {
    throw new Error('useWaving must be used within WavingProvider');
  }
  return context;
};
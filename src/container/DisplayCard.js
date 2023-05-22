import React, { useRef, useState } from "react";
import { Animated, PanResponder, Dimensions, StyleSheet } from "react-native";
import MainCard from "../component/MainCard";
import { DATA, NO_CARD_DATA} from './CardData';

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.2 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 300;

const DisplyCards = ({ onSwipeLeft = () => {}, onSwipeRight = () => {} }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        return position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forciblySwap("RIGHT");
          console.log("Swapped to right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forciblySwap("LEFT");
          console.log("You swapped to left");
        } else {
          resetPosition();
        }
      },
    })
  ).current;
  const [index, setIndex] = useState(0);

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
    }).start();
  };
  const forciblySwap = (direction) => {
    const x = direction === "LEFT" ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction) => {
    const item = DATA[index];
    direction === "LEFT" ? onSwipeLeft(item) : onSwipeRight(item);
    position.setValue({ x: 0, y: 0 });
    setIndex((prevIndex) => prevIndex + 1);
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"],
    });
    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };
  const renderNoCards = () => (
    <Animated.View style={styles.cardStyles}>
      <MainCard data={NO_CARD_DATA} />
    </Animated.View>
  );

  const renderCards = () => {
    if (index >= DATA.length) {
      return renderNoCards();
    }

    return DATA.map((item, idx) => {
      if (idx < index) return null;

      if (index === idx) {
        return (
          <Animated.View
            key={item.id}
            style={[getCardStyle(), styles.cardStyles]}
            {...panResponder.panHandlers}
          >
            <MainCard data={item} key={item.id} />
          </Animated.View>
        );
      }
      return (
        <Animated.View
          key={item.id}
          style={[styles.cardStyles, { top: 10 * (idx - index) }]}
        >
          <MainCard data={item} key={item.id} />
        </Animated.View>
      );
    }).reverse();
  };
  return renderCards();
};

export default DisplyCards;

const styles = StyleSheet.create({
  cardStyles: {
    position: "absolute",
    width: SCREEN_WIDTH,
  },
});

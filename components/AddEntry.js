import React, { Component } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getMetricMetaInfo,
  timeToString,
  getdailyReminderValue
} from "../utils/helpers";
import UdaciSlider from "./UdaciSlider";
import UdaciSteppers from "./UdaciSteppers";
import DateHeader from "./DateHeader";
import TextButton from "./TextButton";
import { submitEntry, removeEntry } from "../utils/api";
import { connect } from "react-redux";
import { addEntry } from "../actions";
import { white, purple } from "../utils/colors";
import { NavigationActions } from "react-navigation";

function SubmitBtn({ onPress }) {
  return (
    <TouchableOpacity
      style={
        Platform.OS === "ios" ? styles.iosSubmitBtn : styles.androidSubmitBtn
      }
      onPress={onPress}
    >
      <Text style={styles.submitBtnText}>SUBMIT</Text>
    </TouchableOpacity>
  );
}

class AddEntry extends Component {
  state = {
    run: 0,
    bike: 0,
    swim: 0,
    sleep: 0,
    eat: 0
  };
  increment = metric => {
    const { max, step } = getMetricMetaInfo(metric);

    //note when you pass a function to setState you get the current state
    //count we want to taje the state of the current metric and increment by the step (getting from getMetricMetaInfo function)
    this.setState(state => {
      const count = state[metric] + step;

      return {
        ...state,
        [metric]: count > max ? max : count
      };
    });
  };

  decrement = metric => {
    //note when you pass a function to setState you get the current state
    //count we want to take the existing state  decrement by the step (getting from getMetricMetaInfo function)
    this.setState(state => {
      const count = state[metric] - getMetricMetaInfo(metric).step;

      return {
        ...state,
        [metric]: count < 0 ? 0 : count
      };
    });
  };

  slide = (metric, value) => {
    this.setState(() => ({
      [metric]: value
    }));
  };

  submit = () => {
    const key = timeToString();
    const entry = this.state;

    //update redux (): Dispatching action creator to save to Redux store
    this.props.dispatch(
      addEntry({
        [key]: entry
      })
    );
    //resetting state
    this.setState(() => ({
      run: 0,
      bike: 0,
      swim: 0,
      sleep: 0,
      eat: 0
    }));

    this.toHome();
    //navigate to home
    submitEntry({ key, entry });

    // clear local notification
  };
  //reset function
  reset = () => {
    const key = timeToString();

    //update Redux
    this.props.dispatch(
      addEntry({
        [key]: getdailyReminderValue()
      })
    );

    this.toHome();
    //update "database- asyncstorage"
    removeEntry(key);
  };

  //Route to home
  toHome = () => {
    this.props.navigation.dispatch(
      NavigationActions.back({
        key: "AddEntry"
      })
    );
  };
  render() {
    const metaInfo = getMetricMetaInfo();
    //If alrady logged activity return the screen stated already logged for the day with option to reset
    if (this.props.alreadyLogged) {
      return (
        <View style={styles.center}>
          <Ionicons
            name={Platform.OS === "ios" ? "ios-happy-outline" : "md-happy"}
            size={100}
          />
          <Text>You already logged your information for today</Text>
          <TextButton style={{ padding: 10 }} onPress={this.reset}>
            Reset{" "}
          </TextButton>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <DateHeader date={new Date().toLocaleDateString()} />
        {Object.keys(metaInfo).map(key => {
          const { getIcon, type, ...rest } = metaInfo[key];
          const value = this.state[key];

          return (
            <View key={key} style={styles.row}>
              {getIcon()}
              {type === "slider" ? (
                <UdaciSlider
                  value={value}
                  onChange={value => this.slide(key, value)}
                  {...rest}
                />
              ) : (
                <UdaciSteppers
                  value={value}
                  onIncrement={() => this.increment(key)}
                  onDecrement={() => this.decrement(key)}
                  {...rest}
                />
              )}
            </View>
          );
        })}
        <SubmitBtn onPress={this.submit} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: white
  },
  row: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center"
  },
  iosSubmitBtn: {
    backgroundColor: purple,
    padding: 10,
    borderRadius: 7,
    height: 45,
    marginLeft: 40,
    marginRight: 40
  },
  androidSubmitBtn: {
    backgroundColor: purple,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    height: 45,
    borderRadius: 2,
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center"
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: "center"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 30,
    marginRight: 30
  },
  metricCounter: {
    width: 85,
    justifyContent: "center",
    alignItems: "center"
  }
});
function mapStateToProps(state) {
  const key = timeToString();
  return {
    alreadyLogged: state[key] && typeof state[key].today === "undefined" //if you have today proper info hasnt been logged
  };
}
export default connect(mapStateToProps)(AddEntry);

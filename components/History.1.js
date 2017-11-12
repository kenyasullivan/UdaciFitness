import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform
} from "react-native";
import { connect } from "react-redux";
import { receiveEntries, addEntry } from "../actions";
import { timeToString, getDailyReminderValue } from "../utils/helpers";
import { fetchCalendarResults } from "../utils/api";
import UdaciFitnessCalendar from "udacifitness-calendar";
import DateHeader from "./DateHeader";
import { white } from "../utils/colors";

class History extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    //Fetch all our calendar result,
    //.Then receive all the entries
    //Dispatch the entries and add to current state
    //.then the get daily reminder
    fetchCalendarResults()
      .then(entries => dispatch(receiveEntries(entries)))
      .then(({ entries }) => {
        if (!entries[timeToString()]) {
          dispatch(
            addEntry({
              [timeToString()]: getDailyReminderValue()
            })
          );
        }
      })
      .then(() => this.setState(() => ({ ready: true })));
  }

  renderItem = ({ today, ...metrics }, formattedDate, key) => (
    <View style={styles.item}>
      {today ? (
        <View>
          <DateHeader date={formattedDate} />
          <Text style={styles.noDataText}> {today}</Text>
        </View>
      ) : (
        <TouchableOpacity onPress={() => console.log("Pressed!")}>
          <Text>{JSON.stringify(metrics)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  renderEmptyDate(formattedDate) {
    return (
      <View style={styles.item}>
        <DateHeader date={formattedDate} />
        <Text style={styles.noDataText}>
          You did not log any data for today
        </Text>
      </View>
    );
  }

  render() {
    const { entries } = this.props;
    return (
      <UdaciFitnessCalendar
        items={entries}
        renderItem={this.renderItem}
        renderEmptyDate={this.renderEnptyDate}
      />
    );
  }
}

function mapStateToProps(entries) {
  return {
    entries
  };
}

export default connect(mapStateToProps)(History);

///Compomnet will mount
//Ftch results
//Update Res=dux with results
//Re-render
//Get all entries from this. props

const styles = StyleSheet.create({
  item: {
    backgroundColor: white,
    borderRadius: Platform.OS === "ios" ? 16 : 2,
    padding: 20,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 17,
    justifyContent: "center",
    shadowRadius: 3,
    shadowOpacity: 0.8,
    shadowColor: "rgba(0,0,0,0.24)",
    shadowOffset: {
      width: 0,
      height: 3
    }
  },
  noDataText: {
    fontSize: 20,
    paddingTop: 20,
    paddingBottom: 20
  }
});

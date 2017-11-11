import { AsyncStorage } from "react-native";
import { CALENDAR_STORAGE_KEY } from "./_calendar";

export function submitEntry({ entry, key }) {
  /// submit new entry for day
  return AsyncStorage.mergeItem(
    // we take the entry and submit to database
    CALENDAR_STORAGE_KEY, //merge calendar
    JSON.stringify({
      ///strigify version of data
      [key]: entry
    })
  );
}

export function removeEntry(key) {
  return AsyncStorage.getItem(CALENDAR_STORAGE_KEY).then(results => {
    const data = JSON.parse(results);
    data[key] = undefined;
    delete data[key];
    AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(data));
  });
}

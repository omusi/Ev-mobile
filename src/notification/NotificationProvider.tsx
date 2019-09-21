import DeviceInfo from "react-native-device-info";
import PushNotification, { PushNotificationObject } from "react-native-push-notification";

export default class NotificationProvider {
  private lastId: number;

  constructor(onRegister: () => void, onNotification: () => void) {
    // Configure
    this.configure(onRegister, onNotification);
    // Init message ID
    this.lastId = 0;
  }

  // eslint-disable-next-line class-methods-use-this
  configure(onRegister: () => void, onNotification: () => void) {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister, //this._onRegister.bind(this),
      // (required) Called when a remote or local notification is opened or received
      onNotification, //this._onNotification,
      // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: "49073993741",
      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },
      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,
      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       */
      requestPermissions: true
    });
  }

  public async sendLocalNotification({
    id = ++this.lastId,
    title = "Title",
    message = "Message",
    bigText = "",
    subText = "",
    color = "red",
    vibrate = true,
    vibrationMillis = 300,
    playSound = true
  }) {
    // Create notif object
    const notification: PushNotificationObject = {
      /* iOS and Android properties */
      title, // (optional)
      message, // (required)
      playSound, // (optional) default: true
      soundName: "default", // (optional) Sound to play when the notification is shown. Value of 'default' plays the default sound. It can be set to a custom sound such as 'android.resource://com.xyz/raw/my_sound'. It will look for the 'my_sound' audio file in 'res/raw' directory and play it. default: 'default' (default sound is played)
      number: "1", // (optional) Valid 32 bit integer specified as string. default: none (Cannot be zero)

      /* Android Only Properties */
      id: `${id}`, // (optional) Valid unique 32 bit integer specified as string. default: Autogenerated Unique ID
      ticker: "", // (optional)
      autoCancel: true, // (optional) default: true
      largeIcon: "ic_launcher", // (optional) default: "ic_launcher"
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher"
      bigText, // (optional) default: "message" prop
      subText, // (optional) default: none
      color, // (optional) default: system default
      vibrate, // (optional) default: true
      vibration: vibrationMillis, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      tag: DeviceInfo.getApplicationName(), // (optional) add tag to message
      group: DeviceInfo.getApplicationName(), // (optional) add group to message
      ongoing: false, // (optional) set whether this is an "ongoing" notification
      actions: "[]", // (Android only) See the doc for notification actions to know more

      /* iOS only properties */
      alertAction: "view", // (optional) default: view
      category: null, // (optional) default: null
    };
    // Send Notif
    await PushNotification.localNotification(notification);
  }

  public checkPermission(callback: () => void) {
    return PushNotification.checkPermissions(callback);
  }

  public cancelNotif() {
    PushNotification.cancelLocalNotifications({ id: "" + this.lastId });
  }

  public cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}

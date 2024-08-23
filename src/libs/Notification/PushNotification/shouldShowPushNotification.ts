import type {JsonObject, PushPayload} from '@ua/react-native-airship';
import Log from '@libs/Log';
import * as ReportActionUtils from '@libs/ReportActionsUtils';
import * as Report from '@userActions/Report';
import type {PushNotificationData} from './NotificationType';

/**
 * Returns whether the given Airship notification should be shown depending on the current state of the app
 */
export default function shouldShowPushNotification(pushPayload: PushPayload): boolean {
    Log.info('[PushNotification] push notification received', false, {pushPayload});

    let payload = pushPayload.extras.payload;

    // The payload is string encoded on Android
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload) as JsonObject;
        } catch {
            Log.hmmm(`[PushNotification] Failed to parse the payload`, payload);
            payload = undefined;
        }
    }

    const data = payload ? (payload as PushNotificationData) : undefined;

    if (!data?.reportID) {
        Log.info('[PushNotification] Not a report action notification. Showing notification');
        return true;
    }

    const reportAction = ReportActionUtils.getLatestReportActionFromOnyxData(data.onyxData ?? null);
    const shouldShow = Report.shouldShowReportActionNotification(String(data.reportID), reportAction, true);
    Log.info(`[PushNotification] ${shouldShow ? 'Showing' : 'Not showing'} notification`);
    return shouldShow;
}

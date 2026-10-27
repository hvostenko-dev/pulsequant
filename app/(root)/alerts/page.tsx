import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserAlerts } from '@/lib/actions/alert.actions';
import AlertsClient from '@/components/AlertsClient';

export const metadata = {
    title: 'Smart Price Alerts & Volatility Monitors',
    description: 'Set and monitor real-time stock price thresholds and breakout alerts.',
};

export default async function AlertsPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/sign-in');
    }

    const alerts = await getUserAlerts();

    return <AlertsClient alerts={alerts} />;
}

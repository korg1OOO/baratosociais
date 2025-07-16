import { useEffect } from 'react';
import axios from 'axios';
import { Order } from '../types';

interface WebhookHandlerProps {
  onWebhookUpdate: (data: any) => void;
}

export const WebhookHandler: React.FC<WebhookHandlerProps> = ({ onWebhookUpdate }) => {
  useEffect(() => {
    // Simulated webhook server (in production, use a real backend like Express)
    const webhookServer = async (req: any, res: any) => {
      try {
        const webhookData = req.body; // Assuming Express or similar
        const { event, token, transaction } = webhookData;

        // Validate token (in production, verify against stored tokens)
        if (!token) {
          res.status(401).send('Invalid token');
          return;
        }

        if (event === 'TRANSACTION_PAID' && transaction.status === 'COMPLETED') {
          onWebhookUpdate(webhookData);
        }

        res.status(200).send('Webhook received');
      } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).send('Webhook processing failed');
      }
    };

    // For local testing, you might use ngrok or a mock server
    console.log('Webhook server listening at:', process.env.WEBHOOK_URL || 'https://your-webhook-url.com/webhook');
  }, [onWebhookUpdate]);

  return null; // This component doesn't render anything
};
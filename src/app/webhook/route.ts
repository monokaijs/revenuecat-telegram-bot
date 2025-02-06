import {NextRequest, NextResponse} from 'next/server';
import axios from 'axios';
import dayjs from 'dayjs';

// Telegram bot token and chat ID
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.CHAT_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const OPENAI_API_KEY = process.env.OPENAI_KEY;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const signature = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      return NextResponse.json({message: 'Unauthorized'}, {status: 401});
    }

    const {event} = body;
    if (event.type === 'INITIAL_PURCHASE') {
      const {country_code, currency, environment, event_timestamp_ms, presented_offering_id, price, store} = event;
      const message = `🎉🎉 Alo đại vương ơi, có người vừa mua hàng kìa!!! 🎉🎉\n\n` +
        `Khách yêu từ ${store} (${country_code}) vừa mua *${presented_offering_id}* vào lúc ${dayjs(event_timestamp_ms).format('HH:mm')}\n\n` +
        `Đại vương vừa bỏ túi 🤏 ${(price * 25000).toLocaleString()} VND tiền bỉm sữa. Bú bú bú. 😎`;

      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await axios.post(telegramUrl, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      });
    }

    return NextResponse.json({message: 'Webhook received and processed successfully'});
  } catch (error) {
    console.log('err', error);
    return NextResponse.json({message: 'Internal server error', error}, {status: 500});
  }
}

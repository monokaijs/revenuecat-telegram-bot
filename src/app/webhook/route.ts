import {NextRequest, NextResponse} from 'next/server';
import axios from 'axios';
import {OpenAI} from 'openai';

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
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", messages: [{
        role: 'system',
        content: 'You are an assistant to write messages to user to notice about recent received RevenueCat purchases.\n' + 'Your main goal is format the data into a informative, interesting and concise message to send to user.\n' + 'You can use emojis to make your message more attractive. If price is not available, just write "Price not available". Price is in USD, convert to VND and send VND price.\nAnd do not say anything else.',
      }, {
        role: 'user',
        content: `Here is the data:\n\n${JSON.stringify(body)}`,
      }], max_tokens: 150,
    });

    const message = aiResponse.choices[0].message.content;
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(telegramUrl, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });

    return NextResponse.json({message: 'Webhook received and processed successfully'});
  } catch (error) {
    console.log('err', error);
    return NextResponse.json({message: 'Internal server error'}, {status: 500});
  }
}

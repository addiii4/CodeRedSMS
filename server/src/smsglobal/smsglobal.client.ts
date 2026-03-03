import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class SmsGlobalClient {
  private readonly host = 'api.smsglobal.com';
  private readonly port = 443;

  private get key() {
    const v = process.env.SMSGLOBAL_API_KEY;
    if (!v) throw new Error('Missing SMSGLOBAL_API_KEY');
    return v;
  }

  private get secret() {
    const v = process.env.SMSGLOBAL_API_SECRET;
    if (!v) throw new Error('Missing SMSGLOBAL_API_SECRET');
    return v;
  }

  private macHeader(method: string, path: string) {
    const ts = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(12).toString('hex'); // <= 32 chars recommended  [oai_citation:2‡smsglobal.com](https://www.smsglobal.com/rest-api/)

    // Per SMSGlobal docs: ts\n nonce\n METHOD\n URI\n host\n port\n \n  (final blank line required)  [oai_citation:3‡smsglobal.com](https://www.smsglobal.com/rest-api/)
    const base = [
      ts,
      nonce,
      method.toUpperCase(),
      path,
      this.host,
      this.port.toString(),
      '', // optional extra data must be included as empty  [oai_citation:4‡smsglobal.com](https://www.smsglobal.com/rest-api/)
      '',
    ].join('\n');

    const mac = crypto
      .createHmac('sha256', this.secret)
      .update(base, 'utf8')
      .digest('base64');

    // Header format  [oai_citation:5‡smsglobal.com](https://www.smsglobal.com/rest-api/)
    return `MAC id="${this.key}", ts="${ts}", nonce="${nonce}", mac="${mac}"`;
  }

  async sendSms(destinationE164: string, message: string, origin?: string) {
    const path = '/v2/sms';

    const res = await fetch(`https://${this.host}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.macHeader('POST', path),
      },
      body: JSON.stringify({
        destination: destinationE164,
        message,
        ...(origin ? { origin } : {}),
      }),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || `SMSGlobal HTTP ${res.status}`);
    return text ? JSON.parse(text) : {};
  }
}
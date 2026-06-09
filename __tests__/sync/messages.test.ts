import {
  createWsMessage,
  encodeFrame,
  FrameDecoder,
} from '@/sync/messages';

describe('framing des messages WS/TCP', () => {
  it('encode un message avec un délimiteur de ligne', () => {
    const message = createWsMessage('PING', {}, 'ABC123');
    const frame = encodeFrame(message);

    expect(frame.endsWith('\n')).toBe(true);
    expect(JSON.parse(frame.trim()).type).toBe('PING');
  });

  it('décode plusieurs messages d un même chunk', () => {
    const decoder = new FrameDecoder();
    const a = encodeFrame(createWsMessage('PING', {}, 'S'));
    const b = encodeFrame(createWsMessage('PONG', {}, 'S'));

    const messages = decoder.push(a + b);

    expect(messages).toHaveLength(2);
    expect(messages[0].type).toBe('PING');
    expect(messages[1].type).toBe('PONG');
  });

  it('conserve un message fragmenté entre deux chunks', () => {
    const decoder = new FrameDecoder();
    const frame = encodeFrame(createWsMessage('JOIN', {pseudo: 'Bea'}, 'S'));
    const middle = Math.floor(frame.length / 2);

    expect(decoder.push(frame.slice(0, middle))).toHaveLength(0);
    const messages = decoder.push(frame.slice(middle));

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe('JOIN');
  });

  it('ignore une frame JSON malformée sans casser le flux', () => {
    const decoder = new FrameDecoder();
    const valide = encodeFrame(createWsMessage('PONG', {}, 'S'));

    const messages = decoder.push('{ ceci nest pas du json }\n' + valide);

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe('PONG');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from '../src/telegram/telegram.service';

describe('TelegramService (Unit & Edge Cases)', () => {
  let service: TelegramService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'TELEGRAM_BOT_TOKEN') return 'mock_token_123';
              if (key === 'TELEGRAM_CHAT_ID') return 'mock_chat_456';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TelegramService>(TelegramService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should detect when configured', () => {
    expect(service.isConfigured()).toBe(true);
  });

  it('should format and send order notification successfully', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ ok: true, result: {} }),
    } as any);

    const mockOrder = {
      id: 'ORD-12345',
      devoteeName: 'Ramanathan Iyer',
      email: 'ramanathan@example.com',
      phone: '+91 98401 11223',
      totalAmount: 4999,
      status: 'Confirmed',
      paymentMethod: 'UPI',
      shippingAddress: '42, North Mada Street, Mylapore, Chennai',
      items: [
        { name: 'Panchaloham Murugan Vel Pendant', quantity: 1, price: 4999 },
      ],
    };

    const sent = await service.sendOrderNotification(mockOrder);
    expect(sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/botmock_token_123/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('Edge Case: should properly escape HTML characters to prevent message injection', async () => {
    let capturedBody: any = null;
    jest.spyOn(global, 'fetch').mockImplementationOnce(async (_url, options: any) => {
      capturedBody = JSON.parse(options.body);
      return {
        json: async () => ({ ok: true }),
      } as any;
    });

    const mockOrderWithSpecialChars = {
      id: 'ORD-<TEST>&1',
      devoteeName: 'Ananya <script>alert("hack")</script> & Sons',
      email: 'ananya&test@example.com',
      phone: '+91 98400 <123>',
      totalAmount: 3500,
      status: 'Pending',
      paymentMethod: 'NetBanking & UPI',
      shippingAddress: '10, South Car St <Near Temple Gate> & Co',
      items: [
        { name: 'Vedic Ring <Gold & Silver>', quantity: 1, price: 3500 },
      ],
    };

    const sent = await service.sendOrderNotification(mockOrderWithSpecialChars);
    expect(sent).toBe(true);
    expect(capturedBody).toBeDefined();
    expect(capturedBody.text).toContain('&lt;script&gt;');
    expect(capturedBody.text).not.toContain('<script>');
    expect(capturedBody.text).toContain('&amp; Sons');
  });

  it('Edge Case: should format order status update with tracking number', async () => {
    let capturedBody: any = null;
    jest.spyOn(global, 'fetch').mockImplementationOnce(async (_url, options: any) => {
      capturedBody = JSON.parse(options.body);
      return {
        json: async () => ({ ok: true }),
      } as any;
    });

    const mockOrder = {
      id: 'ORD-98421',
      devoteeName: 'Suresh Narayanan',
      status: 'Shipped',
      trackingNumber: 'DTDC-998877-IN',
      totalAmount: 5798,
    };

    const sent = await service.sendOrderStatusUpdate(mockOrder, 'Consecrated');
    expect(sent).toBe(true);
    expect(capturedBody).toBeDefined();
    expect(capturedBody.text).toContain('Consecrated');
    expect(capturedBody.text).toContain('Shipped');
    expect(capturedBody.text).toContain('DTDC-998877-IN');
  });

  it('Edge Case: should safely handle network throw without throwing exception', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network offline or DNS error'));

    const sent = await service.sendOrderNotification({
      id: 'ORD-NET-ERR',
      devoteeName: 'Devotee',
      totalAmount: 1000,
    });
    expect(sent).toBe(false);
  });

  it('should safely handle API errors without throwing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        ok: false,
        description: 'Unauthorized: invalid token',
      }),
    } as any);

    const sent = await service.sendOrderNotification({ id: 'ORD-ERR' });
    expect(sent).toBe(false);
  });

  it('should handle unconfigured state gracefully', async () => {
    const unconfiguredModule = await Test.createTestingModule({
      providers: [
        TelegramService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(''),
          },
        },
      ],
    }).compile();

    const unconfiguredService =
      unconfiguredModule.get<TelegramService>(TelegramService);
    expect(unconfiguredService.isConfigured()).toBe(false);

    const result = await unconfiguredService.sendTestPing();
    expect(result.success).toBe(false);
    expect(result.message).toContain('missing or not set');
  });
});
